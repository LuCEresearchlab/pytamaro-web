import { RestartAlt } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

export default function ResetButton({ visible, onReset }:
{ visible: boolean, onReset: () => void }) {
  return (
    <Grid container justifyContent="flex-end">
      <Button
        variant="contained"
        color="error"
        endIcon={<RestartAlt />}
        sx={{
          m: 2, mb: -6, visibility: visible ? 'visible' : 'hidden', position: 'fixed',
        }}
        onClick={onReset}
      >
        Reset
      </Button>
    </Grid>
  );
}
