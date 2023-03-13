import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CardActions,
  Paper,
  Typography,
  Button,
  Chip,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  ToggleButton,
  IconButton,
  Box,
} from '@mui/material';
import { HourglassBottom, Verified } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import {
  listModules, Module, NotebookVariant,
} from '../../src/Modules';
import NavigationBar from '../../components/NavigationBar';
import { notebookVersionUrl } from '../../src/urlUtils';
import getLanguageDisplayName from '../../src/internationalization';

const VISIBILITY_PRIORITY = {
  featured: 0,
  visible: 1,
  draft: 2,
  hidden: 4,
};

export default function ModulesPage({ modules }: { modules: Module[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [filteredModules, setFilteredModules] = useState(modules);
  const [compactView, setCompactView] = useState(false);

  // get all languages in set of modules
  const languages = new Set(
    modules.flatMap((module) => module.variants.map((avariant) => avariant.language)),
  );

  useEffect(() => {
    setFilteredModules(
      modules.filter(
        (module) => module.visibility !== 'hidden'
        // language filter
        && module.variants.some(
          (avariant) => !languageFilter
          || avariant.language.toLowerCase() === languageFilter.toLowerCase(),
        )
        // search by slug and by title and description of language-filtered variant
        && (module.slug.toLowerCase().includes(search.toLowerCase())
        || module.variants.some(
          (avariant) => (!languageFilter
          || avariant.language.toLowerCase() === languageFilter.toLowerCase())
          && (avariant.description.toLowerCase().includes(search.toLowerCase())
          || avariant.title.toLowerCase().includes(search.toLowerCase())),
        )),
      ),
    );
  }, [search, languageFilter, modules]);

  // Minimal sorting
  modules.sort((m1, m2) => {
    if (m1.visibility !== m2.visibility) {
      // different visibility, featured before visible before draft before hidden
      return VISIBILITY_PRIORITY[m1.visibility] - VISIBILITY_PRIORITY[m2.visibility];
    }
    if (m1.variants.length !== m2.variants.length) {
      // same visibility, more variants first
      return Math.sign(m2.variants.length - m1.variants.length);
    }
    // same visibility, same number of variants, sort by slug
    return m1.slug < m2.slug ? -1 : 1;
  });
  return (
    <Stack spacing={2}>
      <NavigationBar title="All Learning Modules" />
      <Grid container spacing={2}>
        <Grid xs={8}>
          <TextField
            fullWidth
            label="Search by title and description"
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid xs={3}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={languageFilter}
              label="Language"
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <MenuItem key="" value=""><em>All</em></MenuItem>
              {Array.from(languages).map((language) => (
                <MenuItem key={language} value={language}>
                  {getLanguageDisplayName(language)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={1} display="flex" justifyContent="center" alignItems="center">
          <ToggleButton
            color="primary"
            value="compact"
            selected={compactView}
            onChange={() => {
              setCompactView(!compactView);
            }}
          >
            <ViewCompactIcon />
          </ToggleButton>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {filteredModules.map((module) => {
          // get language-filtered variant (if cannot, get first)
          const variant = module.variants.find(
            (v) => !languageFilter || v.language.toLowerCase() === languageFilter.toLowerCase(),
          ) || module.variants[0] as NotebookVariant;
          function variantUrl(language: string) {
            return `${router.asPath}/${notebookVersionUrl(module.slug, language, variant.latestVersion)}`;
          }
          const isDraft = module.visibility === 'draft';
          return (
            <Grid md={compactView ? 3 : 4} lg={compactView ? 2 : 3} key={module.slug}>
              <Paper elevation={8}>
                <Card>
                  <CardActionArea
                    onClick={() => router.push(variantUrl(variant.language))}
                    disabled={isDraft}
                  >
                    <CardMedia
                      component="img"
                      height="300"
                      image={`/modules/${module.slug}/${module.previewImage.filename}`}
                      alt={variant.title}
                      sx={{ padding: 1, objectFit: 'contain', backgroundColor: module.previewImage.backgroundColor }}
                    />
                    { !compactView && (
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {variant.title}
                        {module.visibility === 'featured'
                          && (
                          <Verified
                            sx={{ marginLeft: 1, color: 'primary.main' }}
                          />
                          )}
                        {isDraft
                          && (
                          <Chip
                            icon={<HourglassBottom />}
                            label="Coming soon"
                            sx={{ marginLeft: 2, textTransform: 'uppercase', fontWeight: 'bold' }}
                          />
                          )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {variant.description}
                      </Typography>
                    </CardContent>
                    )}
                  </CardActionArea>
                  { !compactView && (
                  <CardActions>
                    {module.variants.map((avariant) => (
                      <Button
                        onClick={() => router.push(variantUrl(avariant.language))}
                        size="small"
                        variant="outlined"
                        key={avariant.language}
                        disabled={isDraft}
                      >
                        {avariant.language}
                      </Button>
                    ))}
                    <Box sx={{ marginLeft: 'auto' }}>
                      <IconButton
                        size="small"
                        href={`/modules/${module.slug}`}
                        component={Link}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                  )}
                </Card>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}

export async function getStaticProps() {
  return {
    props: { modules: await listModules() },
  };
}
