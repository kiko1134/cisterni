import { useQuery } from '@tanstack/react-query';
import { fetchTankHistory } from '../api/tankApi';

export default function useTankHistory(tankId, from, to) {
  return useQuery({
    queryKey: ['tank', tankId, 'history', from, to],
    queryFn: () => fetchTankHistory(tankId, from, to),
    enabled: !!tankId && !!from && !!to,
    staleTime: 60_000,
  });
}