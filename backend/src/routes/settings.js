const router = require('express').Router();
const pool   = require('../db');

router.get('/:id/settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tanks WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id/settings', async (req, res) => {
  const { id } = req.params;
  const { name, diameter, height, rel_weight, correction,
          dead_volume, limit_temp, filter, sens_plus, sens_minus } = req.body;

  if (!diameter || !height || !rel_weight) {
    return res.status(400).json({ error: 'Диаметър, Височина и Относително тегло са задължителни' });
  }

  try {
    const { rows } = await pool.query(`
      UPDATE tanks SET
        name        = COALESCE($2,  name),
        diameter    = $3,
        height      = $4,
        rel_weight  = $5,
        correction  = COALESCE($6,  correction),
        dead_volume = COALESCE($7,  dead_volume),
        limit_temp  = COALESCE($8,  limit_temp),
        filter      = COALESCE($9,  filter),
        sens_plus   = COALESCE($10, sens_plus),
        sens_minus  = COALESCE($11, sens_minus)
      WHERE id = $1
      RETURNING *
    `, [id, name, diameter, height, rel_weight,
        correction, dead_volume, limit_temp, filter, sens_plus, sens_minus]);

    if (!rows.length) return res.status(404).json({ error: 'Не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /tanks/:id/settings:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;