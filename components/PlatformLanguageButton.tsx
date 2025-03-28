import { Translate } from '@mui/icons-material';
import {
  Card,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import capitalizedLocalizedLanguageDisplayName from '../src/internationalization';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import theme from '../src/theme';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

import config from '../next-i18next.config';

export default function PlatformLanguageButton() {
  const { i18n, t, setPlatformLocale } = useLocalTranslation();

  const languages = config.i18n.locales as string[];

  const handleChange = (event: SelectChangeEvent) => {
    const newLang = event.target.value as string;
    setPlatformLocale(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <Popover placement='bottom'>
      <PopoverTrigger>
        <IconButton
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <Translate />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent>
        <Card elevation={0}>
          <Stack sx={{ p: 2 }} spacing={2}>
            <Typography>{t('selectPlatformLanguage')}</Typography>
            <FormControl>
              <Select
                id='locale-select'
                value={i18n.language}
                onChange={handleChange}
              >
                {languages.map((language) => (
                  <MenuItem key={language} value={language}>
                    {capitalizedLocalizedLanguageDisplayName(language)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
