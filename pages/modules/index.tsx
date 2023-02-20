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
  const visibleModules = modules.filter((module) => module.visibility !== 'hidden');

  // Minimal sorting
  visibleModules.sort((m1, m2) => {
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
        {visibleModules.map((module) => {
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
