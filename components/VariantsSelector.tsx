import { Stack } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from '@emotion/styled';
import { activityVariantPathname } from '../src/urlUtils';
import { LanguageWithLatestVersion } from '../src/schemas/activitySchema';

const VariantSelect = styled(Select)({
  color: 'white',
  '& fieldset': {
    border: 'none',
  },
});

export default function VariantSelector({
  authorSlug, activitySlug, language, version, versions, languages,
}:
{ authorSlug: string, activitySlug: string, language: string, version: string,
  versions: string[], languages: LanguageWithLatestVersion[] }) {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState(version);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const routeToNewVariant = (newLanguage: string, newVersion: string) => {
    router.push(
      activityVariantPathname(authorSlug, activitySlug, newLanguage, newVersion),
    );
  };
  return (
    <Stack
      direction="row"
      alignItems="center"
    >
      {(version !== selectedVersion || language !== selectedLanguage) && <CircularProgress color="neutral" size="2rem" />}
      <VariantSelect
        value={selectedLanguage}
        label="Language"
        size="small"
        onChange={(selected) => {
          const newLanguage = selected.target.value as string;
          setSelectedLanguage(newLanguage);
          const versionForNewLanguage = languages.find(
            (l) => l.language === newLanguage,
          )?.latestVersion as string;
          setSelectedVersion(versionForNewLanguage);
          routeToNewVariant(newLanguage, versionForNewLanguage);
        }}
      >
        {languages.map((l) => (
          <MenuItem
            key={l.language}
            value={l.language}
          >
            {l.language.toUpperCase()}
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
        disabled={language !== selectedLanguage}
      >
        {versions.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
      </VariantSelect>
    </Stack>
  );
}
