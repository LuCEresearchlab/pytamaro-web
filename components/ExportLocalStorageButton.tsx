import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button } from '@mui/material';
import { saveAs } from 'file-saver';

export default function ExportLocalStorageButton({ getData }: { getData: () => string }) {
  const handleClick = () => {
    const contentBlob = new Blob([getData()], { type: 'text/plain' });
    saveAs(contentBlob, 'pytamaro-web-data.json');
  };
  return (
    <Box textAlign="center" sx={{ m: 4 }} onClick={handleClick}>
      <Button variant="contained" color="primary" startIcon={<DownloadIcon />}>
        Export
      </Button>
    </Box>
  );
}
