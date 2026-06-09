import { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, InputAdornment, IconButton, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  formatDateTime,
  formatLevel,
  formatTemp,
  formatMass,
} from '../../utils/formatters';
import { useT } from '../../i18n/LanguageContext';

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];

const COLUMNS = [
  { id: 'time', labelKey: 'col_datetime', minWidth: 170 },
  { id: 'level_pct', labelKey: 'col_level_pct', minWidth: 100, align: 'right' },
  { id: 'temperature', labelKey: 'col_temp', minWidth: 110, align: 'right' },
  { id: 'mass', labelKey: 'col_mass', minWidth: 110, align: 'right' },
  { id: 'overheat', labelKey: 'col_overheat', minWidth: 90, align: 'center' },
  { id: 'max_alarm', labelKey: 'chip_max_level', minWidth: 90, align: 'center' },
  { id: 'min_alarm', labelKey: 'chip_min_level', minWidth: 90, align: 'center' },
];

// ✓ когато няма аларма (0), ✕ когато има аларма (1).
function AlarmMark({ on }) {
  return on ? (
    <Typography component="span" color="error.main" fontWeight="bold">✕</Typography>
  ) : (
    <Typography component="span" color="success.main" fontWeight="bold">✓</Typography>
  );
}

// Конвертиране в CSV и изтегляне
function exportToCsv(rows, t) {
  const header = [
    t('col_datetime'),
    t('metric_level'),
    t('metric_temp'),
    t('metric_mass'),
    t('col_overheat'),
    t('csv_alarm_max'),
    t('csv_alarm_min'),
  ].join(',');
  const yes = t('csv_yes');
  const no = t('csv_no');
  const lines = rows.map((r) =>
    [
      r.time,
      r.level_pct?.toFixed(2),
      r.temperature?.toFixed(2),
      r.mass?.toFixed(1),
      r.overheat_alarm ? yes : no,
      r.max_level_alarm ? yes : no,
      r.min_level_alarm ? yes : no,
    ].join(',')
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `readings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReadingsTable({ data = [], isLoading }) {
  const t = useT();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');

  // Филтриране по дата/час (търсене в текст)
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((r) =>
      formatDateTime(r.time).toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // При смяна на search/data - връщаме на страница 0
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const visibleRows = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ mt: 3 }}>
      {/* Заглавие + търсене + export */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6">
          {t('history_title')}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({filtered.length.toLocaleString('bg-BG')} {t('records')})
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Търсене по дата */}
          <TextField
            size="small"
            placeholder={t('search_by_date')}
            value={search}
            onChange={handleSearch}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Export CSV */}
          <Tooltip title={t('download_csv')}>
            <IconButton
              onClick={() => exportToCsv(filtered, t)}
              disabled={filtered.length === 0}
              color="primary"
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Таблица */}
      <TableContainer sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    minWidth: col.minWidth,
                    fontWeight: 700,
                    bgcolor: 'background.paper',
                  }}
                >
                  {t(col.labelKey)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {t('no_data_period')}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, idx) => {
                const hasAlarm = row.max_level_alarm || row.min_level_alarm || row.overheat_alarm;
                return (
                  <TableRow
                    key={`${row.time}-${idx}`}
                    hover
                    sx={{
                      bgcolor: hasAlarm ? 'rgba(244, 67, 54, 0.05)' : 'inherit',
                    }}
                  >
                    {/* Дата */}
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                      {formatDateTime(row.time)}
                    </TableCell>

                    {/* Ниво % */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {/* Мини прогрес бар */}
                        <Box
                          sx={{
                            width: 40,
                            height: 6,
                            bgcolor: 'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.min(row.level_pct, 100)}%`,
                              height: '100%',
                              bgcolor: row.max_level_alarm
                                ? '#f44336'
                                : row.min_level_alarm
                                ? '#ffeb3b'
                                : '#4caf50',
                              borderRadius: 3,
                            }}
                          />
                        </Box>
                        <Typography variant="body2">{formatLevel(row.level_pct)}</Typography>
                      </Box>
                    </TableCell>

                    {/* Температура */}
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={row.temperature >= 50 ? 'warning.main' : 'inherit'}
                        fontWeight={row.temperature >= 50 ? 600 : 400}
                      >
                        {formatTemp(row.temperature)}
                      </Typography>
                    </TableCell>

                    {/* Маса */}
                    <TableCell align="right">
                      <Typography variant="body2">{formatMass(row.mass)}</Typography>
                    </TableCell>

                    {/* Аларма прегряване */}
                    <TableCell align="center"><AlarmMark on={!!row.overheat_alarm} /></TableCell>
                    {/* Аларма макс ниво */}
                    <TableCell align="center"><AlarmMark on={!!row.max_level_alarm} /></TableCell>
                    {/* Аларма мин ниво */}
                    <TableCell align="center"><AlarmMark on={!!row.min_level_alarm} /></TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      <TablePagination
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t('rows_per_page')}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} ${t('of')} ${count.toLocaleString('bg-BG')}`
        }
      />
    </Paper>
  );
}