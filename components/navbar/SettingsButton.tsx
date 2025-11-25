import { SettingsOutlined, WidthNormal, WidthWide } from '@mui/icons-material';
import {
  Box,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import NavBarButton from './NavBarButton';
import PlatformLanguageControl from './PlatformLanguageControl';

export default function SettingsButton() {
  const { t } = useLocalTranslation();
  const { metadata, setMetadata } = useLocalProfile();
  const { wideEditor } = metadata;

  return (
    <Popover placement='bottom'>
      <PopoverTrigger>
        <NavBarButton label='Settings' onClick={() => {}}>
          <SettingsOutlined />
        </NavBarButton>
      </PopoverTrigger>
      <PopoverContent>
        <Paper sx={{ padding: 2, minWidth: 300 }}>
          <Stack spacing={4}>
            <PlatformLanguageControl />
            <Box>
              <Typography sx={{ ...theme.typography.button }} gutterBottom>
                {t('editorSize')}
              </Typography>
              <ToggleButtonGroup
                color='primary'
                value={wideEditor ? 'wide' : 'normal'}
                exclusive
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    setMetadata((prevMetadata) => ({
                      ...prevMetadata,
                      wideEditor: newValue === 'wide',
                    }));
                  }
                }}
                size='small'
                fullWidth
              >
                <ToggleButton value='normal'>
                  <WidthNormal sx={{ mr: 1 }} /> {t('normal')}
                </ToggleButton>
                <ToggleButton value='wide'>
                  <WidthWide sx={{ mr: 1 }} /> {t('wide')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Paper>
      </PopoverContent>
    </Popover>
  );
}
