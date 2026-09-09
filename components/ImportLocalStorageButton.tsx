import { Box, Button } from '@mui/material';

import UploadIcon from '@mui/icons-material/Upload';
import { useRef, useState } from 'react';
import CustomSnackbar from './CustomSnackbar';

export default function ImportLocalStorageButton({
  onClick,
}: {
  onClick: (jsonString: string) => void;
}) {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [importSuccessfulVisible, setImportSuccessfulVisible] = useState(false);
  const [importErrorVisible, setImportErrorVisible] = useState(false);

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const filesUploaded = event.target.files;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (filesUploaded && filesUploaded[0]) {
      const reader = new FileReader();
      reader.readAsText(filesUploaded[0], 'UTF-8');
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          try {
            onClick(e.target.result);
          } catch {
            setImportErrorVisible(true);
            return;
          }
          setImportSuccessfulVisible(true);
        } else {
          setImportErrorVisible(true);
        }
      };
      reader.onerror = () => {
        setImportErrorVisible(true);
      };
    }
    // Clear file input
    target.value = '';
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        textAlign: 'center',
        m: 4,
      }}
    >
      <Button variant='contained' color='primary' startIcon={<UploadIcon />}>
        Import
      </Button>
      <input
        type='file'
        ref={hiddenFileInput}
        onChangeCapture={handleChange}
        style={{ display: 'none' }}
      />
      <CustomSnackbar
        visible={importSuccessfulVisible}
        setVisible={setImportSuccessfulVisible}
        severity='success'
        message='Data successfully restored!'
      />
      <CustomSnackbar
        visible={importErrorVisible}
        setVisible={setImportErrorVisible}
        severity='error'
        message='Error while importing your data'
      />
    </Box>
  );
}
