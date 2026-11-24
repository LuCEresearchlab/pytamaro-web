import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { parseCsv, type CsvSeparator } from '../src/csv';
import { decodeText } from '../src/ide/fileContent';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

const SEPARATORS: readonly { value: CsvSeparator; labelKey: string }[] = [
  { value: ',', labelKey: 'csvSeparatorComma' },
  { value: ';', labelKey: 'csvSeparatorSemicolon' },
  { value: '\t', labelKey: 'csvSeparatorTab' },
];

/**
 * Shows the content of a CSV file as a table. The first row is treated as the
 * header row by default. The separator and whether the first row is a header
 * can be changed from the table's toolbar.
 */
export default function CsvPreview({
  name,
  content,
}: {
  name: string;
  content: Uint8Array;
}) {
  const { t } = useLocalTranslation(['ide']);
  const defaultSeparator: CsvSeparator = name.toLowerCase().endsWith('.tsv')
    ? '\t'
    : ',';
  const [separator, setSeparator] = useState<CsvSeparator>(defaultSeparator);
  const [hasHeader, setHasHeader] = useState(true);
  const rows = useMemo(
    () => parseCsv(decodeText(content) ?? '', separator),
    [content, separator],
  );

  const columnCount = rows.reduce(
    (widest, row) => Math.max(widest, row.length),
    0,
  );
  const headerRow = hasHeader ? rows[0] : undefined;
  const bodyRows = rows.slice(hasHeader ? 1 : 0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  return (
    <Box
      data-testid='csv-preview'
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flex: '0 0 auto',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 3,
          paddingX: 2,
          paddingBottom: 1,
          color: 'primary.main',
          fontSize: 13,
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span>{t('csvSeparator')}</span>
          <Select
            variant='standard'
            disableUnderline
            size='small'
            value={separator}
            onChange={(event) =>
              setSeparator(event.target.value as CsvSeparator)
            }
            inputProps={{ 'aria-label': t('csvSeparator') }}
            data-testid='csv-separator-select'
            sx={{
              marginLeft: '1ch',
              fontSize: 'inherit',
              color: 'inherit',
              fontWeight: 600,
              '& .MuiSelect-select': {
                padding: 0,
                paddingRight: '2ch',
                minHeight: 0,
              },
              '& .MuiSelect-icon': {
                right: 0,
                width: '1.5ch',
                height: '1.5ch',
                top: 'calc(50% - 0.75ch)',
              },
            }}
          >
            {SEPARATORS.map(({ value, labelKey }) => (
              <MenuItem key={labelKey} value={value} sx={{ fontSize: 13 }}>
                {t(labelKey)}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              size='small'
              checked={hasHeader}
              onChange={(event) => setHasHeader(event.target.checked)}
              sx={{ padding: 0.5 }}
            />
          }
          label={t('csvHeaderRow')}
          data-testid='csv-header-toggle'
          sx={{
            margin: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: 'inherit',
              fontWeight: 'inherit',
            },
          }}
        />
      </Box>
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table
          size='small'
          stickyHeader
          sx={{ width: 'max-content', minWidth: '100%' }}
        >
          {headerRow !== undefined && (
            <TableHead>
              <TableRow>
                {Array.from({ length: columnCount }, (_, column) => (
                  <TableCell
                    key={column}
                    sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {headerRow[column] ?? ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {(rowsPerPage > 0
              ? bodyRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              : bodyRows
            ).map((row, rowIndex) => (
              // Rows have no stable identity in a static preview.
              // eslint-disable-next-line react/no-array-index-key
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }, (_, column) => (
                  <TableCell key={column} sx={{ whiteSpace: 'nowrap' }}>
                    {row[column] ?? ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 100, 200, 500, 1000]}
                count={bodyRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setPage(0);
                  setRowsPerPage(parseInt(e.target.value, 10));
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}
