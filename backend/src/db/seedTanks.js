// Принудително прилага фабричните диаметър/височина към всички резервоари.
// Използвай при нужда: `npm run seed:tanks`
// ВНИМАНИЕ: презаписва ръчно зададени диаметър/височина с тези от tankDefaults.js.
require('dotenv').config();
const pool = require('./index');
const TANK_DEFAULTS = require('./tankDefaults');

async function seedTanks() {
  for (const t of TANK_DEFAULTS) {
    await pool.query('UPDATE tanks SET diameter = $2, height = $3 WHERE id = $1', [
      t.id,
      t.diameter,
      t.height,
    ]);
  }
  console.log(`✅ Приложени диаметър/височина за ${TANK_DEFAULTS.length} резервоара.`);
}

seedTanks()
  .catch((err) => {
    console.error('❌ seed:tanks error:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
