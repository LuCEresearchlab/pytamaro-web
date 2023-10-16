import DownloadIcon from '@mui/icons-material/Download';
import { Button } from '@mui/material';
import downloadSourceCode from '../src/codeDownload';
import { CodeCellState } from '../src/localStorage/schema';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import { PythonFile } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { sourceFromCell } from '../src/useActivity';

function formatCells(codeCells: CodeCellState[]) {
  const sources = codeCells.map(sourceFromCell);
  const formattedSources = sources.flatMap((source, idx) => [`# === Code Cell ${idx + 1} ===`, source, '']);
  return joinLines(formattedSources);
}

export default function DownloadCodeButton({ codeCells, extraPythonFiles = [] }:
{ codeCells: CodeCellState[],
  extraPythonFiles?: PythonFile[] }) {
  const { getFunction } = useLocalToolbox();
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={() => downloadSourceCode(formatCells(codeCells), extraPythonFiles, getFunction)}
    >
      Download Python Source
    </Button>
  );
}
