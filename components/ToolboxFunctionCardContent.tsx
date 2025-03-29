import {
  Box,
  Button,
  CardContent,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { ToolboxFunction } from '../src/localStorage/schema';
import { isPlaygroundVariant } from '../src/playground';
import { toolboxActivityVariant } from '../src/specialActivities';
import {
  activityVariantPathname,
  playgroundPathname,
  toolboxFunctionPathname,
} from '../src/urlUtils';
import useReadOnlyTemporaryActivity from '../src/useReadOnlyTemporaryActivity';
import CodeEditor from './CodeEditor';
import SolitaryCodeCell, { initialStateSingleCell } from './SolitaryCodeCell';
import FunctionCardContent from './documentation/FunctionDocumentation';
import { toolboxToJudiciousFunction } from './documentation/utils';

export default function ToolboxFunctionCardContent({
  fn,
  summary = false,
}: {
  fn: ToolboxFunction;
  summary?: boolean;
}) {
  const [showSource, setShowSource] = useState(false);
  const [showUsage, setShowUsage] = useState(summary);
  const toggleShowSource = () => setShowSource(!showSource);
  const toggleShowUsage = () => setShowUsage(!showUsage);
  const usageCodeCells = initialStateSingleCell(fn.usage);
  const activityVariant = toolboxActivityVariant(fn.name);
  const activity = useReadOnlyTemporaryActivity(
    usageCodeCells,
    activityVariant,
  );
  const originalActivityPathname = isPlaygroundVariant(fn.originalActivity)
    ? playgroundPathname()
    : activityVariantPathname(fn.originalActivity);
  return (
    <CardContent sx={{ pb: 1, minWidth: '80ch' }}>
      <FunctionCardContent
        fn={toolboxToJudiciousFunction(fn)}
        module='toolbox'
      />
      <Box my={2}>
        <Button
          component={Link}
          href={
            summary
              ? toolboxFunctionPathname(fn.name)
              : originalActivityPathname
          }
          target='_blank'
          variant='outlined'
          size='small'
        >
          {summary ? 'View Details' : 'View Original Activity'}
        </Button>
      </Box>
      {!summary && (
        <Box sx={{ my: 1 }}>
          <Typography color='text.secondary' fontWeight='bold' component='span'>
            Implementation
          </Typography>
          <FormGroup sx={{ display: 'inline', marginLeft: 2 }}>
            <FormControlLabel
              control={
                <Switch checked={showSource} onChange={toggleShowSource} />
              }
              label={
                <Typography color='text.secondary'>
                  {showSource ? 'Hide' : 'Show'}
                </Typography>
              }
            />
          </FormGroup>
          {showSource && (
            <CodeEditor
              initialSource={fn.source}
              currentSource={fn.source}
              readOnly
            />
          )}
        </Box>
      )}
      <Typography
        color='text.secondary'
        fontWeight='bold'
        component='span'
        gutterBottom
      >
        Usage
      </Typography>
      {!summary && (
        <FormGroup sx={{ display: 'inline', marginLeft: 2 }}>
          <FormControlLabel
            control={<Switch checked={showUsage} onChange={toggleShowUsage} />}
            label={
              <Typography color='text.secondary'>
                {showUsage ? 'Hide' : 'Show'}
              </Typography>
            }
          />
        </FormGroup>
      )}
      {showUsage && (
        <SolitaryCodeCell
          activity={activity}
          activityVariant={activityVariant}
          readOnly
        />
      )}
    </CardContent>
  );
}
