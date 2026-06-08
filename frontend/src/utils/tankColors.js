// Цвят на течността (водната анимация) за всеки резервоар.
const WATER_COLORS = {
  1: '#000000', // Black
  2: '#000000',
  3: '#000000',
  4: '#000000',
  5: '#ffff00', // Yellow (255,255,0)
  6: '#ffff00',
  7: '#c0c0c0', // Light grey (192,192,192)
  8: '#c0c0c0',
  9: '#7f5f3f', // Brown (127,95,63)
  10: '#7f5f3f',
  11: '#7f5f3f',
  12: '#7f5f3f',
  13: '#00ffff', // Blue / cyan (0,255,255)
  14: '#00ffff',
  15: '#00ffff',
  16: '#00ffff',
};

const DEFAULT_WATER = '#4fc3f7';

export const getTankWaterColor = (id) => WATER_COLORS[id] || DEFAULT_WATER;
