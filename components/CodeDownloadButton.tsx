import DownloadIcon from '@mui/icons-material/Download';
import { Button } from '@mui/material';
import downloadSourceCode from '../src/codeDownload';
import { CodeCellState } from '../src/localStorage/schema';
import { asSingleSource } from '../src/localStorage/useActivity';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';

export default function DownloadCodeButton({ codeCells }: { codeCells: CodeCellState[] }) {
  const { getFunction } = useLocalToolbox();
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={() => downloadSourceCode(asSingleSource(codeCells), getFunction)}
    >
      Export as Python file
    </Button>
  );
}
