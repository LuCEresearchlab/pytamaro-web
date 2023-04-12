import { Box, Button } from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import downloadSourceCode from '../src/CodeDownload';

export default function ExportLocalStorageButton({ getData }: { getData: () => string }) {
  return (
    <Box textAlign="center" sx={{ m: 4 }} onClick={() => downloadSourceCode(getData(), 'data.json')}>
      <Button variant="contained" color="success" startIcon={<DownloadIcon />}>
        Export
      </Button>
    </Box>
  );
}
