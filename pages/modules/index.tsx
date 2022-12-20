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
} from '@mui/material';
import { listModules, Module, NotebookVariant } from '../../src/Modules';
import NavigationBar from '../../components/NavigationBar';

const DEFAULT_TARGET = 'student';
const DEFAULT_VERSION = 'latest';

export default function ModulesPage({ modules }: { modules: Module[] }) {
  const router = useRouter();
  return (
    <Stack spacing={2}>
      <NavigationBar title="All Learning Modules" />
      <Grid container spacing={2}>
        {modules.map((module) => {
          const variant = module.variants.find(
            (v) => v.target === DEFAULT_TARGET,
          ) as NotebookVariant;
          function variantUrl(language: string) {
            return `${router.asPath}/${module.slug}/${language}/${variant.target}/${DEFAULT_VERSION}`;
          }
          return (
            <Grid xs={4} key={module.slug}>
              <Paper elevation={8}>
                <Card
                  sx={{ width: '100%' }}
                >
                  <CardActionArea
                    onClick={() => router.push(variantUrl(variant.language))}
                  >
                    <CardMedia
                      component="img"
                      height="300"
                      image={`/modules/${module.slug}/${module.previewImage}`}
                      alt={variant.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {variant.title}
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
                        key={avariant.language}
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
