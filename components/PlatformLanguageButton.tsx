import { Translate } from '@mui/icons-material';
import {
  Card,
  ClickAwayListener,
  FormControl, IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import capitalizedLocalizedLanguageDisplayName from '../src/internationalization';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import Popup from './Popup';

const config = require('../next-i18next.config');

export default function PlatformLanguageButton() {
  const {
    i18n, t, setPlatformLocale,
  } = useLocalTranslation();

  const languages = config.i18n.locales as string[];

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: SelectChangeEvent) => {
    const newLang = event.target.value as string;
    setPlatformLocale(newLang);
    i18n.changeLanguage(newLang);
    handleClose();
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'platform-language-popover' : undefined;

  return (
    <ClickAwayListener onClickAway={handleClose} mouseEvent="onMouseUp">
      <div>
        <IconButton
          sx={{ ml: 1 }}
          color="neutral"
          onClick={handleButtonClick}
          aria-describedby={id}
        >
          <Translate />
        </IconButton>
        <Popup
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="bottom"
        >
          <Card>
            <Stack sx={{ p: 2 }} spacing={2}>
              <Typography>{t('selectPlatformLanguage')}</Typography>
              <FormControl>
                <Select
                  id="locale-select"
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
        </Popup>
      </div>
    </ClickAwayListener>
  );
}
