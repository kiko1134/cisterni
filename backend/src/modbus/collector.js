require('dotenv').config();
const ModbusRTU = require('modbus-serial');
const pool = require('../db');

const modbusClient = new ModbusRTU();

const NUM_TANKS = 16;

// Delta PLC D-registers over Modbus usually start from holding-register offset 4096.
// Example: D800 => 4096 + 800 = 4896.
const MODBUS_ADDRESS_OFFSET = parseInt(process.env.MODBUS_ADDRESS_OFFSET || '4096', 10);

// PLC register map, without the Modbus offset.
const REG_MASS_BASE = parseInt(process.env.REG_MASS_BASE || '800', 10);       // D800..D831, 2 words per tank
const REG_TEMPS_BASE = parseInt(process.env.REG_TEMPS_BASE || '832', 10);     // D832..D847, 1 word per tank
const REG_ALARM_LOW = parseInt(process.env.REG_ALARM_LOW || '848', 10);       // D848, bit 0..15
const REG_ALARM_HIGH = parseInt(process.env.REG_ALARM_HIGH || '849', 10);     // D849, bit 0..15
const REG_OVERHEAT = parseInt(process.env.REG_OVERHEAT || '850', 10);         // D850, bit 0..15

// Ниво (0..100) идва ДИРЕКТНО от PLC: D620, D622, ... D650 (стъпка 2, по 1 дума/резервоар).
// Нивото е FLOAT32 (2 думи/резервоар, напр. 12.4), затова стъпката е 2.
const REG_LEVEL_BASE = parseInt(process.env.REG_LEVEL_BASE || '620', 10);
const LEVEL_STEP = 2;
const LEVEL_COUNT = NUM_TANKS * LEVEL_STEP; // 16 × 2 думи => 32 регистъра (D620..D651)

const FIRST_REGISTER = REG_MASS_BASE;
const LAST_REGISTER = REG_OVERHEAT;
const TOTAL_REGS = LAST_REGISTER - FIRST_REGISTER + 1; // 800..850 inclusive => 51 registers

const MASS_SCALE = parseFloat(process.env.MODBUS_MASS_SCALE || '1');          
const TEMPERATURE_SCALE = parseFloat(process.env.MODBUS_TEMPERATURE_SCALE || '1');
const WORD_ORDER = (process.env.MODBUS_32BIT_WORD_ORDER || 'LOW_HIGH').toUpperCase();

function holdingAddress(plcRegister) {
  return MODBUS_ADDRESS_OFFSET + plcRegister;
}

function regIndex(plcRegister) {
  return plcRegister - FIRST_REGISTER;
}

function toSigned16(value) {
  return value > 32767 ? value - 65536 : value;
}

function combineWordsToUInt32(firstWord, secondWord) {
  const w1 = firstWord & 0xFFFF;
  const w2 = secondWord & 0xFFFF;

  if (WORD_ORDER === 'HIGH_LOW') {
    return (w1 * 65536) + w2;
  }

  // Default: LOW_HIGH => first PLC word is low word, second PLC word is high word.
  return (w2 * 65536) + w1;
}

function calculateLevelFromMassKg(massKg, tank) {
  const diameter = Number(tank.diameter) || 0;
  const height = Number(tank.height) || 0;
  const relWeight = Number(tank.rel_weight) || 0;
  const correction = Number(tank.correction) || 1;
  const deadVolume = Number(tank.dead_volume) || 0;
  const sensPlus = Number(tank.sens_plus) || 0;
  const sensMinus = Number(tank.sens_minus) || 0;

  if (diameter <= 0 || height <= 0 || relWeight <= 0 || correction <= 0) {
    return { level_mm: null, level_pct: null };
  }

  const area = Math.PI * Math.pow(diameter, 2) / 4;
  const volumeM3 = massKg / (relWeight * correction);
  const levelM = Math.max(volumeM3 / area - deadVolume, 0);
  const levelMm = Math.max(levelM * 1000 + sensPlus - sensMinus, 0);
  const levelPct = Math.min(Math.max((levelM / height) * 100, 0), 100);

  return {
    level_mm: parseFloat(levelMm.toFixed(1)),
    level_pct: parseFloat(levelPct.toFixed(2)),
  };
}

function normalizeParity(value) {
  const p = String(value || 'none').toLowerCase();
  if (p === 'n') return 'none';
  if (p === 'e') return 'even';
  if (p === 'o') return 'odd';
  return p;
}

async function getTankSettings() {
  const { rows } = await pool.query('SELECT * FROM tanks ORDER BY id');
  return rows;
}

async function ensureOverheatColumnExists() {
  await pool.query(`
    ALTER TABLE measurements
    ADD COLUMN IF NOT EXISTS overheat_alarm BOOLEAN DEFAULT FALSE;
  `);
}

