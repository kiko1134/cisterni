// Copies backend/.env.example -> backend/.env on first setup (cross-platform).
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, '..', 'backend', '.env');
const examplePath = join(here, '..', 'backend', '.env.example');

if (existsSync(envPath)) {
  console.log('✔ backend/.env already exists — keeping it.');
} else {
  copyFileSync(examplePath, envPath);
  console.log('✔ Created backend/.env from .env.example.');
  console.log('  → Edit backend/.env: set MODBUS_PORT (e.g. COM3) and DB_PASSWORD, then run: npm start');
}
