import {
  Box,
  CardContent, FormControlLabel, FormGroup, Switch,
  Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { useState } from 'react';
import { ToolboxFunction } from '../src/localStorage/schema';
import useReadOnlyTemporaryActivity from '../src/localStorage/useReadOnlyTemporaryActivity';
import { toolboxActivityVariant } from '../src/specialActivities';
import theme from '../src/theme';
import CodeEditor from './CodeEditor';
import SolitaryCodeCell, { initialStateSingleCell } from './SolitaryCodeCell';

function TypeCell({ type } : { type: string }) {
  return type === ''
    ? <Typography component="span" fontStyle="italic" color="text.secondary">N/A</Typography>
    : <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>{type}</Typography>;
}

export default function ToolboxFunctionCard(
  {
    fn, sourceHidden,
  } :
  { fn : ToolboxFunction,
    sourceHidden: boolean
  },
) {
  const [showSource, setShowSource] = useState(false);
  const toggleShowSource = () => setShowSource(!showSource);
  const usageCodeCells = initialStateSingleCell(fn.usage);
  const activity = useReadOnlyTemporaryActivity(usageCodeCells, toolboxActivityVariant);
  return (
    <CardContent sx={{ pb: 1, minWidth: '80ch' }}>
      <Typography color="text.secondary" component="span" mr="1ch" fontWeight="bold">
        Function
      </Typography>
      <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>
        {fn.name}
      </Typography>
      <Typography color="text.secondary">
        {fn.description}
      </Typography>
      <Table aria-label="Function Parameters" size="small" sx={{ my: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Parameter/Return</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fn.args.map((arg) => (
            <TableRow
              key={arg.name}
            >
              <TableCell component="th" scope="row">
                <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.name}</Typography>
              </TableCell>
              <TableCell>
                <TypeCell type={arg.typeUnparsed} />
              </TableCell>
            </TableRow>
          ))}
          <TableRow
            key="return"
            sx={{
              borderTopStyle: 'double',
              borderTopColor: theme.palette.grey[300],
              '&:last-child td, &:last-child th': { border: 0 },
            }}
          >
            <TableCell component="th" scope="row">
              <Typography component="span">Return Value</Typography>
            </TableCell>
            <TableCell>
              <TypeCell type={fn.returnTypeUnparsed} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {!sourceHidden && (
        <Box sx={{ my: 2 }}>
          <Typography color="text.secondary" fontWeight="bold" component="span">
            Implementation
          </Typography>
          <FormGroup sx={{ display: 'inline', marginLeft: 2 }}>
            <FormControlLabel
              control={<Switch checked={showSource} onChange={toggleShowSource} />}
              label={<Typography color="text.secondary">{showSource ? 'Hide' : 'Show'}</Typography>}
            />
          </FormGroup>
          {showSource && (
          <CodeEditor
            source={fn.source}
            readOnly
          />
          )}
        </Box>
      )}
      <Typography color="text.secondary" fontWeight="bold">
        Usage
      </Typography>
      <SolitaryCodeCell
        activity={activity}
        activityVariant={toolboxActivityVariant}
        readOnly
      />
    </CardContent>
  );
}
