import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { ToolboxFunction } from '../src/localStorage/schema';
import theme from '../src/theme';
import CodeEditor from './CodeEditor';

function TypeCell({ type } : { type: string }) {
  return type === ''
    ? <Typography component="span" fontStyle="italic" color="text.secondary">N/A</Typography>
    : <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>{type}</Typography>;
}

export default function ToolboxFunctionSummary(
  {
    fn, showSource = true,
  } :
  { fn : ToolboxFunction,
    showSource?: boolean
  },
) {
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
      <Typography color="text.secondary" fontWeight="bold">
        Usage
      </Typography>
      <CodeEditor
        source={fn.usage}
        readOnly
      />
      {showSource && (
        <Accordion square sx={{ mt: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="source-content"
            id="source-header"
          >
            <Typography color="text.secondary" fontWeight="bold">Implementation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CodeEditor
              source={fn.source}
              readOnly
            />
          </AccordionDetails>
        </Accordion>
      )}
    </CardContent>
  );
}
