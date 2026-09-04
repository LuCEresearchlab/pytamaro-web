import { PlayArrow, PlayDisabled, SvgIconComponent } from '@mui/icons-material';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from '@mui/material';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import theme from '../src/theme';

export const SwitchIcon = ({
  Icon,
  backgroundColor,
}: {
  Icon: SvgIconComponent;
  backgroundColor: string;
}) => (
  <Box
    sx={{
      width: '1.25rem',
      height: '1.25rem',
      borderRadius: '50%',
      color: 'white',
      backgroundColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Icon sx={{ fontSize: '0.875rem' }} />
  </Box>
);

export default function AutomaticEvaluationSwitch({
  automaticEvaluation,
  setAutomaticEvaluation,
}: {
  automaticEvaluation: boolean;
  setAutomaticEvaluation: (value: boolean) => void;
}) {
  const { t } = useLocalTranslation();
  return (
    <FormControl component='fieldset'>
      <FormGroup aria-label='automatic evaluation' row>
        <FormControlLabel
          sx={{ marginRight: theme.spacing(0.5) }}
          control={
            <Switch
              checked={automaticEvaluation}
              onChange={() => setAutomaticEvaluation(!automaticEvaluation)}
              color='primary'
              icon={
                <SwitchIcon Icon={PlayDisabled} backgroundColor='grey.700' />
              }
              checkedIcon={
                <SwitchIcon Icon={PlayArrow} backgroundColor='primary.main' />
              }
            />
          }
          label={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Typography
                component='span'
                variant='body2'
                sx={{
                  letterSpacing: '0.01em',
                }}
              >
                {t('automaticEvaluation')}
              </Typography>
            </Box>
          }
          labelPlacement='start'
        />
      </FormGroup>
    </FormControl>
  );
}
