import { ExpandMore } from '@mui/icons-material';
import {
  Box, Chip, Stack, Typography,
} from '@mui/material';
import {
  flatten, isEqual, reverse,
  uniqWith,
} from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import PyTamaroNames from '../src/pytamaroNames';
import { PythonName, analyze } from '../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../src/schemas/activitySchema';
import theme from '../src/theme';
import PyTamaroAPI from './PyTamaroAPI';

export default function DocumentationStripe({ sources, activityVariant } :
{ sources: string[], activityVariant: ActivityVariant }) {
  const { t } = useLocalTranslation();
  const [namesPerCell, setNamesPerCell] = useState<PythonName[][]>();
  const [tooManyNames, setTooManyNames] = useState(false);
  const [namesExpanded, setNamesExpanded] = useState(false);
  useEffect(() => {
    const newNamesPerCell = sources.map((source) => analyze(source).imported_names);
    setNamesPerCell(newNamesPerCell);
  }, [sources]);
  const moduleToLanguage: Record<string, string> = {
    // eslint-disable-next-line quote-props
    'pytamaro': 'en',
    'pytamaro.it': 'it',
    'pytamaro.de': 'de',
    'pytamaro.fr': 'fr',
  };
  const key = (module: string, name: string) => `${moduleToLanguage[module]}.${name}`;
  const isKnown = ({ module, name } : PythonName) => module in moduleToLanguage
   && key(module, name) in PyTamaroNames;

  const knownNamesPerCell = namesPerCell?.map((names) => names.filter(isKnown));

  const onResize = useCallback(({ entry } : { entry: ResizeObserverEntry | null }) => {
    const target : HTMLDivElement | null = entry?.target as HTMLDivElement;
    setTooManyNames(target && target.offsetHeight < target.scrollHeight);
  }, []);
  const { ref: elementsRef } = useResizeDetector({ onResize });

  const toggleNamesExpanded = () => setNamesExpanded(!namesExpanded);

  const namesToShow = uniqWith(flatten(reverse(knownNamesPerCell || [])), isEqual);

  if (namesToShow.length === 0) {
    return null;
  }

  return (
    <Box>
      <Stack direction="row" columnGap={1} alignItems="baseline" useFlexGap marginX={0.5}>
        {namesToShow.length > 0 && (
          <Typography variant="body2">
            Docs:
          </Typography>
        )}
        <Stack direction="row" rowGap={0.33} columnGap={1} alignItems="baseline" useFlexGap flexWrap="wrap" overflow="hidden" ref={elementsRef} maxHeight={namesExpanded ? 'none' : '1.2rem'}>
          {namesToShow.map(({ module, name }) => (
            <PyTamaroAPI
              key={key(module, name)}
              name={name}
              language={moduleToLanguage[module]}
              activityVariant={activityVariant}
              smallerFont
            />
          ))}
        </Stack>
        <Chip
          size="small"
          label={namesExpanded ? t('showLess') : t('showAll')}
          deleteIcon={<ExpandMore />}
          sx={{
            flexGrow: '1',
            height: '1rem',
            visibility: (tooManyNames || namesExpanded) ? 'visible' : 'hidden',
            '.MuiChip-deleteIcon': {
              transform: `rotate(${namesExpanded ? 180 : 0}deg)`,
              transition: `transform ${theme.transitions.duration.shortest}ms`,
            },
          }}
          onClick={toggleNamesExpanded}
          onDelete={toggleNamesExpanded}
        />
      </Stack>
    </Box>
  );
}