async function saveReadings(readings) {
  if (!readings.length) return;

  const placeholders = readings.map((_, i) => {
    const b = i * 9;
    return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7}, $${b + 8}, $${b + 9})`;
  }).join(', ');

  const params = readings.flatMap(r => [
    r.time,
    r.tank_id,
    r.level_mm,
    r.level_pct,
    r.temperature,
    r.mass,
    r.max_level_alarm,
    r.min_level_alarm,
    r.overheat_alarm,
  ]);

  await pool.query(
    `INSERT INTO measurements
       (time, tank_id, level_mm, level_pct, temperature, mass,
        max_level_alarm, min_level_alarm, overheat_alarm)
     VALUES ${placeholders}`,
    params
  );
}

async function collectOnce() {
  const tanks = await getTankSettings();
  const now = new Date();

  if (tanks.length < NUM_TANKS) {
    console.warn(`⚠ Намерени са само ${tanks.length} резервоара в DB. Очаквани: ${NUM_TANKS}.`);
  }

  const startAddress = holdingAddress(FIRST_REGISTER);
  const data = await modbusClient.readHoldingRegisters(startAddress, TOTAL_REGS);
  const regs = data.data;

  // Ниво (0..100) — отделен блок D620..D650 (PLC го дава директно, не се изчислява).
  const levelData = await modbusClient.readHoldingRegisters(holdingAddress(REG_LEVEL_BASE), LEVEL_COUNT);
  const levelRegs = levelData.data;

  // ---- RAW PLC DUMP ---------------------------------------------------------
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`📡 RAW PLC READ @ ${now.toISOString()}`);
  console.log(`   Modbus start addr: ${startAddress} (PLC D${FIRST_REGISTER}), count: ${TOTAL_REGS}`);
  console.log(`   Word order: ${WORD_ORDER} | mass scale: ${MASS_SCALE} | temp scale: ${TEMPERATURE_SCALE}`);
  // Print every register as: PLC reg => raw value (hex)
  console.log('   Registers (PLC D-reg = decimal / 0xHEX):');
  for (let idx = 0; idx < regs.length; idx++) {
    const plcReg = FIRST_REGISTER + idx;
    const v = regs[idx];
    console.log(`     D${plcReg} [i=${idx}] = ${String(v).padStart(6)}  0x${(v & 0xffff).toString(16).padStart(4, '0')}`);
  }
  // ---------------------------------------------------------------------------

  const minLevelWord = regs[regIndex(REG_ALARM_LOW)];
  const maxLevelWord = regs[regIndex(REG_ALARM_HIGH)];
  const overheatWord = regs[regIndex(REG_OVERHEAT)];

  console.log('\n   Alarm words:');
  console.log(`     min-level (D${REG_ALARM_LOW}) = 0x${(minLevelWord & 0xffff).toString(16).padStart(4, '0')}  bits=${(minLevelWord & 0xffff).toString(2).padStart(16, '0')}`);
  console.log(`     max-level (D${REG_ALARM_HIGH}) = 0x${(maxLevelWord & 0xffff).toString(16).padStart(4, '0')}  bits=${(maxLevelWord & 0xffff).toString(2).padStart(16, '0')}`);
  console.log(`     overheat  (D${REG_OVERHEAT}) = 0x${(overheatWord & 0xffff).toString(16).padStart(4, '0')}  bits=${(overheatWord & 0xffff).toString(2).padStart(16, '0')}`);
  console.log('\n   Per-tank decode:');

  const readings = tanks.slice(0, NUM_TANKS).map((tank, i) => {
    const massWordIndex = regIndex(REG_MASS_BASE + i * 2);
    const massPlcReg = REG_MASS_BASE + i * 2;
    const w1 = regs[massWordIndex];
    const w2 = regs[massWordIndex + 1];

    const rawMass = combineWordsToFloat32(w1, w2);

    const massKg = parseFloat((rawMass * MASS_SCALE).toFixed(2));

    const tempPlcReg = REG_TEMPS_BASE + i;
    const rawTemp = regs[regIndex(REG_TEMPS_BASE + i)];
    const temperature = parseFloat((toSigned16(rawTemp) * TEMPERATURE_SCALE).toFixed(2));

    const minAlarm = !!((minLevelWord >> i) & 1);
    const maxAlarm = !!((maxLevelWord >> i) & 1);
    const overheatAlarm = !!((overheatWord >> i) & 1);

    // Ниво — директно от PLC като FLOAT32 (2 думи, %), без изчисление от масата.
    const levelPlcReg = REG_LEVEL_BASE + i * LEVEL_STEP;
    const lw1 = levelRegs[i * LEVEL_STEP];
    const lw2 = levelRegs[i * LEVEL_STEP + 1];
    const rawLevel = combineWordsToFloat32(lw1, lw2);
    const level_pct = parseFloat(Math.min(Math.max(rawLevel, 0), 100).toFixed(1));
    const heightM = Number(tank.height) || 0;
    const level_mm = heightM > 0
      ? parseFloat(((level_pct / 100) * heightM * 1000).toFixed(1))
      : null;

    console.log(
      `     Tank #${String(i + 1).padStart(2)} (id=${tank.id}, "${tank.name ?? ''}")\n` +
      `        mass : D${massPlcReg}=0x${(w1 & 0xffff).toString(16).padStart(4, '0')} D${massPlcReg + 1}=0x${(w2 & 0xffff).toString(16).padStart(4, '0')} => float32=${rawMass} => ${massKg} kg\n` +
      `        temp : D${tempPlcReg}=${rawTemp} (signed ${toSigned16(rawTemp)}) => ${temperature} °C\n` +
      `        level: D${levelPlcReg}=${rawLevel} => ${level_pct} % (${level_mm} mm)\n` +
      `        alarm: min=${minAlarm} max=${maxAlarm} overheat=${overheatAlarm}`
    );

    return {
      time: now.toISOString(),
      tank_id: tank.id,
      level_mm,
      level_pct,
      temperature,
      mass: massKg,
      max_level_alarm: maxAlarm,
      min_level_alarm: minAlarm,
      overheat_alarm: overheatAlarm,
    };
  });

  await saveReadings(readings);
  console.log(`[${now.toISOString()}] ✅ Записани ${readings.length} измервания от PLC`);

  return readings;
}

