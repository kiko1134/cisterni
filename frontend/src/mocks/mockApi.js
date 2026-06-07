import {
  MOCK_CURRENT_TANKS,
  MOCK_STATS,
  MOCK_TANKS_SETTINGS,
  generateMockHistory,
} from './mockData';

// Симулира забавяне на мрежата
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export const mockApi = {
  // GET /api/tanks/current
  fetchTanksCurrent: async () => {
    await delay();
    return MOCK_CURRENT_TANKS;
  },

  // GET /api/tanks/:id/history
  fetchTankHistory: async (id, from, to) => {
    await delay(600);
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    const hoursRange = Math.ceil((toTime - fromTime) / 3_600_000);
    const allData = generateMockHistory(Number(id), Math.min(hoursRange, 720));

    return allData.filter((r) => {
      const t = new Date(r.time).getTime();
      return t >= fromTime && t <= toTime;
    });
  },

  // GET /api/tanks/stats
  fetchTankStats: async () => {
    await delay(500);
    return MOCK_STATS;
  },

  // GET /api/tanks/:id/settings
  fetchTankSettings: async (id) => {
    await delay(300);
    return MOCK_TANKS_SETTINGS[Number(id) - 1];
  },

  // PUT /api/tanks/:id/settings
  updateTankSettings: async (id, data) => {
    await delay(400);
    Object.assign(MOCK_TANKS_SETTINGS[Number(id) - 1], data);
    return { success: true };
  },
};