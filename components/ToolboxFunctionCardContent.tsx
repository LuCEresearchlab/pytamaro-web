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
import { useContext, useEffect, useState } from 'react';
import useActivitySession from '../src/activitySession';
import { ExecutorContext } from '../src/execution/executorContext';
import { ToolboxFunction } from '../src/localStorage/schema';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { isPlaygroundVariant } from '../src/playground';
import { toolboxActivityVariant } from '../src/specialActivities';
import {
  activityVariantPathname,
  playgroundPathname,
  toolboxFunctionPathname,
} from '../src/urlUtils';
import useTemporaryActivity from '../src/useTemporaryActivity';
import CodeEditor from './CodeEditor';
import SolitaryCodeCell, { singleCodeCell } from './SolitaryCodeCell';
import FunctionCardContent from './documentation/FunctionDocumentation';
import { toolboxToJudiciousFunction } from './documentation/utils';

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
  const usageCodeCells = singleCodeCell(fn.usage);
  const activityVariant = toolboxActivityVariant(fn.name);
  const fnActivitySession = useActivitySession(singleCodeCell(fn.source));
  const activityState = useTemporaryActivity(usageCodeCells, activityVariant);
  const usageSession = activityState.activitySession;

  // The sessions are created once, but `fn` can be edited while this card is mounted.
  // Keep their initial cells in sync with the current function.
  useEffect(() => {
    if (fnActivitySession.getInitialSource(0) !== fn.source) {
      fnActivitySession.replaceInitialCodeCells(singleCodeCell(fn.source));
    }
  }, [fn.source, fnActivitySession]);
  useEffect(() => {
    if (usageSession.getInitialSource(0) !== fn.usage) {
      usageSession.replaceInitialCodeCells(singleCodeCell(fn.usage));
    }
  }, [fn.usage, usageSession]);
  const originalActivityPathname = isPlaygroundVariant(fn.originalActivity)
    ? playgroundPathname()
    : activityVariantPathname(fn.originalActivity);

  const { executorState } = useContext(ExecutorContext);

  return (
    <CardContent sx={{ pb: 1, minWidth: '80ch' }}>
      <FunctionCardContent
        fn={toolboxToJudiciousFunction(fn)}
        module='toolbox'
      />
      <Box
        sx={{
          my: 2,
        }}
      >
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
          <Typography
            component='span'
            sx={{
              color: 'text.secondary',
              fontWeight: 'bold',
            }}
          >
            {t('toolbox.implementation')}
          </Typography>
          <FormGroup sx={{ display: 'inline', marginLeft: 2 }}>
            <FormControlLabel
              control={
                <Switch checked={showSource} onChange={toggleShowSource} />
              }
              label={
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {showSource ? t('toolbox.hide') : t('toolbox.show')}
                </Typography>
              }
            />
          </FormGroup>
          {showSource && (
            <CodeEditor readOnly context={fnActivitySession.editorContext(0)} />
          )}
        </Box>
      )}
      <Typography
        component='span'
        gutterBottom
        sx={{
          color: 'text.secondary',
          fontWeight: 'bold',
        }}
      >
        {t('toolbox.usage')}
      </Typography>
      {!summary && (
        <FormGroup sx={{ display: 'inline', marginLeft: 2 }}>
          <FormControlLabel
            control={<Switch checked={showUsage} onChange={toggleShowUsage} />}
            label={
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                {showUsage ? t('toolbox.hide') : t('toolbox.show')}
              </Typography>
            }
          />
        </FormGroup>
      )}
      {showUsage && (
        <SolitaryCodeCell
          activityState={activityState}
          activityVariant={activityVariant}
          runEnabled={executorState.type === 'available'}
          readOnly
        />
      )}
    </CardContent>
  );
}
