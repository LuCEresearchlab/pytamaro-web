import { InstallDesktop } from '@mui/icons-material';
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { PREINSTALLED_IDE_LIBRARIES } from '../../src/ide/libraries';
import useIdeLibraries from '../../src/ide/useIdeLibraries';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import NavBarButton from './NavBarButton';

export default function LibrariesButton() {
  const { t } = useLocalTranslation(['ide']);
  const {
    options,
    toggleLibrary,
    installing,
    toggleDisabled,
    installationFailed,
  } = useIdeLibraries();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    if (!installing) {
      setOpen(false);
    }
  };

  return (
    <>
      <NavBarButton
        label={t('ideLibraries.button')}
        testId='libraries-button'
        onClick={() => setOpen(true)}
      >
        <InstallDesktop />
      </NavBarButton>
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{t('ideLibraries.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            {t('ideLibraries.description')}
          </DialogContentText>
          <FormGroup>
            {PREINSTALLED_IDE_LIBRARIES.map((library) => (
              <FormControlLabel
                key={library.id}
                control={<Checkbox checked disabled />}
                label={library.name}
                value={library.name}
              />
            ))}
            <Divider sx={{ marginY: 1 }} />
            {options.map(({ library, checked, pending }) => (
              <FormControlLabel
                key={library.id}
                control={
                  <Checkbox
                    checked={checked}
                    disabled={toggleDisabled}
                    onChange={() => void toggleLibrary(library.id)}
                  />
                }
                label={
                  <Stack
                    direction='row'
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <span>{library.name}</span>
                    {pending && <CircularProgress size={16} />}
                  </Stack>
                }
              />
            ))}
          </FormGroup>
          {installationFailed && (
            <Alert severity='error' sx={{ marginTop: 2 }}>
              {t('ideLibraries.installationFailed')}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={installing}>
            {t('ideLibraries.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
