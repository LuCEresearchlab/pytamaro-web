import { Button } from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import downloadSourceCode from '../src/codeDownload';

export default function DownloadCodeButton({ getSource }: { getSource: () => string }) {
  return (
    <Button
      variant="contained"
      color="success"
      startIcon={<DownloadIcon />}
      onClick={() => downloadSourceCode(getSource())}
    >
      Export as Python file
    </Button>
  );
}
