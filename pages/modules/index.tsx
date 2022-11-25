import { useRouter } from 'next/router';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Card, CardHeader, CardMedia, Paper,
} from '@mui/material';
import { listModules, Module, NotebookVariant } from '../../src/Modules';
import NavigationBar from '../../components/NavigationBar';

const DEFAULT_TARGET = 'student';
const DEFAULT_VERSION = 'latest';
const DEFAULT_LANGUAGE = 'en';

export default function ModulesPage({ modules }: { modules: Module[] }) {
  const router = useRouter();
  return (
    <Stack>
      <NavigationBar title="All Learning Modules" />
      <Grid container spacing={2}>
        {modules.map((module) => {
          const variant = module.variants.find(
            (v) => v.target === DEFAULT_TARGET
              && v.language === DEFAULT_LANGUAGE,
          ) as NotebookVariant;
          const variantUrl = `${router.asPath}/${module.slug}/${variant.language}/${variant.target}/${DEFAULT_VERSION}`;
          return (
            <Grid xs={4} key={module.slug}>
              <Paper elevation={8}>
                <Card
                  onClick={() => router.push(variantUrl)}
                  sx={{ width: '100%' }}
                >
                  <CardHeader title={variant.title} />
                  <CardMedia
                    component="img"
                    height="500"
                    image={`/modules/${module.slug}/${module.previewImage}`}
                    alt={variant.title}
                  />
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
