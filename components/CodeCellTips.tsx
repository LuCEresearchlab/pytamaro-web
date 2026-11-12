import Assignment from '@mui/icons-material/Assignment';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import { Alert } from '@mui/material';
import { Trans } from 'react-i18next';
import { PythonMode } from '../src/execution/codeExecution';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { PythonName } from '../src/python-analyzer/python_analyzer';
import theme from '../src/theme';

export function NoOutputTip({
  dimmed,
  importedNames,
  pythonMode = PythonMode.Exec,
}: {
  dimmed: boolean;
  importedNames: PythonName[] | undefined;
  pythonMode?: PythonMode;
}) {
  const { t } = useLocalTranslation();
  const showGraphicNames: Record<string, string> = {
    pytamaro: 'show_graphic',
    'pytamaro.it': 'visualizza_grafica',
    'pytamaro.de': 'zeige_grafik',
    'pytamaro.fr': 'montre_graphique',
  };
  // Pick the language based on the first import from one of the pytamaro modules.
  const moduleName = importedNames?.find(
    ({ module }) => module in showGraphicNames,
  )?.module;
  return (
    <Alert
      iconMapping={{
        success: <TipsAndUpdates fontSize='inherit' />,
      }}
      sx={{
        opacity: dimmed ? theme.palette.action.disabledOpacity : undefined,
        width: '100%',
      }}
    >
      <span>{t('noOutputTip')}</span>
      {moduleName !== undefined && pythonMode !== PythonMode.EvalLastExpr && (
        <span>
          {' '}
          <Trans
            t={t}
            i18nKey='useShowGraphicTip'
            values={{ apiName: showGraphicNames[moduleName] }}
            components={{ code: <code /> }}
          />
        </span>
      )}
    </Alert>
  );
}

export function EllipsisTip() {
  const { t } = useLocalTranslation();
  return (
    <Alert
      iconMapping={{
        success: <Assignment fontSize='inherit' />,
      }}
    >
      <Trans t={t} i18nKey='ellipsisTip' components={{ code: <code /> }} />
    </Alert>
  );
}
