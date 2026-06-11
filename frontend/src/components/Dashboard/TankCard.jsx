import { Box, Typography, Chip, Paper } from '@mui/material';
import { keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ScaleIcon from '@mui/icons-material/Scale';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ALARM_COLORS, getTankStatus } from '../../utils/alarmColors';
import { getTankWaterColor } from '../../utils/tankColors';
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

  // Цвят на течността според резервоара — един плътен цвят (тяло + вълна).
  const waterColor = getTankWaterColor(tank.id);

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
        // Прави картата "контейнер" — текстът се мащабира спрямо нейния размер
        // (cqmin), за да не се застъпва при различен мащаб/резолюция (Windows).
        containerType: 'size',
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
        sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: 'clamp(0.7rem, 9cqmin, 1.25rem)' }}
      >
        {/* При малките (dense) карти показваме само номера, за да не се отрязва
            ("Резервоа...") при по-малък мащаб/резолюция. */}
        {dense ? `№${tank.id}` : `${t('tank')} ${tank.id}`}
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
              background: waterColor,
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
                {/* Една SVG с две вълнови периода → няма шев/линия между елементи */}
                <Box
                  component="svg"
                  viewBox="0 0 2400 40"
                  preserveAspectRatio="none"
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    animation: `${waveMove} 6s linear infinite`,
                  }}
                >
                  <path
                    d="M0,20 C150,40 350,0 600,20 C850,40 1050,0 1200,20 C1350,40 1550,0 1800,20 C2050,40 2250,0 2400,20 L2400,40 L0,40 Z"
                    fill={waterColor}
                  />
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
            sx={{
              // Бяло с тъмен контур — четливо върху всеки цвят на водата (жълто, черно и т.н.)
              color: '#fff',
              textShadow:
                '0 0 3px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,0.9)',
              fontSize: 'clamp(1rem, 22cqmin, 3rem)',
              lineHeight: 1,
            }}
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
              sx={{ fontSize: 'clamp(12px, 8cqmin, 18px)', color: status === 'highTemp' ? 'warning.main' : 'text.secondary' }}
            />
            <Typography
              sx={{ fontSize: 'clamp(0.6rem, 7cqmin, 0.95rem)', fontWeight: 700, lineHeight: 1 }}
              color={status === 'highTemp' ? 'warning.main' : 'text.primary'}
            >
              {tank.temperature?.toFixed(1)} °C
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScaleIcon sx={{ fontSize: 'clamp(12px, 8cqmin, 18px)', color: 'text.secondary' }} />
            <Typography sx={{ fontSize: 'clamp(0.6rem, 7cqmin, 0.95rem)', fontWeight: 700, lineHeight: 1 }}>
              {tank.mass?.toFixed(1)} t
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
            sx={{
              fontSize: 'clamp(0.6rem, 6.5cqmin, 1rem)',
              height: 'auto',
              '& .MuiChip-label': { px: 0.75, py: 0.25 },
              '& .MuiChip-icon': { fontSize: 'clamp(12px, 8cqmin, 20px)' },
            }}
          />
          <Chip
            icon={<ScaleIcon />}
            label={`${tank.mass?.toFixed(1)} t`}
            variant="outlined"
            sx={{
              fontSize: 'clamp(0.6rem, 6.5cqmin, 1rem)',
              height: 'auto',
              '& .MuiChip-label': { px: 0.75, py: 0.25 },
              '& .MuiChip-icon': { fontSize: 'clamp(12px, 8cqmin, 20px)' },
            }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, minWidth: 0 }}>
            <WarningAmberIcon sx={{ fontSize: 'clamp(12px, 8cqmin, 18px)', color, flexShrink: 0 }} />
            <Typography
              noWrap
              color={color}
              sx={{ fontSize: 'clamp(0.55rem, 6cqmin, 0.9rem)', lineHeight: 1.1 }}
            >
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
