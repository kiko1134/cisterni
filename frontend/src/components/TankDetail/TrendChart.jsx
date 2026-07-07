import { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Paper, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { useT } from '../../i18n/LanguageContext';

const METRICS = [
  { key: 'level_pct', labelKey: 'metric_level', color: '#2196f3', unit: '%', type: 'monotone' },
  { key: 'temperature', labelKey: 'metric_temp', color: '#ff9800', unit: '°C', type: 'monotone' },
  { key: 'mass', labelKey: 'metric_mass', color: '#4caf50', unit: 't', type: 'stepAfter' },
];

export default function TrendChart({ data, isLoading }) {
  const t = useT();
  const [activeMetrics, setActiveMetrics] = useState(['level_pct']);

  const handleMetricChange = (_, newMetrics) => {
    if (newMetrics.length > 0) {
      setActiveMetrics(newMetrics);
    }
  };

  // Форматиране на данните за Recharts
  const chartData = data?.map((reading) => ({
    ...reading,
    time: new Date(reading.time).getTime(),
  })) || [];

  const massValues = chartData
    .map((d) => d.mass)
    .filter((v) => v != null && !Number.isNaN(v));
  const massMin = massValues.length ? Math.min(...massValues) : 0;
  const massMax = massValues.length ? Math.max(...massValues) : 0;
  const massPad = Math.max((massMax - massMin) * 0.1, 0.5);
  const massDomain = massValues.length
    ? [Math.floor(massMin - massPad), Math.ceil(massMax + massPad)]
    : [0, 'auto'];

  // Форматиране на оста X спрямо обхвата
  const formatXAxis = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    // Ако е в рамките на 24ч → показваме час:минута
    if (chartData.length > 0) {
      const range = chartData[chartData.length - 1].time - chartData[0].time;
      if (range <= 86_400_000) return format(date, 'HH:mm');
      if (range <= 604_800_000) return format(date, 'dd.MM HH:mm');
      return format(date, 'dd.MM.yyyy');
    }
    return format(date, 'dd.MM HH:mm');
  };

  const formatTooltipLabel = (timestamp) => {
    return format(new Date(timestamp), 'dd.MM.yyyy HH:mm');
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Избор на метрики */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{t('trend_title')}</Typography>
        <ToggleButtonGroup
          value={activeMetrics}
          onChange={handleMetricChange}
          size="small"
        >
          {METRICS.map((m) => (
            <ToggleButton key={m.key} value={m.key}>
              {t(m.labelKey)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Графика */}
      <Box sx={{ width: '100%', height: 600 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">{t('loading')}</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="time"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxis}
                stroke="#999"
                fontSize={12}
              />

              {/* Отделни Y-оси за различните метрики */}
              {activeMetrics.includes('level_pct') && (
                <YAxis
                  yAxisId="level"
                  domain={[0, 100]}
                  unit="%"
                  stroke="#2196f3"
                  fontSize={12}
                />
              )}
              {activeMetrics.includes('temperature') && (
                <YAxis
                  yAxisId="temp"
                  orientation="right"
                  unit="°C"
                  stroke="#ff9800"
                  fontSize={12}
                />
              )}
              {activeMetrics.includes('mass') && (
                <YAxis
                  yAxisId="mass"
                  orientation={activeMetrics.includes('temperature') ? 'left' : 'right'}
                  domain={massDomain}
                  allowDecimals={false}
                  unit=" t"
                  stroke="#4caf50"
                  fontSize={12}
                  hide={activeMetrics.includes('level_pct')} // скрива се ако вече има лява ос
                />
              )}

              <Tooltip
                labelFormatter={formatTooltipLabel}
                contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
              />
              <Legend />

              {/* Линии */}
              {METRICS.filter((m) => activeMetrics.includes(m.key)).map((m) => (
                <Line
                  key={m.key}
                  yAxisId={
                    m.key === 'level_pct' ? 'level' :
                    m.key === 'temperature' ? 'temp' : 'mass'
                  }
                  type={m.type}
                  dataKey={m.key}
                  name={t(m.labelKey)}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
}