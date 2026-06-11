import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { useT, useLanguage, LANGS, LANG_LABELS } from '../../i18n/LanguageContext';

const DRAWER_WIDTH = 220;
const DRAWER_COLLAPSED = 64;

const NAV_ITEMS = [
  { labelKey: 'nav_tanks', icon: <DashboardIcon />, path: '/' },
  { labelKey: 'nav_stats', icon: <BarChartIcon />, path: '/stats' },
  { labelKey: 'nav_settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function AppLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const t = useT();
  const { lang, setLang } = useLanguage();

  const drawerWidth = open ? DRAWER_WIDTH : DRAWER_COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {/* Лого и бутон за затваряне */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
            px: open ? 2 : 0,
            py: 1.5,
            minHeight: 64,
          }}
        >
          {open && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalGasStationIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {t('app_title')}
              </Typography>
            </Box>
          )}
          <IconButton onClick={() => setOpen(!open)} size="small">
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        <Divider />

        {/* Навигационни елементи */}
        <List sx={{ pt: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const label = t(item.labelKey);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={!open ? label : ''} placement="right">
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={isActive}
                    sx={{
                      mx: 1,
                      borderRadius: 1.5,
                      justifyContent: open ? 'initial' : 'center',
                      px: open ? 2 : 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '& .MuiListItemIcon-root': { color: 'white' },
                        '&:hover': { bgcolor: 'primary.dark' },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: open ? 40 : 'auto',
                        color: isActive ? 'white' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>

        {/* Превключвател на език + версия в дъното */}
        <Box sx={{ mt: 'auto', p: open ? 2 : 1 }}>
          <ToggleButtonGroup
            value={lang}
            exclusive
            size="small"
            onChange={(_, val) => val && setLang(val)}
            orientation={open ? 'horizontal' : 'vertical'}
            fullWidth
            sx={{ mb: open ? 1.5 : 0 }}
          >
            {LANGS.map((code) => (
              <ToggleButton key={code} value={code} sx={{ px: 1, py: 0.25, fontSize: 12 }}>
                {LANG_LABELS[code]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {open && (
            <Typography variant="caption" color="text.disabled">
              v1.0.0 — {t('app_tanks_count')}
            </Typography>
          )}
        </Box>
      </Drawer>

      {/* Главно съдържание */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,            // позволява на flex-елемента да се свива, без да прелива
          p: 3,
          minHeight: '100vh',
          position: 'relative',
          isolation: 'isolate',   // собствен stacking context → съдържанието не се
                                  // изрисува върху страничното меню (sidebar)
          overflowX: 'clip',      // отрязва хоризонталното "призрачно" изрисуване —
                                  // Chrome compositor артефакт при мащаб 125% и т.н.
          bgcolor: 'background.default',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}