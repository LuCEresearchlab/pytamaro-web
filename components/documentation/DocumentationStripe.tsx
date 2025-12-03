import { MenuBookOutlined } from '@mui/icons-material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import { uniqWith } from 'lodash';
import { useCallback, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useDocumentationElements } from '../../src/documentation';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  AnalysisResult,
  PythonName,
} from '../../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../../src/schemas/activitySchema';
import theme from '../../src/theme';
import { visibleDefinedFunctions } from '../../src/useAnalysisResult';
import { FilesAnalysisResult } from '../../src/usePythonAnalyzer';
import DocElement from './DocElement';

const COLLAPSED_HEIGHT = 1.5 * theme.typography.htmlFontSize;

export default function DocumentationStripe({
  analysisResult,
  activityVariant,
  extraPythonFilesAnalysisResults = [],
}: {
  analysisResult: AnalysisResult | undefined;
  activityVariant: ActivityVariant;
  extraPythonFilesAnalysisResults?: FilesAnalysisResult;
}) {
  const { t } = useLocalTranslation();
  const [namesMultipleLines, setNamesMultipleLines] = useState(false);
  const [namesExpanded, setNamesExpanded] = useState(false);

  const importedNames = analysisResult?.imported_names || [];
  const possiblyImplicitlyImportedNames =
    analysisResult?.called_names.map(
      (info) => new PythonName('builtins', info.name),
    ) || [];
  const allImportedNames = importedNames.concat(
    possiblyImplicitlyImportedNames,
  );
  const uniqueImportedNames = uniqWith(
    allImportedNames,
    (n1, n2) => n1.name === n2.name && n1.module === n2.module,
  );

  const onResize = useCallback(
    ({ entry }: { entry: ResizeObserverEntry | null }) => {
      const target: HTMLDivElement | null = entry?.target as HTMLDivElement;
      setNamesMultipleLines(target && target.scrollHeight > COLLAPSED_HEIGHT);
    },
    [],
  );
  const { ref: elementsRef } = useResizeDetector({ onResize });

  const toggleNamesExpanded = () => setNamesExpanded(!namesExpanded);

  const namesToDocElement = useDocumentationElements(
    uniqueImportedNames,
    visibleDefinedFunctions(analysisResult),
    extraPythonFilesAnalysisResults,
  );

  if (namesToDocElement.length === 0) {
    return null;
  }

  return (
    <Box bgcolor={theme.pytamaro.palette.background.light}>
      <Stack
        direction='row'
        columnGap={0.7}
        alignItems='baseline'
        useFlexGap
        marginX={0.5}
      >
        <Tooltip arrow title={t('documentation')} placement='top'>
          <MenuBookOutlined
            sx={{
              fontSize: '1em',
              transform: 'translateY(0.15em)',
              marginX: theme.spacing(0.5),
            }}
            color='primary'
          />
        </Tooltip>
        <Stack
          direction='row'
          rowGap={0.1}
          columnGap={1}
          alignItems='baseline'
          useFlexGap
          flexWrap='wrap'
          overflow='hidden'
          ref={elementsRef}
          maxHeight={namesExpanded ? 'none' : COLLAPSED_HEIGHT}
        >
          {namesToDocElement.map(({ module, element }) => (
            <DocElement
              key={`${module}-${element?.name}`}
              module={module}
              element={element}
              smallerFont
              activityVariant={activityVariant}
            />
          ))}
        </Stack>
        <Chip
          size='small'
          label={namesExpanded ? t('showLess') : t('showAll')}
          deleteIcon={<ExpandMore />}
          sx={{
            flexGrow: '1',
            height: '1rem',
            visibility: namesMultipleLines ? 'visible' : 'hidden',
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
