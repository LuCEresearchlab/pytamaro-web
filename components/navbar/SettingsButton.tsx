import {
  Category,
  Error,
  SettingsOutlined,
  WidthNormal,
  WidthWide,
} from '@mui/icons-material';
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
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import NavBarButton from './NavBarButton';
import PlatformLanguageControl from './PlatformLanguageControl';

export default function SettingsButton() {
  const { t } = useLocalTranslation();
  const { metadata, setMetadata } = useLocalProfile();
  const { semanticChecksEnabled, wideEditor } = metadata;

  return (
    <Popover placement='bottom'>
      <PopoverTrigger>
        <NavBarButton label='Settings' onClick={() => {}}>
          <SettingsOutlined />
        </NavBarButton>
      </PopoverTrigger>
      <PopoverContent>
        <Paper sx={{ padding: 2 }}>
          <Stack spacing={4}>
            <PlatformLanguageControl />
            <Box>
              <Typography gutterBottom>
                {t('selectEditorPreferences')}
              </Typography>
              <Stack spacing={2}>
                <ToggleButtonGroup
                  color='primary'
                  value={semanticChecksEnabled ? 'enabled' : 'disabled'}
                  exclusive
                  onChange={(event, newValue) => {
                    if (newValue !== null) {
                      setMetadata((prevMetadata) => ({
                        ...prevMetadata,
                        semanticChecksEnabled: newValue === 'enabled',
                      }));
                    }
                  }}
                  size='small'
                  fullWidth
                >
                  <ToggleButton value='disabled'>
                    <Error sx={{ mr: 1 }} /> {t('onlySyntaxErrors')}
                  </ToggleButton>
                  <ToggleButton value='enabled'>
                    <Category sx={{ mr: 1 }} /> {t('alsoSemanticErrors')}
                  </ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup
                  color='primary'
                  value={wideEditor ? 'wide' : 'normal'}
                  exclusive
                  onChange={(event, newValue) => {
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
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </PopoverContent>
    </Popover>
  );
}
