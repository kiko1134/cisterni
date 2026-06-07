require('dotenv').config();
const { Client } = require('pg');
const pool = require('./index');

// Създава базата данни (ако липсва), като се свързва към служебната БД "postgres".
async function ensureDatabase() {
  const target = process.env.DB_NAME || 'cisterni';
  const admin = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  await admin.connect();
  try {
    const { rowCount } = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [target]
    );
    if (rowCount === 0) {
      await admin.query(`CREATE DATABASE "${target}"`);
      console.log(`✅ Създадена база данни "${target}"`);
    }
  } finally {
    await admin.end();
  }
}

// Създава таблиците и началните данни (идемпотентно — безопасно е да се пуска многократно).
async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('▶ Starting migration...');

    // Настройки на резервоарите
    await client.query(`
      CREATE TABLE IF NOT EXISTS tanks (
        id            SMALLINT          PRIMARY KEY,
        name          TEXT              NOT NULL DEFAULT '',
        diameter      DOUBLE PRECISION  NOT NULL DEFAULT 3.0,
        height        DOUBLE PRECISION  NOT NULL DEFAULT 5.0,
        rel_weight    DOUBLE PRECISION  NOT NULL DEFAULT 850,
        correction    DOUBLE PRECISION  NOT NULL DEFAULT 1.0,
        dead_volume   DOUBLE PRECISION  NOT NULL DEFAULT 0.10,
        limit_temp    DOUBLE PRECISION  NOT NULL DEFAULT 50,
        filter        DOUBLE PRECISION  NOT NULL DEFAULT 1.0,
        sens_plus     DOUBLE PRECISION  NOT NULL DEFAULT 0,
        sens_minus    DOUBLE PRECISION  NOT NULL DEFAULT 0
      );
    `);

    // Seed — 16 резервоара
    await client.query(`
      INSERT INTO tanks (id, name)
      SELECT g, 'Резервоар ' || g
      FROM generate_series(1, 16) AS g
      ON CONFLICT (id) DO NOTHING;
    `);

    // Измервания
    await client.query(`
      CREATE TABLE IF NOT EXISTS measurements (
        id                BIGSERIAL         PRIMARY KEY,
        time              TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
        tank_id           SMALLINT          NOT NULL REFERENCES tanks(id),
        level_mm          DOUBLE PRECISION,
        level_pct         DOUBLE PRECISION,
        temperature       DOUBLE PRECISION,
        mass              DOUBLE PRECISION,
        max_level_alarm   BOOLEAN           DEFAULT FALSE,
        min_level_alarm   BOOLEAN           DEFAULT FALSE,
        overheat_alarm    BOOLEAN           DEFAULT FALSE
      );
    `);

    // Гарантира колоната overheat_alarm и при по-стари бази
    await client.query(`
      ALTER TABLE measurements
      ADD COLUMN IF NOT EXISTS overheat_alarm BOOLEAN DEFAULT FALSE;
    `);

    // Индекс за бързи заявки
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_meas_tank_time
        ON measurements (tank_id, time DESC);
    `);

    console.log('✅ Migration complete!');
  } finally {
    client.release();
  }
}

// Свързва двете стъпки — използва се при стартиране на приложението.
async function initDatabase() {
  await ensureDatabase();
  await runMigration();
}

// Пуска се самостоятелно чрез `npm run migrate`.
if (require.main === module) {
  initDatabase()
    .catch((err) => {
      console.error('❌ Migration error:', err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { ensureDatabase, runMigration, initDatabase };
