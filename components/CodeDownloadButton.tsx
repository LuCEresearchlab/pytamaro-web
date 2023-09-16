import DownloadIcon from '@mui/icons-material/Download';
import { Button } from '@mui/material';
import downloadSourceCode from '../src/codeDownload';
import { CodeCellState } from '../src/localStorage/schema';
import { sourceFromCell } from '../src/localStorage/useActivity';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import { joinLines } from '../src/sourceUtils';

function formatCells(codeCells: CodeCellState[]) {
  const sources = codeCells.map(sourceFromCell);
  const formattedSources = sources.flatMap((source, idx) => [`# === Code Cell ${idx + 1} ===`, source, '']);
  return joinLines(formattedSources);
}

export default function DownloadCodeButton({ codeCells }: { codeCells: CodeCellState[] }) {
  const { getFunction } = useLocalToolbox();
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={() => downloadSourceCode(formatCells(codeCells), getFunction)}
    >
      Download Python Source
    </Button>
  );
}
