import { Box, Button } from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import downloadSourceCode from '../src/CodeDownload';

export default function ExportLocalStorageButton({ getData }: { getData: () => string }) {
  return (
    <Box textAlign="center" sx={{ m: 4 }} onClick={() => downloadSourceCode(getData(), 'pytamaro-web-data.json')}>
      <Button variant="contained" color="primary" startIcon={<DownloadIcon />}>
        Export
      </Button>
    </Box>
  );
}
