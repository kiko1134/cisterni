import { useQuery } from '@tanstack/react-query';
import { fetchTanksCurrent } from '../api/tankApi';

export default function useTanksCurrent() {
  return useQuery({
    queryKey: ['tanks', 'current'],
    queryFn: fetchTanksCurrent,
    refetchInterval: 60_000, // polling на всяка 1 минута, точно по плана
  });
}