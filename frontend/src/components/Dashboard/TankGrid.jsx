import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import TankCard from './TankCard';
import useTanksCurrent from '../../hooks/useTanksCurrent';
import { useT } from '../../i18n/LanguageContext';

// ─────────────────────────────────────────────────────────────────────────────
// План на халето (от .bmp чертежа). Координатите са в проценти спрямо контейнера,
// който запазва съотношението на чертежа (виж PLAN_W / PLAN_H).
// Малките резервоари (dense:true) скриват chip-овете, за да се поберат.
// ─────────────────────────────────────────────────────────────────────────────
const PLAN_W = 1420;
const PLAN_H = 1370;

// Г-образна граница на халето (изрязан долен ляв ъгъл).
const BOUNDARY = `M80,80 H1340 V1320 H660 V1045 H80 Z`;

// id -> { x, y, w, h }  в пиксели спрямо чертежа (после се превръщат в %)
const TANK_LAYOUT = {
  16: { x: 150, y: 170, w: 150, h: 225 },
  13: { x: 440, y: 155, w: 170, h: 255 },
  3:  { x: 750, y: 145, w: 140, h: 220 },
  1:  { x: 1065, y: 110, w: 220, h: 285 },

  15: { x: 150, y: 445, w: 150, h: 220 },
  14: { x: 440, y: 470, w: 170, h: 245 },
  4:  { x: 750, y: 510, w: 140, h: 245 },
  2:  { x: 1070, y: 480, w: 200, h: 290 },

  7:  { x: 150, y: 765, w: 160, h: 250 },
  8:  { x: 440, y: 790, w: 135, h: 220 },
  11: { x: 730, y: 855, w: 135, h: 215 },
  9:  { x: 950, y: 925, w: 100, h: 170, dense: true },
  5:  { x: 1175, y: 925, w: 95, h: 170, dense: true },

  12: { x: 730, y: 1095, w: 135, h: 205 },
  10: { x: 950, y: 1095, w: 100, h: 170, dense: true },
  6:  { x: 1175, y: 1095, w: 95, h: 170, dense: true },
};

const pct = (val, total) => `${(val / total) * 100}%`;

export default function TankGrid() {
  const { data: tanks, isLoading, isError, error } = useTanksCurrent();
  const t = useT();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {t('loading_error')}: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        {t('dashboard_title')}
      </Typography>

      {/* Контейнер на плана — запазва съотношението на чертежа (PLAN_W:PLAN_H),
          за да не се изкривява и да не се застъпват картите при различен мащаб
          (Windows 100/125/150%) или zoom на браузъра. Широчината се ограничава
          така, че височината винаги да се събира в екрана. */}
      <Box
        sx={{
          position: 'relative',
          width: `min(100%, calc((100vh - 130px) * (${PLAN_W} / ${PLAN_H})))`,
          aspectRatio: `${PLAN_W} / ${PLAN_H}`,
          mx: 'auto',
        }}
      >
        {/* Г-образна граница на халето */}
        <Box
          component="svg"
          viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
          preserveAspectRatio="none"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <path
            d={BOUNDARY}
            fill="none"
            stroke="#5c7891"
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
        </Box>

        {/* Резервоари — позиционирани абсолютно по чертежа */}
        {tanks.map((tank) => {
          const pos = TANK_LAYOUT[tank.id];
          if (!pos) return null;
          return (
            <Box
              key={tank.id}
              sx={{
                position: 'absolute',
                left: pct(pos.x, PLAN_W),
                top: pct(pos.y, PLAN_H),
                width: pct(pos.w, PLAN_W),
                height: pct(pos.h, PLAN_H),
              }}
            >
              <TankCard tank={tank} dense={pos.dense} />
            </Box>
          );
        })}
      </Box>
    </>
  );
}
