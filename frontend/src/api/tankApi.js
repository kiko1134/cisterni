import axios from 'axios';
import { mockApi } from '../mocks/mockApi';

// ─── Превключи на false когато backend е готов ────────────────────────────────
const USE_MOCK = false;

const api = axios.create({
  baseURL: '/api',
  timeout: 10_000,
});

// Бекендът съхранява масата в kg. UI-то я показва в тонове → делим на 1000.
const KG_PER_TON = 1000;
const massToTons = (row) =>
  row && row.mass != null ? { ...row, mass: Number(row.mass) / KG_PER_TON } : row;
const massListToTons = (rows) => (Array.isArray(rows) ? rows.map(massToTons) : rows);

export const fetchTanksCurrent = () =>
  (USE_MOCK ? mockApi.fetchTanksCurrent() : api.get('/tanks/current').then((r) => r.data)).then(
    massListToTons
  );

export const fetchTankHistory = (id, from, to) =>
  (USE_MOCK
    ? mockApi.fetchTankHistory(id, from, to)
    : api.get(`/tanks/${id}/history`, { params: { from, to } }).then((r) => r.data)
  ).then(massListToTons);

// export const fetchTankStats = (from, to) =>
//   USE_MOCK ? mockApi.fetchTankStats(from, to) : api.get('/tanks/stats', { params: { from, to } }).then((r) => r.data);

  export const fetchTankStats = (from, to) =>
  USE_MOCK
    ? mockApi.fetchTankStats(from, to)
    : api.get('/tanks/stats', { params: { from, to } }).then((r) =>
        r.data.map((item) => ({
          ...item,
          tank_id: Number(item.tank_id),
          total_in: Number(item.total_in ?? 0) / KG_PER_TON,
          total_out: Number(item.total_out ?? 0) / KG_PER_TON,
          avg_level_pct: Number(item.avg_level_pct ?? 0),
          avg_temp: Number(item.avg_temp ?? 0),
        }))
      );

export const fetchTankSettings = (id) =>
  USE_MOCK ? mockApi.fetchTankSettings(id) : api.get(`/tanks/${id}/settings`).then((r) => r.data);

export const updateTankSettings = (id, data) =>
  USE_MOCK ? mockApi.updateTankSettings(id, data) : api.put(`/tanks/${id}/settings`, data).then((r) => r.data);