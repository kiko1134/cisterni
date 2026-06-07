require('dotenv').config();
const path    = require('path');
const fs      = require('fs');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const cron    = require('node-cron');
const pool    = require('./db');

const tanksRoute    = require('./routes/tanks');
const historyRoute  = require('./routes/history');
const statsRoute    = require('./routes/stats');
const settingsRoute = require('./routes/settings');
const { startCollector } = require('./modbus/collector');
const { initDatabase } = require('./db/migrate');

const app  = express();
const PORT = process.env.PORT || 4000;

// contentSecurityPolicy: false — иначе helmet блокира стиловете на MUI при production билда.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// API
app.use('/api/tanks', tanksRoute);
app.use('/api/tanks', historyRoute);
app.use('/api/tanks', statsRoute);
app.use('/api/tanks', settingsRoute);

// ── Сервиране на готовия frontend (production билд) ──────────────────────────
// Ако frontend/dist съществува, приложението се отваря на същия порт като API-то.
const clientDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback — всички не-API GET заявки връщат index.html
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// ── Почистване на стари данни (всяка нощ в 02:00) ────────────────────────────
cron.schedule('0 2 * * *', async () => {
  try {
    const result = await pool.query(
      "DELETE FROM measurements WHERE time < NOW() - INTERVAL '2 years'"
    );
    console.log(`[CLEANUP] Изтрити ${result.rowCount} стари записа`);
  } catch (err) {
    console.error('[CLEANUP] Грешка:', err.message);
  }
});

// ── Стартиране ───────────────────────────────────────────────────────────────
// Първо подготвя базата (създава я + таблиците при нужда), после вдига сървъра.
async function start() {
  try {
    await initDatabase();
  } catch (err) {
    console.error('❌ Грешка при подготовка на базата данни:', err.message);
    console.warn('⚠ Сървърът ще стартира, но проверете настройките в .env (DB_*).');
  }

  app.listen(PORT, () => {
    console.log(`✅ Приложението работи на http://localhost:${PORT}`);
    startCollector();
  });
}

start();