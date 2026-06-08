import { useState } from 'react';
import {
  Box, Stack, Typography, Grid, Paper, Alert, CircularProgress,
} from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';
import { subDays } from 'date-fns';
import PeriodSelector from '../components/TankDetail/PeriodSelector';
import useTankStats from '../hooks/useTankStats';
import { useT } from '../i18n/LanguageContext';

// 16 различни цвята за резервоарите
const TANK_COLORS = [
  '#2196f3','#4caf50','#ff9800','#e91e63',
  '#9c27b0','#00bcd4','#ffeb3b','#ff5722',
  '#607d8b','#8bc34a','#03a9f4','#f44336',
  '#673ab7','#009688','#ffc107','#795548',
];

export default function StatsPage() {
  const t = useT();
  const [range, setRange] = useState({
    period: '7d',
    from: subDays(new Date(), 7).toISOString(),
    to: new Date().toISOString(),
  });

  const { data: stats, isLoading, isError } = useTankStats(range.from, range.to);

  // Обобщени KPI данни
  const totalIn = stats?.reduce((sum, t) => sum + (t.total_in ?? 0), 0) ?? 0;
  const totalOut = stats?.reduce((sum, t) => sum + (t.total_out ?? 0), 0) ?? 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        {t('stats_title')}
      </Typography>

      {/* Избор на период */}
      <PeriodSelector
        period={range.period}
        from={range.from}
        to={range.to}
        onChange={setRange}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t('stats_error')}
        </Alert>
      )}

      {!isLoading && stats && (
        <>
          {/* KPI карти — на един ред */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid #4caf5040' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('kpi_incoming')}
                </Typography>
                <Typography variant="h4" color="#4caf50" fontWeight="bold">
                  {totalIn.toLocaleString('bg-BG', { maximumFractionDigits: 1 })} t
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid #f4433640' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('kpi_outgoing')}
                </Typography>
                <Typography variant="h4" color="#f44336" fontWeight="bold">
                  {totalOut.toLocaleString('bg-BG', { maximumFractionDigits: 1 })} t
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid #2196f340' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('kpi_remainder')}
                </Typography>
                <Typography variant="h4" color="#2196f3" fontWeight="bold">
                  {(totalIn - totalOut).toLocaleString('bg-BG', { maximumFractionDigits: 1 })} t
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Три графики — една под друга, широки */}
          <Stack spacing={3}>
            {/* Постъпила суровина по резервоар */}
            <Paper sx={{ p: 2, width: '100%' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('chart_incoming_by_tank')}
              </Typography>
              <ResponsiveContainer width="100%" height={460}>
                <BarChart data={stats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="tank_name" fontSize={11} stroke="#999" />
                  <YAxis stroke="#999" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                    formatter={(v) => [`${v.toLocaleString('bg-BG', { maximumFractionDigits: 1 })} t`]}
                  />
                  <Bar dataKey="total_in" name={t('bar_incoming')} radius={[4, 4, 0, 0]}>
                    {stats.map((_, index) => (
                      <Cell key={index} fill={TANK_COLORS[index % TANK_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Изпратена суровина по резервоар */}
            <Paper sx={{ p: 2, width: '100%' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('chart_outgoing_by_tank')}
              </Typography>
              <ResponsiveContainer width="100%" height={460}>
                <BarChart data={stats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="tank_name" fontSize={11} stroke="#999" />
                  <YAxis stroke="#999" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                    formatter={(v) => [`${v.toLocaleString('bg-BG', { maximumFractionDigits: 1 })} t`]}
                  />
                  <Bar dataKey="total_out" name={t('bar_outgoing')} radius={[4, 4, 0, 0]}>
                    {stats.map((_, index) => (
                      <Cell key={index} fill={TANK_COLORS[index % TANK_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Сравнителна графика — текущо запълване */}
            <Paper sx={{ p: 2, width: '100%' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('chart_compare_fill')}
              </Typography>
              <ResponsiveContainer width="100%" height={460}>
                <BarChart data={stats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="tank_name" fontSize={11} stroke="#999" />
                  <YAxis domain={[0, 100]} unit="%" stroke="#999" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                    formatter={(v) => [`${v?.toFixed(1)}%`]}
                  />
                  <Legend />
                  <Bar dataKey="avg_level_pct" name={t('legend_avg_level')} radius={[4, 4, 0, 0]}>
                    {stats.map((_, index) => (
                      <Cell key={index} fill={TANK_COLORS[index % TANK_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>
        </>
      )}
    </Box>
  );
}