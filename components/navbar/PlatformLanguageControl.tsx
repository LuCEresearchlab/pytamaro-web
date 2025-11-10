import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import capitalizedLocalizedLanguageDisplayName from '../../src/internationalization';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';

import config from '../../next-i18next.config';
import theme from '../../src/theme';

export default function PlatformLanguageControl() {
  const { i18n, t, setPlatformLocale } = useLocalTranslation();

  const languages = config.i18n.locales as string[];

  const handleChange = (event: SelectChangeEvent) => {
    const newLang = event.target.value as string;
    setPlatformLocale(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <Stack>
      <Typography sx={{ ...theme.typography.button }} gutterBottom>
        {t('platformLanguage')}
      </Typography>
      <FormControl>
        <Select
          id='locale-select'
          value={i18n.language}
          onChange={handleChange}
          size='small'
        >
          {languages.map((language) => (
            <MenuItem key={language} value={language}>
              {capitalizedLocalizedLanguageDisplayName(language)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
