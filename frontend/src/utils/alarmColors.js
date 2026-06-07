// Цветова индикация по т.9.1 от плана
export const ALARM_COLORS = {
  normal: '#4caf50',       // 🟢 нормално
  maxLevel: '#f44336',     // 🔴 максимално ниво
  minLevel: '#ffeb3b',     // 🟡 минимално ниво
  highTemp: '#ff9800',     // 🟠 висока температура
};

export function getTankStatus(tank) {
  if (tank.max_level_alarm) return 'maxLevel';
  if (tank.temperature >= tank.limit_temp) return 'highTemp';
  if (tank.min_level_alarm) return 'minLevel';
  return 'normal';
}