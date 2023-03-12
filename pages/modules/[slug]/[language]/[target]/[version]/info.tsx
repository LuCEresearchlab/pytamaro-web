import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import {
  getNotebookUses,
  variantInfo,
  NotebookUse,
  findVersions,
  listModules,
} from '../../../../../../src/Modules';
import NavigationBar from '../../../../../../components/NavigationBar';
import { notebookVersionUrl } from '../../../../../../src/urlUtils';

export default function InfoPage({ title, uses }: { title : string, uses : NotebookUse[] }) {
  const pageTitle = `${title} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar title={title} />
        <Container>
          {uses.map((use: NotebookUse) => (
            <Box m={2} key={use.url}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {use.institution}
                  </Typography>
                  <Typography variant="h5" component="div">
                    {use.course}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {use.assignment}
                  </Typography>
                  <Typography variant="body2">
                    Instructors:
                    <br />
                    {use.instructors.join(', ')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    href={use.url}
                    target="_blank"
                    size="small"
                  >
                    View
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps(
  context: { params: { slug: string, language: string, target: string, version: string } },
) {
  const {
    slug, language, target,
  } = context.params;
  return {
    props: {
      title: (await variantInfo(slug, language, target)).title,
      uses: await getNotebookUses(slug),
    },
  };
}

export async function getStaticPaths() {
  const modules = await listModules();
  const paths = modules.flatMap((module) => module.variants.flatMap(
    async (notebook) => (await findVersions(module.slug, notebook.language, notebook.target))
      .map((v) => `/modules/${notebookVersionUrl(module.slug, notebook.language, notebook.target, v)}/info`),
  ));
  return {
    paths: (await Promise.all(paths)).flat(),
    fallback: false,
  };
}
