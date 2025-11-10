import {
  PlaylistAddCheck,
  Report,
  ReportOff,
  SettingsOutlined,
  WidthNormal,
  WidthWide,
} from '@mui/icons-material';
import {
  Box,
  Link,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import { activityVariantPathname } from '../../src/urlUtils';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import NavBarButton from './NavBarButton';
import PlatformLanguageControl from './PlatformLanguageControl';

export default function SettingsButton() {
  const { t } = useLocalTranslation();
  const { metadata, setMetadata } = useLocalProfile();
  const { liveChecks, wideEditor } = metadata;

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
            <Box>
              <Typography sx={{ ...theme.typography.button }} gutterBottom>
                {t('editorLiveStaticChecks')}
              </Typography>
              <Stack spacing={2}>
                <ToggleButtonGroup
                  color='primary'
                  value={liveChecks}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      setMetadata((prevMetadata) => ({
                        ...prevMetadata,
                        liveChecks: newValue,
                      }));
                    }
                  }}
                  size='small'
                  fullWidth
                >
                  <ToggleButton value='none'>
                    <ReportOff sx={{ mr: 1 }} /> {t('noneChecks')}
                  </ToggleButton>
                  <ToggleButton value='syntax'>
                    <Report sx={{ mr: 1 }} /> {t('syntaxChecks')}
                  </ToggleButton>
                  <ToggleButton value='syntax-semantics'>
                    <PlaylistAddCheck sx={{ mr: 1 }} />{' '}
                    {t('syntaxSemanticsChecks')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Typography fontSize={'.95em'} textAlign={'center'} mt={1}>
                <Link
                  href={activityVariantPathname({
                    authorSlug: 'luce',
                    activitySlug: 'learn-errors',
                    language: 'en',
                    version: 'v1',
                  })}
                  target='_blank'
                >
                  {t('learnMoreChecks')}
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </PopoverContent>
    </Popover>
  );
}
