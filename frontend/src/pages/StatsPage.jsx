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
import { getTankWaterColor } from '../utils/tankColors';

export default function StatsPage() {
  const t = useT();
  const [range, setRange] = useState({
    period: '7d',
    from: subDays(new Date(), 7).toISOString(),
    to: new Date().toISOString(),
  });

  const { data: stats, isLoading, isError } = useTankStats(range.from, range.to);

  // Фиксирана скала: винаги всичките 16 резервоара присъстват като слотове по
  // оста, за да е ширината на една колона = (ширина на скалата / 16) и да остане
  // еднаква независимо колко резервоара са се променили през периода. Показваме
  // цветна колона само за резервоарите с реално движение — останалите слотове
  // са празни (нулева/липсваща стойност), но пазят мястото си на скалата.
  const TANK_COUNT = 16;
  // Праг за показване: движение под 0.1 t е шум и не се изобразява в никоя графика.
  const MIN_MOVEMENT_T = 0.1;
  const statById = new Map((stats ?? []).map((s) => [s.tank_id, s]));
  const chartData = Array.from({ length: TANK_COUNT }, (_, i) => {
    const id = i + 1;
    const s = statById.get(id) ?? {};
    const total_in = s.total_in ?? 0;
    const total_out = s.total_out ?? 0;
    const hasIn = total_in >= MIN_MOVEMENT_T;
    const hasOut = total_out >= MIN_MOVEMENT_T;
    const moved = hasIn || hasOut;
    return {
      tank_id: id,
      tank_label: `${id}`,
      // Стойност само при движение ≥ прага → колона; иначе празен слот на скалата.
      total_in: hasIn ? total_in : null,
      total_out: hasOut ? total_out : null,
      avg_level_pct: moved ? (s.avg_level_pct ?? 0) : null,
    };
  });

  const padTo16 = (items) => {
    const out = items.map((d) => ({ ...d }));
    for (let i = out.length; i < TANK_COUNT; i++) {
      out.push({ tank_id: `pad-${i}`, tank_label: `pad-${i}`, total_in: null, total_out: null, avg_level_pct: null });
    }
    return out;
  };
  const incomingData = padTo16(chartData.filter((d) => d.total_in != null));
  const outgoingData = padTo16(chartData.filter((d) => d.total_out != null));
  const fillData = padTo16(chartData.filter((d) => d.avg_level_pct != null));

  // Кои X-етикети да се изписват — само реалните резервоари (не празните слотове).
  const incomingSet = new Set(incomingData.filter((d) => d.total_in != null).map((d) => d.tank_label));
  const outgoingSet = new Set(outgoingData.filter((d) => d.total_out != null).map((d) => d.tank_label));
  const fillSet = new Set(fillData.filter((d) => d.avg_level_pct != null).map((d) => d.tank_label));

  // Рендира етикет по X само за активните резервоари; за останалите — нищо.
  const makeTick = (activeSet, fontSize) => ({ x, y, payload }) =>
    activeSet.has(payload.value) ? (
      <text x={x} y={y} dy={16} textAnchor="middle" fill="#fff" fontWeight="bold" fontSize={fontSize}>
        {payload.value}
      </text>
    ) : (
      <g />
    );

  // Цвят по номер на резервоара — същите цветове като на таблото (визуализацията на водата).
  const cellColor = (s) => getTankWaterColor(s.tank_id);

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
                <BarChart data={incomingData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="tank_label" stroke="#999" interval={0} tick={makeTick(incomingSet, 20)} />
                  <YAxis stroke="#999" width={72} tick={{ fill: '#fff', fontWeight: 'bold', fontSize: 20 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={() => ''}
                    formatter={(v) => [v == null ? '—' : `${v.toLocaleString('bg-BG', { maximumFractionDigits: 1 })} t`]}
                  />
                  <Bar dataKey="total_in" name={t('bar_incoming')} radius={[4, 4, 0, 0]}>
                    {incomingData.map((s) => (
                      <Cell key={s.tank_id} fill={cellColor(s)} />
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
                <BarChart data={outgoingData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="tank_label" stroke="#999" interval={0} tick={makeTick(outgoingSet, 20)} />
                  <YAxis stroke="#999" width={72} tick={{ fill: '#fff', fontWeight: 'bold', fontSize: 20 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={() => ''}
                    formatter={(v) => [v == null ? '—' : `${v.toLocaleString('bg-BG', { maximumFractionDigits: 1 })} t`]}
                  />
                  <Bar dataKey="total_out" name={t('bar_outgoing')} radius={[4, 4, 0, 0]}>
                    {outgoingData.map((s) => (
                      <Cell key={s.tank_id} fill={cellColor(s)} />
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
                <BarChart data={fillData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="tank_label" stroke="#999" interval={0} tick={makeTick(fillSet, 20)} />
                  <YAxis domain={[0, 100]} unit="%" stroke="#999" width={72} tick={{ fill: '#fff', fontWeight: 'bold', fontSize: 20 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(v) => [v == null ? '—' : `${v.toFixed(1)}%`]}
                  />
                  <Bar dataKey="avg_level_pct" name={t('legend_avg_level')} radius={[4, 4, 0, 0]}>
                    {fillData.map((s) => (
                      <Cell key={s.tank_id} fill={cellColor(s)} />
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