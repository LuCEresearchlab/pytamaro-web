import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button } from '@mui/material';
import { saveAs } from 'file-saver';

export default function ExportLocalStorageButton({
  getData,
}: {
  getData: () => string;
}) {
  const handleClick = () => {
    const contentBlob = new Blob([getData()], { type: 'text/plain' });
    saveAs(contentBlob, 'pytamaro-web-data.json');
  };
  return (
    <Box
      onClick={handleClick}
      sx={{
        textAlign: 'center',
        m: 4,
      }}
    >
      <Button variant='contained' color='primary' startIcon={<DownloadIcon />}>
        Export
      </Button>
    </Box>
  );
}
