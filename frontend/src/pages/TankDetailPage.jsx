import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Grid, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { subHours } from 'date-fns';
import TrendChart from '../components/TankDetail/TrendChart';
import PeriodSelector from '../components/TankDetail/PeriodSelector';
import ReadingsTable from '../components/TankDetail/ReadingsTable';
import useTankHistory from '../hooks/useTankHistory';
import useTanksCurrent from '../hooks/useTanksCurrent';
import { formatLevel, formatTemp, formatMass } from '../utils/formatters';
import { ALARM_COLORS, getTankStatus } from '../utils/alarmColors';
import { useT } from '../i18n/LanguageContext';

export default function TankDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useT();

  const [range, setRange] = useState({
    period: '24h',
    from: subHours(new Date(), 24).toISOString(),
    to: new Date().toISOString(),
  });

  const { data, isLoading } = useTankHistory(id, range.from, range.to);

  // Текущи данни за резервоара от backend (хедър карта) — същият източник като таблото
  const { data: tanks } = useTanksCurrent();
  const current = tanks?.find((tk) => tk.id === Number(id));
  const status = current ? getTankStatus(current) : 'normal';
  const color = ALARM_COLORS[status];

  return (
    <Box>
      {/* Навигация назад + заглавие */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          {current?.name || `${t('tank')} #${id}`}
        </Typography>
      </Box>

      {/* Текущи стойности - хедър карта */}
      {current && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            border: `1px solid ${color}60`,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">{t('detail_level')}</Typography>
            <Typography variant="h6" color={color} fontWeight="bold">
              {formatLevel(current.level_pct)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('detail_temp')}</Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatTemp(current.temperature)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('detail_mass')}</Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatMass(current.mass)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('detail_level_mm')}</Typography>
            <Typography variant="h6" fontWeight="bold">
              {current.level_mm?.toFixed(0)} mm
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Избор на период */}
      <PeriodSelector
        period={range.period}
        from={range.from}
        to={range.to}
        onChange={setRange}
      />

      {/* Тренд графика */}
      <TrendChart data={data} isLoading={isLoading} />

      {/* Таблица с пагинация */}
      <ReadingsTable data={data} isLoading={isLoading} />
    </Box>
  );
}