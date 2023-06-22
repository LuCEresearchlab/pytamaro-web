import styled from '@emotion/styled';
import { Stack } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { uniq } from 'lodash';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Activity, ActivityVariant } from '../src/schemas/activitySchema';
import { activityVariantPathnameFromParts } from '../src/urlUtils';

const VariantSelect = styled(Select)({
  color: 'white',
  '& fieldset': {
    border: 'none',
  },
});

export default function VariantSelector({ activity, activityVariant }:
{ activity: Activity, activityVariant: ActivityVariant }) {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState(activityVariant.version);
  const [selectedLanguage, setSelectedLanguage] = useState(activityVariant.language);
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
  return (
    <Stack
      direction="row"
      alignItems="center"
    >
      {(activityVariant.version !== selectedVersion || activityVariant.language !== selectedLanguage) && <CircularProgress color="neutral" size="2rem" />}
      <VariantSelect
        value={selectedLanguage}
        label="Language"
        size="small"
        onChange={(selected) => {
          const newLanguage = selected.target.value as string;
          setSelectedLanguage(newLanguage);
          const versionForNewLanguage = activity.languagesInfo.find(
            (i) => i.language === newLanguage,
          )?.latestVersion;
          if (versionForNewLanguage === undefined) {
            throw new Error(`Latest version for activity ${activity.slug} in language ${newLanguage} not found`);
          }
          setSelectedVersion(versionForNewLanguage);
          routeToNewVariant(newLanguage, versionForNewLanguage);
        }}
      >
        {uniq(activity.variants.map((v) => v.language)).map((lang) => (
          <MenuItem
            key={lang}
            value={lang}
          >
            {lang.toUpperCase()}
          </MenuItem>
        ))}
      </VariantSelect>
      <VariantSelect
        size="small"
        value={selectedVersion}
        label="Version"
        onChange={(selected) => {
          const newVersion = selected.target.value as string;
          setSelectedVersion(newVersion);
          routeToNewVariant(selectedLanguage, newVersion);
        }}
        disabled={activityVariant.language !== selectedLanguage}
      >
        {activity.variants.filter((v) => v.language === selectedLanguage)
          .map((v) => <MenuItem key={v.version} value={v.version}>{v.version}</MenuItem>)}
      </VariantSelect>
    </Stack>
  );
}
