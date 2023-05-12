import { Box, Button } from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import downloadSourceCode from '../src/codeDownload';

export default function DownloadCodeButton({ getSource }: { getSource: () => string }) {
  return (
    <Box textAlign="center" sx={{ m: 4 }} onClick={() => downloadSourceCode(getSource())}>
      <Button variant="contained" color="success" startIcon={<DownloadIcon />}>
        Download code as Python source
      </Button>
    </Box>
  );
}
