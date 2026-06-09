import { useState } from 'react';
import {
  Box,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
} from '@mui/material';
import { subHours, subDays, format } from 'date-fns';
import { useT } from '../../i18n/LanguageContext';

const PERIODS = [
  { labelKey: 'period_24h', value: '24h' },
  { labelKey: 'period_7d', value: '7d' },
  { labelKey: 'period_30d', value: '30d' },
  { labelKey: 'period_custom', value: 'custom' },
];

// ISO string -> value expected by <input type="datetime-local"> ("yyyy-MM-ddTHH:mm").
// Връща празен низ при липсваща/невалидна стойност, за да не хвърля format().
const toInputValue = (iso) => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime())
    ? format(date, "yyyy-MM-dd'T'HH:mm")
    : '';
};

export default function PeriodSelector({ period, from, to, onChange }) {
  const t = useT();
  const [customFrom, setCustomFrom] = useState(toInputValue(from));
  const [customTo, setCustomTo] = useState(toInputValue(to));

  const handlePeriodChange = (_, newPeriod) => {
    if (!newPeriod) return;

    if (newPeriod === 'custom') {
      // Влизаме в режим "по избор" — попълваме полетата с текущия обхват.
      setCustomFrom(toInputValue(from));
      setCustomTo(toInputValue(to));
      onChange({ period: 'custom', from, to });
      return;
    }

    const now = new Date();
    let fromDate;

    switch (newPeriod) {
      case '24h':
        fromDate = subHours(now, 24);
        break;
      case '7d':
        fromDate = subDays(now, 7);
        break;
      case '30d':
        fromDate = subDays(now, 30);
        break;
      default:
        fromDate = subHours(now, 24);
    }

    onChange({ period: newPeriod, from: fromDate.toISOString(), to: now.toISOString() });
  };

  const fromDate = new Date(customFrom);
  const toDate = new Date(customTo);
  const invalidRange =
    !customFrom ||
    !customTo ||
    Number.isNaN(fromDate.getTime()) ||
    Number.isNaN(toDate.getTime()) ||
    fromDate >= toDate;

  const applyCustom = () => {
    if (invalidRange) return;
    onChange({ period: 'custom', from: fromDate.toISOString(), to: toDate.toISOString() });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap" useFlexGap>
        <ToggleButtonGroup value={period} exclusive onChange={handlePeriodChange} size="small">
          {PERIODS.map((p) => (
            <ToggleButton key={p.value} value={p.value}>
              {t(p.labelKey)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {period === 'custom' && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField
              label={t('from')}
              type="datetime-local"
              size="small"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)' } }}
            />
            <TextField
              label={t('to')}
              type="datetime-local"
              size="small"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={invalidRange}
              helperText={invalidRange ? t('invalid_period') : ' '}
              sx={{ '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)' } }}
            />
            <Button variant="contained" size="small" onClick={applyCustom} disabled={invalidRange}>
              {t('show')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
