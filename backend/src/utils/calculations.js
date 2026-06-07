/**
 * Изчислява маса и процент от 32-bit ниво (mm) и настройки на резервоара.
 *
 * @param {number} levelMm   — измерено ниво в mm (32-bit стойност от PLC)
 * @param {object} tank      — ред от таблица tanks
 * @returns {{ level_pct, mass }}
 */
function calculateMeasurements(levelMm, tank) {
  const { diameter, height, rel_weight, correction, dead_volume, sens_plus, sens_minus } = tank;

  // Корекция на сензора
  const correctedMm = levelMm + (sens_plus || 0) - (sens_minus || 0);
  const levelM = correctedMm / 1000;

  // % запълване (0–100)
  const level_pct = Math.min(Math.max((levelM / height) * 100, 0), 100);

  // Маса = ρ × V × корекция
  const area   = Math.PI * Math.pow(diameter, 2) / 4; // m²
  const volume = area * (levelM + (dead_volume || 0)); // m³
  const mass   = rel_weight * volume * correction;     // kg

  return {
    level_pct: parseFloat(level_pct.toFixed(2)),
    mass:      parseFloat(mass.toFixed(1)),
  };
}

module.exports = { calculateMeasurements };