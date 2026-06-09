const router = require('express').Router();
const pool   = require('../db');

// ?from=ISO&to=ISO&limit=1440
router.get('/:id/history', async (req, res) => {
  const { id } = req.params;
  const { from, to, limit = 1440 } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Параметрите from и to са задължителни' });
  }

  try {
    const fromDate  = new Date(from);
    const toDate    = new Date(to);
    const hoursRange = (toDate - fromDate) / 3_600_000;

    // За дълги периоди — разреждаме данните с DATE_TRUNC за производителност
    let query;
    if (hoursRange <= 24) {
      // До 24ч → всички записи
      query = `
        SELECT time, tank_id, level_mm, level_pct, temperature, mass,
               max_level_alarm, min_level_alarm, overheat_alarm
        FROM measurements
        WHERE tank_id = $1 AND time BETWEEN $2 AND $3
        ORDER BY time ASC
        LIMIT $4
      `;
    } else if (hoursRange <= 168) {
      // До 7 дни → 1 запис на 5 минути (AVG)
      query = `
        SELECT
          DATE_TRUNC('minute', time) - 
            (EXTRACT(minute FROM time)::int % 5) * INTERVAL '1 minute' AS time,
          tank_id,
          AVG(level_mm)::DOUBLE PRECISION    AS level_mm,
          AVG(level_pct)::DOUBLE PRECISION   AS level_pct,
          AVG(temperature)::DOUBLE PRECISION AS temperature,
          AVG(mass)::DOUBLE PRECISION        AS mass,
          BOOL_OR(max_level_alarm)           AS max_level_alarm,
          BOOL_OR(min_level_alarm)           AS min_level_alarm,
          BOOL_OR(overheat_alarm)            AS overheat_alarm
        FROM measurements
        WHERE tank_id = $1 AND time BETWEEN $2 AND $3
        GROUP BY 1, 2
        ORDER BY time ASC
        LIMIT $4
      `;
    } else {
      // До 2 години → 1 запис на 30 минути
      query = `
        SELECT
          DATE_TRUNC('minute', time) - 
            (EXTRACT(minute FROM time)::int % 30) * INTERVAL '1 minute' AS time,
          tank_id,
          AVG(level_mm)::DOUBLE PRECISION    AS level_mm,
          AVG(level_pct)::DOUBLE PRECISION   AS level_pct,
          AVG(temperature)::DOUBLE PRECISION AS temperature,
          AVG(mass)::DOUBLE PRECISION        AS mass,
          BOOL_OR(max_level_alarm)           AS max_level_alarm,
          BOOL_OR(min_level_alarm)           AS min_level_alarm,
          BOOL_OR(overheat_alarm)            AS overheat_alarm
        FROM measurements
        WHERE tank_id = $1 AND time BETWEEN $2 AND $3
        GROUP BY 1, 2
        ORDER BY time ASC
        LIMIT $4
      `;
    }

    const { rows } = await pool.query(query, [id, from, to, parseInt(limit)]);
    res.json(rows);
  } catch (err) {
    console.error('GET /tanks/:id/history:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;