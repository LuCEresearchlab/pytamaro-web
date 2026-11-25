import DownloadIcon from '@mui/icons-material/Download';
import { Button } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';
import downloadSourceCode from '../src/codeDownload';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import type { ActivitySession } from '../src/activitySession';
import type { PythonFile } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { sourceFromCell } from '../src/useActivity';

function formatCells(activitySession: ActivitySession) {
  const sources = activitySession.getCodeCells().map(sourceFromCell);
  const formattedSources = sources.flatMap((source, idx) => [
    `# === Code Cell ${idx + 1} ===`,
    source,
    '',
  ]);
  return joinLines(formattedSources);
}

export default function DownloadCodeButton({
  activitySession,
  extraPythonFiles = [],
}: {
  activitySession: ActivitySession;
  extraPythonFiles?: PythonFile[];
}) {
  const { getFunction } = useLocalToolbox();
  const { t } = useTranslation('activityfooter');
  return (
    <Button
      variant='contained'
      color='primary'
      startIcon={<DownloadIcon />}
      onClick={() =>
        downloadSourceCode(
          formatCells(activitySession),
          extraPythonFiles,
          getFunction,
        )
      }
    >
      <span>{t('downloadPythonSource')}</span>
    </Button>
  );
}
