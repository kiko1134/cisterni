const router = require('express').Router();
const pool   = require('../db');

router.get('/stats', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Параметрите from и to са задължителни' });
  }

  try {
    const { rows } = await pool.query(`
      WITH first_last AS (
        SELECT DISTINCT ON (tank_id)
          tank_id,
          FIRST_VALUE(mass) OVER w AS mass_start,
          LAST_VALUE(mass)  OVER w AS mass_end
        FROM measurements
        WHERE time BETWEEN $1 AND $2
        WINDOW w AS (PARTITION BY tank_id ORDER BY time
                     ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
      ),
      averages AS (
        SELECT
          tank_id,
          AVG(level_pct)   AS avg_level_pct,
          AVG(temperature) AS avg_temp
        FROM measurements
        WHERE time BETWEEN $1 AND $2
        GROUP BY tank_id
      )
      SELECT
        t.id                                           AS tank_id,
        t.name                                         AS tank_name,
        GREATEST(fl.mass_end - fl.mass_start, 0)       AS total_in,
        GREATEST(fl.mass_start - fl.mass_end, 0)       AS total_out,
        ROUND(av.avg_level_pct::NUMERIC, 1)            AS avg_level_pct,
        ROUND(av.avg_temp::NUMERIC, 1)                 AS avg_temp
      FROM tanks t
      LEFT JOIN first_last fl ON fl.tank_id = t.id
      LEFT JOIN averages   av ON av.tank_id = t.id
      ORDER BY t.id
    `, [from, to]);

    res.json(rows);
  } catch (err) {
    console.error('GET /tanks/stats:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;