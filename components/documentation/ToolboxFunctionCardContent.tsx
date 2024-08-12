import {
  Box, Button, FormControlLabel, FormGroup, Switch, Typography,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { TFunction } from 'i18next';
import { ToolboxFunction } from '../../src/localStorage/schema';
import { toolboxActivityVariant } from '../../src/specialActivities';
import {
  activityVariantPathname,
  toolboxFunctionAnchor,
} from '../../src/urlUtils';
import useReadOnlyTemporaryActivity from '../../src/useReadOnlyTemporaryActivity';
import CodeEditor from '../CodeEditor';
import SolitaryCodeCell, { initialStateSingleCell } from '../SolitaryCodeCell';
import { JsonObjType, LibraryString, translateToFunction } from '../../src/JsonAst/Json_structure';
import DocumentationCardContent from './DocumentationCardContent';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { ActivityVariant } from '../../src/schemas/activitySchema';

let t: TFunction<string[], undefined>;

function LinkButton(
  name: string,
  originalActivity: ActivityVariant,
  summary: boolean,
): JSX.Element {
  return (
    <Button
      component={Link}
// href={summary ? toolboxFunctionPathname(fn.name) : activityVariantPathname(fn.originalActivity)}
      href={summary ? `\\documentation#${toolboxFunctionAnchor(name)}` : activityVariantPathname(originalActivity)}
      target="_blank"
      variant="outlined"
      size="small"
      sx={{ ml: 'auto' }}
    >
      {summary ? t('documentationPopUp.viewDetails') : t('documentationPopUp.viewOriginalActivity')}
    </Button>
  );
}

function ImplementationAndUsage(name: string, usage: string, source: string, summary: boolean) {
  const [showSource, setShowSource] = useState(false);
  const [showUsage, setShowUsage] = useState(summary);
  const toggleShowSource = () => setShowSource(!showSource);
  const toggleShowUsage = () => setShowUsage(!showUsage);
  const usageCodeCells = initialStateSingleCell(usage);
  const activityVariant = toolboxActivityVariant(name);
  const activity = useReadOnlyTemporaryActivity(usageCodeCells, activityVariant);

  return (
    <>
      {!summary && (
      <Box sx={{ my: 2 }}>
        <Typography color="text.secondary" fontWeight="bold" component="span">
          {t('documentationPopUp.implementation')}
        </Typography>
        <FormGroup sx={{
          display: 'inline',
          marginLeft: 2,
        }}
        >
          <FormControlLabel
            control={<Switch checked={showSource} onChange={toggleShowSource} />}
            label={(
              <Typography
                color="text.secondary"
              >
                {showSource ? t('hide') : t('show')}
              </Typography>
)}
          />
        </FormGroup>
        {showSource && (
        <CodeEditor
          initialSource={source}
          currentSource={source}
          readOnly
        />
        )}
      </Box>
      )}
      <Typography color="text.secondary" fontWeight="bold" component="span" gutterBottom>
        {t('documentationPopUp.usage')}
      </Typography>
      {!summary && (
      <FormGroup sx={{
        display: 'inline',
        marginLeft: 2,
      }}
      >
        <FormControlLabel
          control={<Switch checked={showUsage} onChange={toggleShowUsage} />}
          label={(
            <Typography
              color="text.secondary"
            >
              {showUsage ? t('hide') : t('show')}
            </Typography>
)}
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
    </>
  );
}

export default function ToolboxFunctionCardContent(
  {
    fn,
    summary = false,
  }:
  Readonly<{
    fn: ToolboxFunction
    summary?: boolean
  }>,
) {
  const translated = translateToFunction(fn);
  t = useLocalTranslation().t;

  return (
    <DocumentationCardContent
      obj={translated}
      obj_type={JsonObjType.function}
      library={LibraryString.Toolbox}
      ImplementationAndUsage={ImplementationAndUsage(fn.name, fn.usage, fn.source, summary)}
      LinkButton={LinkButton(fn.name, fn.originalActivity, summary)}
      showTypeInitial
    />
  );
}
