import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Grid, Paper, TextField, Button,
  MenuItem, Select, InputLabel, FormControl,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';
import { fetchTankSettings, updateTankLimitTemp } from '../api/tankApi';
import { useT } from '../i18n/LanguageContext';

const DEFAULT_FORM = {
  name: '',
  diameter: '',
  height: '',
  rel_weight: '',
  correction: '1',
  dead_volume: '0.10',
  limit_temp: '50',
  filter: '1',
  sens_plus: '0',
  sens_minus: '0',
};

export default function SettingsPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [selectedTank, setSelectedTank] = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);

  // Зареждане на настройките за избрания резервоар
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['tank', selectedTank, 'settings'],
    queryFn: () => fetchTankSettings(selectedTank),
  });

  // Попълване на формата при смяна на резервоар
  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name || '',
        diameter: settings.diameter ?? '',
        height: settings.height ?? '',
        rel_weight: settings.rel_weight ?? '',
        correction: settings.correction ?? '1',
        dead_volume: settings.dead_volume ?? '0.10',
        limit_temp: settings.limit_temp ?? '50',
        filter: settings.filter ?? '1',
        sens_plus: settings.sens_plus ?? '0',
        sens_minus: settings.sens_minus ?? '0',
      });
    }
  }, [settings]);

  // Мутация за запис — само максималната температура
  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: (limitTemp) => updateTankLimitTemp(selectedTank, limitTemp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tank', selectedTank, 'settings'] });
      toast.success(t('settings_saved', { n: selectedTank }));
    },
    onError: () => {
      toast.error(t('settings_save_error'));
    },
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Записва се само максималната температура
    saveSettings(parseFloat(form.limit_temp));
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        {t('settings_title')}
      </Typography>

      {/* Избор на резервоар */}
      <FormControl sx={{ mb: 3, minWidth: 200 }} size="small">
        <InputLabel>{t('tank')}</InputLabel>
        <Select
          value={selectedTank}
          label={t('tank')}
          onChange={(e) => setSelectedTank(e.target.value)}
        >
          {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
            <MenuItem key={n} value={n}>
              {t('tank')} {n}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error" sx={{ mb: 2 }}>{t('settings_load_error')}</Alert>}

      {!isLoading && (
        <Grid container spacing={3}>
          {/* Основни параметри */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('section_basic')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label={t('field_diameter')}
                    name="diameter"
                    type="number"
                    value={form.diameter}
                    size="small"
                    inputProps={{ step: '0.01', min: 0 }}
                    InputProps={{ readOnly: true }}
                    helperText={t('field_diameter_help')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label={t('field_height')}
                    name="height"
                    type="number"
                    value={form.height}
                    size="small"
                    inputProps={{ step: '0.01', min: 0 }}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Аларми */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('section_alarms')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('field_limit_temp')}
                    name="limit_temp"
                    type="number"
                    value={form.limit_temp}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '1' }}
                    helperText={t('field_limit_temp_help')}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Бутон за запис */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              disabled={isPending}
              sx={{ minWidth: 200 }}
            >
              {isPending ? t('saving') : t('save_settings')}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}