import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LanguageWithLatestVersion } from '../src/Modules';
import { notebookVersionUrl } from '../src/urlUtils';

export default function VariantSelector({
  slug, language, target, version, versions, languages,
}:
{ slug: string, language: string, target: string, version: string,
  versions: string[], languages: LanguageWithLatestVersion[] }) {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState(version);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  useEffect(() => {
    router.push(`/modules/${notebookVersionUrl(slug, selectedLanguage, target, selectedVersion)}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVersion, selectedLanguage]);
  return (
    <Box>
      <Select
        sx={{
          ml: 2, mt: 2, position: 'fixed', minWidth: 70,
        }}
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
      {language === selectedLanguage && (
      <Select
        sx={{
          ml: 2, mt: 8, position: 'fixed', minWidth: 70,
        }}
        size="small"
        value={selectedVersion}
        label="Version"
        onChange={(selected) => {
          const newVersion = selected.target.value as string;
          setSelectedVersion(newVersion);
        }}
      >
        {versions.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
      </Select>
      )}
      {(version !== selectedVersion || language !== selectedLanguage) && <CircularProgress sx={{ ml: 12, mt: 3, position: 'fixed' }} />}
    </Box>
  );
}
