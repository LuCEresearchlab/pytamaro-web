import {
  Box,
  Button,
  Card,
  CardContent, FormControlLabel, FormGroup, Switch,
  Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { ToolboxFunction } from '../src/localStorage/schema';
import { toolboxActivityVariant } from '../src/specialActivities';
import theme from '../src/theme';
import { activityVariantPathname, toolboxFunctionPathname } from '../src/urlUtils';
import useReadOnlyTemporaryActivity from '../src/useReadOnlyTemporaryActivity';
import CodeEditor from './CodeEditor';
import SolitaryCodeCell, { initialStateSingleCell } from './SolitaryCodeCell';

function TypeCell({ type } : { type: string }) {
  return type === ''
    ? <Typography component="span" fontStyle="italic" color="text.secondary">N/A</Typography>
    : <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>{type}</Typography>;
}

export default function ToolboxFunctionCard(
  {
    fn, summary = false,
  } :
  { fn : ToolboxFunction,
    summary?: boolean
  },
) {
  const [showSource, setShowSource] = useState(false);
  const toggleShowSource = () => setShowSource(!showSource);
  const usageCodeCells = initialStateSingleCell(fn.usage);
  const activityVariant = toolboxActivityVariant(fn.name);
  const activity = useReadOnlyTemporaryActivity(usageCodeCells, activityVariant);
  const originalActivityPathname = activityVariantPathname(fn.originalActivity);
  return (
    <CardContent sx={{ pb: 1, minWidth: '80ch' }}>
      <Box display="flex">
        <Typography color="text.secondary" component="span" mr="1ch" fontWeight="bold">
          Function
        </Typography>
        <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>
          {fn.name}
        </Typography>
        <Button
          component={Link}
          href={summary ? toolboxFunctionPathname(fn.name) : originalActivityPathname}
          target="_blank"
          variant="outlined"
          size="small"
          sx={{ ml: 'auto' }}
        >
          {summary ? 'View Details' : 'View Original Activity'}
        </Button>
      </Box>
      <Typography color="text.secondary">
        {fn.description}
      </Typography>
      <Card sx={{ px: 2, my: 2 }}>
        <Table aria-label="Function Parameters" size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 0 }}>Parameter/Return</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fn.args.map((arg) => (
              <TableRow
                key={arg.name}
              >
                <TableCell component="th" scope="row" sx={{ pl: 0 }}>
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
              <TableCell component="th" scope="row" sx={{ pl: 0 }}>
                <Typography component="span">Return Value</Typography>
              </TableCell>
              <TableCell>
                <TypeCell type={fn.returnTypeUnparsed} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      {!summary && (
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
      <Typography color="text.secondary" fontWeight="bold" gutterBottom>
        Usage
      </Typography>
      <SolitaryCodeCell
        activity={activity}
        activityVariant={activityVariant}
        readOnly
      />
    </CardContent>
  );
}
