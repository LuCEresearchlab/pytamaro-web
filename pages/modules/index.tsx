import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
} from '@mui/material';
import { HourglassBottom } from '@mui/icons-material';
import {
  listModules, Module, NotebookVariant,
} from '../../src/Modules';
import NavigationBar from '../../components/NavigationBar';
import { notebookVersionUrl } from '../../src/urlUtils';

const DEFAULT_TARGET = 'student';

export default function ModulesPage({ modules }: { modules: Module[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [filteredModules, setFilteredModules] = useState(modules);

  // get all languages in set of modules
  const languages = [''];
  modules.forEach((module) => {
    module.variants.forEach((avariant) => {
      const l = avariant.language.toLowerCase();
      if (!languages.includes(l)) {
        languages.push(l);
      }
    });
  });

  useEffect(() => {
    setFilteredModules(
      modules.filter(
        (module) => module.visibility !== 'hidden'
        && module.variants.some(
          (avariant) => avariant.language.toLowerCase().includes(languageFilter.toLowerCase()),
        )
        && (module.slug.toLowerCase().includes(search.toLowerCase())
        || module.variants.some(
          (avariant) => avariant.description.toLowerCase().includes(search.toLowerCase())
          || avariant.title.toLowerCase().includes(search.toLowerCase()),
        )),
      ),
    );
  }, [search, languageFilter, modules]);

  // Minimal sorting
  modules.sort((m1, m2) => {
    if (m1.visibility !== m2.visibility) {
      // different visibility, draft should come after
      return m1.visibility === 'draft' ? 1 : -1;
    }
    // same visibility, more variants first
    return m2.variants.length - m1.variants.length;
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
        <Grid xs={4}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={languageFilter}
              label="Language"
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              {languages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language ? new Intl.DisplayNames([language], { type: 'language' }).of(language) : (<em>All</em>)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {filteredModules.map((module) => {
          const variant = module.variants.find(
            (v) => v.target === DEFAULT_TARGET,
          ) as NotebookVariant;
          function variantUrl(language: string) {
            return `${router.asPath}/${notebookVersionUrl(module.slug, language, variant.target, variant.latestVersion)}`;
          }
          const isDraft = module.visibility === 'draft';
          return (
            <Grid md={4} lg={3} key={module.slug}>
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
                      sx={{ objectFit: 'contain', backgroundColor: module.previewImage.backgroundColor }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {variant.title}
                        {isDraft
                          && (
                          <Chip
                            icon={<HourglassBottom />}
                            label="Coming soon"
                            color="error"
                            sx={{ marginLeft: 2, textTransform: 'uppercase', fontWeight: 'bold' }}
                          />
                          )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {variant.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
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
                  </CardActions>
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
