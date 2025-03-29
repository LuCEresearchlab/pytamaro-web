import Assignment from '@mui/icons-material/Assignment';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import { Alert, AlertTitle } from '@mui/material';
import { Trans } from 'react-i18next';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { PythonName } from '../src/python-analyzer/python_analyzer';

export function NoOutputTip({
  importedNames,
}: {
  importedNames: PythonName[];
}) {
  const { t } = useLocalTranslation();
  const showGraphicNames: Record<string, string> = {
    pytamaro: 'show_graphic',
    'pytamaro.it': 'visualizza_grafica',
    'pytamaro.de': 'zeige_grafik',
    'pytamaro.fr': 'montre_graphique',
  };
  // Pick the language based on the first import from one of the pytamaro modules.
  // Default to English ("pytamaro") if we do not find a suitable module.
  const moduleName =
    importedNames.find(({ module }) => module in showGraphicNames)?.module ||
    'pytamaro';
  const apiName = showGraphicNames[moduleName];
  return (
    <Alert
      iconMapping={{
        success: <TipsAndUpdates fontSize='inherit' />,
      }}
    >
      <Trans
        t={t}
        i18nKey='noOutputTip'
        values={{ apiName }}
        components={{ code: <code /> }}
      />
    </Alert>
  );
}

export function InputTip() {
  return (
    <Alert severity='warning'>
      <AlertTitle>
        Using the <code>input</code> function is currently not supported on this
        platform.
      </AlertTitle>
      {/* eslint-disable-next-line max-len */}
      This might be improved in the future. However, consider this general
      remark: mixing user interface aspects (input and output) with computations
      is not a good idea.
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
