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
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
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
import TryItButton from './TryItButton';

export default function ToolboxFunctionCardContent({
  fn,
  summary = false,
}: {
  fn: ToolboxFunction;
  summary?: boolean;
}) {
  const { t } = useLocalTranslation();
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
          {summary
            ? t('toolbox.viewDetails')
            : t('toolbox.viewOriginalActivity')}
        </Button>
      </Box>
      {!summary && (
        <Box sx={{ my: 1 }}>
          <Typography color='text.secondary' fontWeight='bold' component='span'>
            {t('toolbox.implementation')}
          </Typography>
          <FormGroup sx={{ display: 'inline', marginLeft: 2 }}>
            <FormControlLabel
              control={
                <Switch checked={showSource} onChange={toggleShowSource} />
              }
              label={
                <Typography color='text.secondary'>
                  {showSource ? t('toolbox.hide') : t('toolbox.show')}
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
        {t('toolbox.usage')}
      </Typography>
      {!summary && (
        <FormGroup sx={{ display: 'inline', marginLeft: 2 }}>
          <FormControlLabel
            control={<Switch checked={showUsage} onChange={toggleShowUsage} />}
            label={
              <Typography color='text.secondary'>
                {showUsage ? t('toolbox.hide') : t('toolbox.show')}
              </Typography>
            }
          />
        </FormGroup>
      )}
      {showUsage && (
        <SolitaryCodeCell
          activity={activity}
          activityVariant={activityVariant}
          extraActions={
            <>
              <TryItButton code={activity.codeCells[0].source} />
            </>
          }
          readOnly
        />
      )}
    </CardContent>
  );
}
