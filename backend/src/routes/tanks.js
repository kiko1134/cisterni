const router = require('express').Router();
const pool   = require('../db');

router.get('/current', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (m.tank_id)
        m.time,
        m.tank_id        AS id,
        t.name,
        t.diameter,
        t.height,
        t.rel_weight,
        t.limit_temp,
        m.level_mm,
        m.level_pct,
        m.temperature,
        m.mass,
        m.max_level_alarm,
        m.min_level_alarm
      FROM measurements m
      JOIN tanks t ON t.id = m.tank_id
      ORDER BY m.tank_id, m.time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /tanks/current:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;