function combineWordsToFloat32(firstWord, secondWord) {
  const buffer = Buffer.alloc(4);

  const w1 = firstWord & 0xFFFF;
  const w2 = secondWord & 0xFFFF;

  if (WORD_ORDER === 'HIGH_LOW') {
    buffer.writeUInt16BE(w1, 0);
    buffer.writeUInt16BE(w2, 2);
  } else {
    buffer.writeUInt16BE(w2, 0);
    buffer.writeUInt16BE(w1, 2);
  }

  return buffer.readFloatBE(0);
}

async function startCollector() {
  try {
    await ensureOverheatColumnExists();

    const mode = (process.env.MODBUS_MODE || 'rtu').toLowerCase();

    if (mode === 'tcp') {
      // Ethernet / Modbus TCP — PLC по IP адрес, порт 502.
      const host = process.env.MODBUS_HOST;
      const tcpPort = parseInt(process.env.MODBUS_TCP_PORT || '502', 10);
      await modbusClient.connectTCP(host, { port: tcpPort });
      console.log(`✅ MODBUS TCP свързан: ${host}:${tcpPort}, slave ID ${process.env.MODBUS_ID || '1'}`);
    } else {
      // Сериен / Modbus RTU през USB.
      await modbusClient.connectRTUBuffered(process.env.MODBUS_PORT, {
        baudRate: parseInt(process.env.MODBUS_BAUD || '115200', 10),
        parity: normalizeParity(process.env.MODBUS_PARITY || 'none'),
        dataBits: parseInt(process.env.MODBUS_DATA_BITS || '8', 10),
        stopBits: parseInt(process.env.MODBUS_STOP_BITS || '1', 10),
      });
      console.log(`✅ MODBUS RTU свързан: ${process.env.MODBUS_PORT}, 115200/8N1, slave ID ${process.env.MODBUS_ID || '1'}`);
    }

    modbusClient.setID(parseInt(process.env.MODBUS_ID || '1', 10));
    modbusClient.setTimeout(parseInt(process.env.MODBUS_TIMEOUT || '3000', 10));

    console.log(
      `ℹ Четене: PLC D${FIRST_REGISTER}..D${LAST_REGISTER} => Modbus ${startAddressLabel()} count ${TOTAL_REGS}`
    );

    await collectOnce();

    const interval = parseInt(process.env.COLLECT_INTERVAL_MS || '60000', 10);

    setInterval(async () => {
      try {
        await collectOnce();
      } catch (err) {
        console.error('❌ Collect error:', err.message);
      }
    }, interval);
  } catch (err) {
    console.error('❌ MODBUS connection failed:');
    console.error('   message:', JSON.stringify(err && err.message));
    console.error('   code   :', err && err.code);
    console.error('   errno  :', err && err.errno);
    console.error('   full   :', err);
    console.warn('⚠ Collector не е стартиран. API работи без PLC данни.');
  }
}

function startAddressLabel() {
  return `${holdingAddress(FIRST_REGISTER)}..${holdingAddress(LAST_REGISTER)}`;
}

module.exports = {
  startCollector,
  collectOnce,
};