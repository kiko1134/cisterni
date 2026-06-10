require('dotenv').config();
const pool = require('./index');

// Изчиства само измерванията (историята) и нулира кумулативните броячи,
// като ЗАПАЗВА настройките на резервоарите (диаметър, височина, калибровка и т.н.).
async function resetData() {
  const client = await pool.connect();
  try {
    console.log('▶ Изчистване на измерванията...');
    // TRUNCATE е по-бързо от DELETE и нулира BIGSERIAL id брояча.
    await client.query('TRUNCATE TABLE measurements RESTART IDENTITY;');

    console.log('▶ Нулиране на постъпил/изразходван материал...');
    await client.query('UPDATE tanks SET entered_material = 0, used_material = 0;');

    console.log('✅ Готово — историята е изтрита, настройките на резервоарите са запазени.');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  resetData()
    .catch((err) => {
      console.error('❌ Грешка при изчистване:', err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { resetData };
