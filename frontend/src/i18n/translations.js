// ─────────────────────────────────────────────────────────────────────────────
// ТАБЛИЦА С ПРЕВОДИ  /  TRANSLATION TABLE  /  ТАБЛИЦА ПЕРЕВОДОВ
//
// Един ред = една фраза. Колоните са: bg (български), en (English), ru (русский).
// Използване в компонент:  const t = useT();  <Typography>{t('stats_title')}</Typography>
// С параметри:             t('settings_saved', { n: 3 })   // замества {n}
// ─────────────────────────────────────────────────────────────────────────────
export const translations = {
  // ── Навигация / Layout ────────────────────────────────────────────────────
  app_title:        { bg: 'Цистерни',    en: 'Cisterns',    ru: 'Цистерны' },
  nav_tanks:        { bg: 'Резервоари',  en: 'Tanks',       ru: 'Резервуары' },
  nav_stats:        { bg: 'Статистика',  en: 'Statistics',  ru: 'Статистика' },
  nav_settings:     { bg: 'Настройки',   en: 'Settings',    ru: 'Настройки' },
  app_tanks_count:  { bg: '16 резервоара', en: '16 tanks',  ru: '16 резервуаров' },
  language:         { bg: 'Език',        en: 'Language',    ru: 'Язык' },

  // ── Общи / Common ─────────────────────────────────────────────────────────
  tank:             { bg: 'Резервоар',   en: 'Tank',        ru: 'Резервуар' },
  loading:          { bg: 'Зареждане...', en: 'Loading...', ru: 'Загрузка...' },
  loading_error:    { bg: 'Грешка при зареждане', en: 'Loading error', ru: 'Ошибка загрузки' },
  of:               { bg: 'от',          en: 'of',          ru: 'из' },

  // ── Табло / Dashboard ─────────────────────────────────────────────────────
  dashboard_title:  { bg: 'Резервоари — текущо състояние', en: 'Tanks — current status', ru: 'Резервуары — текущее состояние' },

  // ── Аларми / Alarms ───────────────────────────────────────────────────────
  alarm_max_level:  { bg: 'Максимално ниво!', en: 'Maximum level!', ru: 'Максимальный уровень!' },
  alarm_min_level:  { bg: 'Минимално ниво!', en: 'Minimum level!', ru: 'Минимальный уровень!' },
  alarm_high_temp:  { bg: 'Висока температура!', en: 'High temperature!', ru: 'Высокая температура!' },

  // ── Избор на период / Period selector ─────────────────────────────────────
  period_24h:       { bg: '24 ч',        en: '24 h',        ru: '24 ч' },
  period_7d:        { bg: '7 дни',       en: '7 days',      ru: '7 дней' },
  period_30d:       { bg: '30 дни',      en: '30 days',     ru: '30 дней' },
  period_custom:    { bg: 'По избор',    en: 'Custom',      ru: 'Произвольно' },
  from:             { bg: 'От',          en: 'From',        ru: 'От' },
  to:               { bg: 'До',          en: 'To',          ru: 'До' },
  show:             { bg: 'Покажи',      en: 'Show',        ru: 'Показать' },
  invalid_period:   { bg: 'Невалиден период', en: 'Invalid period', ru: 'Неверный период' },

  // ── Тренд графика / Trend chart ───────────────────────────────────────────
  trend_title:      { bg: 'Тренд графика', en: 'Trend chart', ru: 'График тренда' },
  metric_level:     { bg: 'Ниво (%)',    en: 'Level (%)',   ru: 'Уровень (%)' },
  metric_temp:      { bg: 'Температура (°C)', en: 'Temperature (°C)', ru: 'Температура (°C)' },
  metric_mass:      { bg: 'Маса (t)',    en: 'Mass (t)',    ru: 'Масса (т)' },

  // ── Детайл за резервоар / Tank detail ─────────────────────────────────────
  detail_level:     { bg: 'Ниво',        en: 'Level',       ru: 'Уровень' },
  detail_temp:      { bg: 'Температура', en: 'Temperature', ru: 'Температура' },
  detail_mass:      { bg: 'Маса',        en: 'Mass',        ru: 'Масса' },
  detail_level_mm:  { bg: 'Ниво (mm)',   en: 'Level (mm)',  ru: 'Уровень (мм)' },
  detail_entered:   { bg: 'Постъпил материал', en: 'Incoming material', ru: 'Поступивший материал' },
  detail_used:      { bg: 'Изразходван материал', en: 'Used material', ru: 'Израсходованный материал' },

  // ── Статистика / Statistics ───────────────────────────────────────────────
  stats_title:      { bg: 'Статистика',  en: 'Statistics',  ru: 'Статистика' },
  kpi_incoming:     { bg: 'Постъпила суровина', en: 'Incoming material', ru: 'Поступившее сырьё' },
  kpi_outgoing:     { bg: 'Изпомпено от резервоара', en: 'Pumped from the tank', ru: 'Откачивается из резервуара' },
  kpi_remainder:    { bg: 'Реализация (остатък)', en: 'Realization (remainder)', ru: 'Реализация (остаток)' },
  chart_incoming_by_tank: { bg: 'Постъпила суровина по резервоар [t]', en: 'Incoming material by tank [t]', ru: 'Поступившее сырьё по резервуарам [т]' },
  chart_outgoing_by_tank: { bg: 'Изпомпано количество по резервоар [t]', en: 'Pumped quantity per tank [t]', ru: 'Kоличество перекачиваемого вещества на резервуар [т]' },
  chart_compare_fill: { bg: 'Сравнение — текущо запълване [%]', en: 'Comparison — current fill [%]', ru: 'Сравнение — текущее заполнение [%]' },
  stats_error:      { bg: 'Грешка при зареждане на статистиката!', en: 'Error loading statistics!', ru: 'Ошибка загрузки статистики!' },
  legend_avg_level: { bg: 'Средно ниво %', en: 'Average level %', ru: 'Средний уровень %' },
  bar_incoming:     { bg: 'Постъпила [t]', en: 'Incoming [t]', ru: 'Поступило [т]' },
  bar_outgoing:     { bg: 'Изпратена [t]', en: 'Sent [t]', ru: 'Отправлено [т]' },

  // ── Таблица с данни / Readings table ──────────────────────────────────────
  col_datetime:     { bg: 'Дата / Час',  en: 'Date / Time', ru: 'Дата / Время' },
  col_level_pct:    { bg: 'Ниво (%)',    en: 'Level (%)',   ru: 'Уровень (%)' },
  col_level_mm:     { bg: 'Ниво (mm)',   en: 'Level (mm)',  ru: 'Уровень (мм)' },
  col_temp:         { bg: 'Температура', en: 'Temperature', ru: 'Температура' },
  col_mass:         { bg: 'Маса',        en: 'Mass',        ru: 'Масса' },
  col_alarms:       { bg: 'Аларми',      en: 'Alarms',      ru: 'Тревоги' },
  col_overheat:     { bg: 'Прегряване',  en: 'Overheat',    ru: 'Перегрев' },
  history_title:    { bg: 'Исторически данни', en: 'Historical data', ru: 'Исторические данные' },
  records:          { bg: 'записа',      en: 'records',     ru: 'записей' },
  search_by_date:   { bg: 'Търси по дата...', en: 'Search by date...', ru: 'Поиск по дате...' },
  download_csv:     { bg: 'Изтегли CSV', en: 'Download CSV', ru: 'Скачать CSV' },
  no_data_period:   { bg: 'Няма данни за избрания период', en: 'No data for the selected period', ru: 'Нет данных за выбранный период' },
  chip_max_level:   { bg: 'Макс ниво',   en: 'Max level',   ru: 'Макс. уровень' },
  chip_min_level:   { bg: 'Мин ниво',    en: 'Min level',   ru: 'Мин. уровень' },
  chip_high_temp:   { bg: 'Висока °C',   en: 'High °C',     ru: 'Высокая °C' },
  rows_per_page:    { bg: 'Редове:',     en: 'Rows:',       ru: 'Строк:' },
  csv_alarm_max:    { bg: 'Аларма макс', en: 'Alarm max',   ru: 'Тревога макс' },
  csv_alarm_min:    { bg: 'Аларма мин',  en: 'Alarm min',   ru: 'Тревога мин' },
  csv_yes:          { bg: 'ДА',          en: 'YES',         ru: 'ДА' },
  csv_no:           { bg: 'НЕ',          en: 'NO',          ru: 'НЕТ' },

  // ── Настройки / Settings ──────────────────────────────────────────────────
  settings_title:   { bg: 'Настройки на резервоари', en: 'Tank settings', ru: 'Настройки резервуаров' },
  settings_load_error: { bg: 'Грешка при зареждане!', en: 'Loading error!', ru: 'Ошибка загрузки!' },
  section_basic:    { bg: 'Основни параметри', en: 'Basic parameters', ru: 'Основные параметры' },
  field_name:       { bg: 'Наименование', en: 'Name',       ru: 'Наименование' },
  field_diameter:   { bg: 'Диаметър D [m]', en: 'Diameter D [m]', ru: 'Диаметр D [м]' },
  field_diameter_help: { bg: 'Вътрешен диаметър на резервоара', en: 'Inner diameter of the tank', ru: 'Внутренний диаметр резервуара' },
  field_height:     { bg: 'Височина H [m]', en: 'Height H [m]', ru: 'Высота H [м]' },
  section_physical: { bg: 'Физически параметри', en: 'Physical parameters', ru: 'Физические параметры' },
  field_rel_weight: { bg: 'Относително тегло ρ [kg/m³]', en: 'Relative weight ρ [kg/m³]', ru: 'Относительный вес ρ [кг/м³]' },
  field_rel_weight_help: { bg: 'Напр. 850 за дизел', en: 'E.g. 850 for diesel', ru: 'Напр. 850 для дизеля' },
  field_correction: { bg: 'Корекционен коефициент', en: 'Correction coefficient', ru: 'Поправочный коэффициент' },
  field_dead_volume: { bg: 'Мъртъв обем [m]', en: 'Dead volume [m]', ru: 'Мёртвый объём [м]' },
  field_dead_volume_help: { bg: 'Ниво под долния сензор', en: 'Level below the bottom sensor', ru: 'Уровень ниже нижнего датчика' },
  field_filter:     { bg: 'Филтрационен коефициент', en: 'Filter coefficient', ru: 'Коэффициент фильтрации' },
  section_alarms:   { bg: 'Гранични стойности за аларми', en: 'Alarm limit values', ru: 'Граничные значения тревог' },
  field_limit_temp: { bg: 'Максимална температура [°C]', en: 'Maximum temperature [°C]', ru: 'Максимальная температура [°C]' },
  field_limit_temp_help: { bg: 'Алармира при превишаване', en: 'Alarms when exceeded', ru: 'Тревога при превышении' },
  field_sens_plus:  { bg: 'Корекция + [mm]', en: 'Correction + [mm]', ru: 'Коррекция + [мм]' },
  field_sens_minus: { bg: 'Корекция - [mm]', en: 'Correction - [mm]', ru: 'Коррекция - [мм]' },
  formula_label:    { bg: 'Формула за изчисляване на маса:', en: 'Mass calculation formula:', ru: 'Формула расчёта массы:' },
  max_volume:       { bg: 'Максимален обем', en: 'Maximum volume', ru: 'Максимальный объём' },
  max_mass:         { bg: 'Максимална маса', en: 'Maximum mass', ru: 'Максимальная масса' },
  saving:           { bg: 'Запазване...', en: 'Saving...',  ru: 'Сохранение...' },
  save_settings:    { bg: 'Запази настройките', en: 'Save settings', ru: 'Сохранить настройки' },
  settings_saved:   { bg: 'Настройките за Резервоар {n} са запазени!', en: 'Settings for Tank {n} saved!', ru: 'Настройки для резервуара {n} сохранены!' },
  settings_save_error: { bg: 'Грешка при запазване на настройките!', en: 'Error saving settings!', ru: 'Ошибка сохранения настроек!' },
};
