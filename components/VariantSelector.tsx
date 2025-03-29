import List from '@mui/icons-material/List';
import { Card, IconButton, Stack, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { uniq } from 'lodash';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { Activity, ActivityVariant } from '../src/schemas/activitySchema';
import theme from '../src/theme';
import { activityVariantPathnameFromParts } from '../src/urlUtils';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

export default function VariantSelector({
  activity,
  activityVariant,
}: {
  activity: Activity;
  activityVariant: ActivityVariant;
}) {
  const router = useRouter();
  const { t } = useLocalTranslation();
  const [selectedVersion, setSelectedVersion] = useState(
    activityVariant.version,
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    activityVariant.language,
  );
  const routeToNewVariant = (newLanguage: string, newVersion: string) => {
    router.push(
      activityVariantPathnameFromParts(
        activityVariant.authorSlug,
        activityVariant.activitySlug,
        newLanguage,
        newVersion,
      ),
    );
  };

  // Do not show the button if there is only one variant (one language and one version)
  // or the activity has been configured not to show the variant selector
  if (
    activity.variants.length === 1 ||
    activity.platformConfig.showVariantSelector === false
  ) {
    return null;
  }

  return (
    <Popover placement='bottom'>
      <PopoverTrigger>
        <IconButton
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <List />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent>
        <Card elevation={0}>
          <Stack sx={{ p: 2 }} spacing={2}>
            <Typography>{t('selectActivityVariant')}</Typography>
            <Stack direction='row' justifyContent='space-around' spacing={2}>
              {(activityVariant.version !== selectedVersion ||
                activityVariant.language !== selectedLanguage) && (
                <CircularProgress color='neutral' size='2rem' />
              )}
              <Select
                value={selectedLanguage}
                label='Language'
                size='small'
                onChange={(selected) => {
                  const newLanguage = selected.target.value as string;
                  setSelectedLanguage(newLanguage);
                  const versionForNewLanguage = activity.languagesInfo.find(
                    (i) => i.language === newLanguage,
                  )?.latestVersion;
                  if (versionForNewLanguage === undefined) {
                    throw new Error(
                      `Latest version for activity ${activity.slug} in language ${newLanguage} not found`,
                    );
                  }
                  setSelectedVersion(versionForNewLanguage);
                  routeToNewVariant(newLanguage, versionForNewLanguage);
                }}
              >
                {uniq(activity.variants.map((v) => v.language)).map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              <Select
                size='small'
                value={selectedVersion}
                label='Version'
                onChange={(selected) => {
                  const newVersion = selected.target.value as string;
                  setSelectedVersion(newVersion);
                  routeToNewVariant(selectedLanguage, newVersion);
                }}
                disabled={activityVariant.language !== selectedLanguage}
              >
                {activity.variants
                  .filter((v) => v.language === selectedLanguage)
                  .map((v) => (
                    <MenuItem key={v.version} value={v.version}>
                      {v.version}
                    </MenuItem>
                  ))}
              </Select>
            </Stack>
          </Stack>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
