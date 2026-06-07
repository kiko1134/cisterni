import { subMinutes } from 'date-fns';

// ─── Настройки на резервоарите ────────────────────────────────────────────────
export const MOCK_TANKS_SETTINGS = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  name: `Резервоар ${i + 1}`,
  diameter: 3.0 + (i % 4) * 0.5,      // 3.0 / 3.5 / 4.0 / 4.5 m
  height: 5.0 + (i % 3) * 1.0,         // 5.0 / 6.0 / 7.0 m
  rel_weight: 820 + (i % 5) * 15,       // 820 – 880 kg/m³
  correction: 1.0,
  dead_volume: 0.10,
  limit_temp: 50,
  filter: 1,
  sens_plus: 0,
  sens_minus: 0,
}));

// ─── Помощна функция за генериране на едно измерване ─────────────────────────
function generateReading(tankId, time, levelPct) {
  const settings = MOCK_TANKS_SETTINGS[tankId - 1];
  const levelM = (levelPct / 100) * settings.height;
  const levelMm = levelM * 1000;
  const volume = (Math.PI * Math.pow(settings.diameter, 2) / 4) * (levelM + settings.dead_volume);
  const mass = settings.rel_weight * volume * settings.correction;
  const temperature = 18 + Math.sin(time / 3_600_000) * 4 + Math.random() * 1.5;

  return {
    time: new Date(time).toISOString(),
    tank_id: tankId,
    level_mm: parseFloat(levelMm.toFixed(1)),
    level_pct: parseFloat(levelPct.toFixed(2)),
    temperature: parseFloat(temperature.toFixed(2)),
    mass: parseFloat(mass.toFixed(1)),
    max_level_alarm: levelPct >= 95,
    min_level_alarm: levelPct <= 10,
    pressure_raw: parseFloat((levelM * 0.098).toFixed(4)),
  };
}

// ─── История за един резервоар (последните 24 ч, на всяка 1 мин = 1440 записа) ─
export function generateMockHistory(tankId, hours = 24) {
  const now = Date.now();
  const totalMinutes = hours * 60;
  const readings = [];

  // Начално ниво между 20% и 80%
  let level = 30 + (tankId * 7) % 50;

  for (let i = totalMinutes; i >= 0; i--) {
    // Бавна случайна промяна на нивото ±0.05% на минута
    level += (Math.random() - 0.495) * 0.1;
    level = Math.max(5, Math.min(98, level));

    readings.push(generateReading(tankId, now - i * 60_000, level));
  }

  return readings;
}

// ─── Текущи стойности за всички 16 резервоара ────────────────────────────────
export const MOCK_CURRENT_TANKS = Array.from({ length: 16 }, (_, i) => {
  const tankId = i + 1;
  const levelPct = 15 + (i * 13) % 80;
  const reading = generateReading(tankId, Date.now(), levelPct);

  // Изкуствени аларми за демо
  if (tankId === 3) reading.max_level_alarm = true;
  if (tankId === 7) reading.min_level_alarm = true;
  if (tankId === 11) reading.temperature = 52;

  return {
    ...reading,
    ...MOCK_TANKS_SETTINGS[i],
    id: tankId,
  };
});

// ─── Статистика по резервоар ──────────────────────────────────────────────────
export const MOCK_STATS = Array.from({ length: 16 }, (_, i) => ({
  tank_id: i + 1,
  tank_name: `Р${i + 1}`,
  total_in: Math.round(10000 + Math.random() * 50000),
  total_out: Math.round(5000 + Math.random() * 40000),
  avg_level_pct: parseFloat((20 + Math.random() * 60).toFixed(1)),
  avg_temp: parseFloat((18 + Math.random() * 10).toFixed(1)),
}));