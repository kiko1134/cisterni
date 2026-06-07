import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '—';
  return format(new Date(timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: bg });
};

export const formatLevel = (val) =>
  val != null ? `${val.toFixed(1)} %` : '—';

export const formatTemp = (val) =>
  val != null ? `${val.toFixed(1)} °C` : '—';

export const formatMass = (val) =>
  val != null ? `${val.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} kg` : '—';

export const formatLevelMm = (val) =>
  val != null ? `${val.toFixed(0)} mm` : '—';