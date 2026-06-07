import { useQuery } from '@tanstack/react-query';
import { fetchTankStats } from '../api/tankApi';

function normalizeStats(data) {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    ...item,
    tank_id: Number(item.tank_id),
    tank_name: item.tank_name ?? `Резервоар ${item.tank_id}`,

    total_in: Number(item.total_in ?? 0),
    total_out: Number(item.total_out ?? 0),
    avg_level_pct: Number(item.avg_level_pct ?? 0),
    avg_temp: Number(item.avg_temp ?? 0),
  }));
}

export default function useTankStats(from, to) {
  return useQuery({
    queryKey: ['tanks', 'stats', from, to],
    queryFn: () => fetchTankStats(from, to),
    enabled: !!from && !!to,
    staleTime: 60_000,
  });
}