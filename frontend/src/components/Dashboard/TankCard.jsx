import { Box, Typography, Chip, Paper } from '@mui/material';
import { keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ScaleIcon from '@mui/icons-material/Scale';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ALARM_COLORS, getTankStatus } from '../../utils/alarmColors';
import { useT } from '../../i18n/LanguageContext';

// Хоризонтално движение на вълните (безшевно, защото съдържа 2 еднакви вълни).
const waveMove = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

// Лек вертикален „дъх“ на повърхността на водата.
const waveBob = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(2px); }
`;

export default function TankCard({ tank, dense = false }) {
  const navigate = useNavigate();
  const t = useT();
  const status = getTankStatus(tank);
  const color = ALARM_COLORS[status];
  const level = Math.min(Math.max(tank.level_pct ?? 0, 0), 100);

  // Цвят на водата — ярко синьо/циан за контраст върху тъмносиния фон.
  const WATER_TOP = '#4fc3f7'; // светъл циан (повърхност)
  const WATER_BOTTOM = '#0277bd'; // по-тъмно синьо (дъно)

  return (
    <Paper
      onClick={() => navigate(`/tank/${tank.id}`)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: dense ? 0.75 : 1.5,
        cursor: 'pointer',
        border: `2px solid ${color}`,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 24px ${color}40`,
          zIndex: 2,
        },
      }}
    >
      {/* Заглавие / номер */}
      <Typography
        variant={dense ? 'caption' : 'subtitle2'}
        color="text.secondary"
        noWrap
        sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: dense ? '0.9rem' : '1.25rem' }}
      >
        {`${t('tank')} ${tank.id}`}
      </Typography>

      {/* Визуализация на нивото — заема останалото пространство */}
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, my: 0.5 }}>
        {/* Контур на резервоара */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          {/* Водата (ниво %) */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${level}%`,
              background: `linear-gradient(to bottom, ${WATER_TOP}cc 0%, ${WATER_BOTTOM}ee 100%)`,
              transition: 'height 0.8s ease-in-out',
            }}
          >
            {/* Анимирана повърхност на водата (вълни) */}
            {level > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '200%',
                  height: 14,
                  mt: '-12px',
                  animation: `${waveBob} 4s ease-in-out infinite`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    animation: `${waveMove} 6s linear infinite`,
                  }}
                >
                  {[0, 1].map((n) => (
                    <Box
                      key={n}
                      component="svg"
                      viewBox="0 0 1200 40"
                      preserveAspectRatio="none"
                      sx={{ flex: '0 0 50%', height: '100%', display: 'block' }}
                    >
                      <path
                        d="M0,20 C150,40 350,0 600,20 C850,40 1050,0 1200,20 L1200,40 L0,40 Z"
                        fill={`${WATER_TOP}cc`}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Процент в центъра */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            fontWeight="bold"
            color={color}
            sx={{ fontSize: dense ? '1.6rem' : '3rem', lineHeight: 1 }}
          >
            {tank.level_pct?.toFixed(1)}%
          </Typography>
        </Box>
      </Box>

      {/* Температура и маса */}
      {dense ? (
        /* Компактен изглед за малки резервоари — текст с икони, без chip рамки */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThermostatIcon
              sx={{ fontSize: 16, color: status === 'highTemp' ? 'warning.main' : 'text.secondary' }}
            />
            <Typography
              sx={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1 }}
              color={status === 'highTemp' ? 'warning.main' : 'text.primary'}
            >
              {tank.temperature?.toFixed(1)} °C
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScaleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1 }}>
              {tank.mass?.toFixed(0)} kg
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<ThermostatIcon />}
            label={`${tank.temperature?.toFixed(1)} °C`}
            color={status === 'highTemp' ? 'warning' : 'default'}
            variant="outlined"
            sx={{ fontSize: '1rem', height: 32, '& .MuiChip-icon': { fontSize: 20 } }}
          />
          <Chip
            icon={<ScaleIcon />}
            label={`${tank.mass?.toFixed(0)} kg`}
            variant="outlined"
            sx={{ fontSize: '1rem', height: 32, '& .MuiChip-icon': { fontSize: 20 } }}
          />
        </Box>
      )}

      {/* Алармен индикатор */}
      {status !== 'normal' && (
        dense ? (
          <WarningAmberIcon
            sx={{ position: 'absolute', top: 4, right: 4, fontSize: 16, color }}
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 16, color }} />
            <Typography variant="caption" color={color} sx={{ fontSize: '0.95rem' }}>
              {status === 'maxLevel' && t('alarm_max_level')}
              {status === 'minLevel' && t('alarm_min_level')}
              {status === 'highTemp' && t('alarm_high_temp')}
            </Typography>
          </Box>
        )
      )}
    </Paper>
  );
}
