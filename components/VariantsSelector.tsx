import { Stack } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LanguageWithLatestVersion } from '../src/Modules';
import { notebookVersionUrl } from '../src/urlUtils';

export default function VariantSelector({
  slug, language, version, versions, languages,
}:
{ slug: string, language: string, version: string,
  versions: string[], languages: LanguageWithLatestVersion[] }) {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState(version);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  useEffect(() => {
    router.push(`/modules/${notebookVersionUrl(slug, selectedLanguage, selectedVersion)}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVersion, selectedLanguage]);
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
    >
      {(version !== selectedVersion || language !== selectedLanguage) && <CircularProgress color="neutral" size="2rem" />}
      <Select
        sx={{ color: 'white' }}
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
      </Select>
      <Select
        sx={{ color: 'white' }}
        size="small"
        value={selectedVersion}
        label="Version"
        onChange={(selected) => {
          const newVersion = selected.target.value as string;
          setSelectedVersion(newVersion);
        }}
        disabled={language !== selectedLanguage}
      >
        {versions.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
      </Select>
    </Stack>
  );
}
