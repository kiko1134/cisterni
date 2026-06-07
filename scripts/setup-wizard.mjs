// Interactive setup: asks a few questions and writes backend/.env (no manual editing).
import { readFile, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output, platform } from 'node:process';

const here = dirname(fileURLToPath(import.meta.url));
const backendDir = join(here, '..', 'backend');
const envPath = join(backendDir, '.env');
const examplePath = join(backendDir, '.env.example');

const rl = createInterface({ input, output });

async function ask(question, def) {
  const suffix = def ? ` [${def}]` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || def || '';
}

async function fileExists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Replaces "KEY=..." in the .env text (or appends it if missing).
function setKey(text, key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm');
  return re.test(text) ? text.replace(re, `${key}=${value}`) : `${text}\n${key}=${value}`;
}

async function main() {
  console.log('\n=== Cisterni — setup ===\n');

  if (await fileExists(envPath)) {
    const again = (await ask('backend/.env already exists. Reconfigure it? (y/N)', 'N')).toLowerCase();
    if (again !== 'y') {
      console.log('✔ Keeping the existing configuration.\n');
      return;
    }
  }

  let text = await readFile(examplePath, 'utf8');

  // --- Database ---
  const dbPass = await ask('PostgreSQL password (the one you set when installing PostgreSQL)', 'postgres');
  text = setKey(text, 'DB_PASSWORD', dbPass);

  // --- PLC connection ---
  const choice = await ask('How is the PLC connected?  1) USB cable   2) Ethernet', '1');
  const mode = choice.trim() === '2' || /eth|tcp/i.test(choice) ? 'tcp' : 'rtu';
  text = setKey(text, 'MODBUS_MODE', mode);

  if (mode === 'tcp') {
    const host = await ask('PLC IP address', '192.168.0.5'); // Delta DVP-12SE default
    const tcpPort = await ask('Modbus TCP port', '502');
    text = setKey(text, 'MODBUS_HOST', host);
    text = setKey(text, 'MODBUS_TCP_PORT', tcpPort);
    console.log(`\n  → Ethernet mode. Make sure you can ping ${host} first.`);
  } else {
    const defPort =
      platform === 'win32' ? 'COM3' : platform === 'darwin' ? '/dev/cu.usbserial' : '/dev/ttyUSB0';
    const port = await ask('Serial port (Windows: COM3, Linux: /dev/ttyUSB0)', defPort);
    text = setKey(text, 'MODBUS_PORT', port);
  }

  await writeFile(envPath, text, 'utf8');

  console.log('\n✔ Saved backend/.env');
  console.log('  Next: run "npm start" (or double-click the start script),');
  console.log('  then open http://localhost:4000\n');
}

main()
  .catch((err) => {
    console.error('Setup failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
