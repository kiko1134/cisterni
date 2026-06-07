import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Grid, Paper, TextField, Button,
  MenuItem, Select, InputLabel, FormControl,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';
import { fetchTankSettings, updateTankSettings } from '../api/tankApi';
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

  // Мутация за запис
  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: (data) => updateTankSettings(selectedTank, data),
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
    // Конвертиране на стрингове към числа
    const payload = {
      ...form,
      diameter: parseFloat(form.diameter),
      height: parseFloat(form.height),
      rel_weight: parseFloat(form.rel_weight),
      correction: parseFloat(form.correction),
      dead_volume: parseFloat(form.dead_volume),
      limit_temp: parseFloat(form.limit_temp),
      filter: parseFloat(form.filter),
      sens_plus: parseFloat(form.sens_plus),
      sens_minus: parseFloat(form.sens_minus),
    };
    saveSettings(payload);
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
                    label={t('field_name')}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    required
                    label={t('field_diameter')}
                    name="diameter"
                    type="number"
                    value={form.diameter}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '0.01', min: 0 }}
                    helperText={t('field_diameter_help')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    required
                    label={t('field_height')}
                    name="height"
                    type="number"
                    value={form.height}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '0.01', min: 0 }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Физически параметри */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('section_physical')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    required
                    label={t('field_rel_weight')}
                    name="rel_weight"
                    type="number"
                    value={form.rel_weight}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '0.1', min: 0 }}
                    helperText={t('field_rel_weight_help')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label={t('field_correction')}
                    name="correction"
                    type="number"
                    value={form.correction}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '0.001', min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label={t('field_dead_volume')}
                    name="dead_volume"
                    type="number"
                    value={form.dead_volume}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '0.01', min: 0 }}
                    helperText={t('field_dead_volume_help')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label={t('field_filter')}
                    name="filter"
                    type="number"
                    value={form.filter}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '0.1', min: 0.1 }}
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
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('field_sens_plus')}
                    name="sens_plus"
                    type="number"
                    value={form.sens_plus}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '0.1' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('field_sens_minus')}
                    name="sens_minus"
                    type="number"
                    value={form.sens_minus}
                    onChange={handleChange}
                    size="small"
                    inputProps={{ step: '0.1' }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Формула - само информативно */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('formula_label')}
              </Typography>
              <Typography variant="body2" fontFamily="monospace" color="primary">
                M = ρ × (π × D² / 4) × (h_measured + h_dead) × Correction
              </Typography>
              {form.diameter && form.height && form.rel_weight && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    {t('max_volume')}: {((Math.PI * Math.pow(parseFloat(form.diameter), 2) / 4) * parseFloat(form.height)).toFixed(2)} m³
                    {' '}|{' '}
                    {t('max_mass')}: {((Math.PI * Math.pow(parseFloat(form.diameter), 2) / 4) * parseFloat(form.height) * parseFloat(form.rel_weight)).toFixed(0)} kg
                  </Typography>
                </>
              )}
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