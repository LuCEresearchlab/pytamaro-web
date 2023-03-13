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
import Image from 'next/image';
import Link from 'next/link';
import {
  Module,
  getNotebookUses,
  NotebookUse,
  listModules,
  getModule,
  NotebookVariant,
} from '../../../src/Modules';
import NavigationBar from '../../../components/NavigationBar';
import getLanguageDisplayName from '../../../src/internationalization';

export default function InfoPage({ uses, module }: {
  uses : NotebookUse[], module : Module
}) {
  const title = module.slug;
  const pageTitle = `${title} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar title={title} />
        <Container>
          <Typography variant="h2" marginY={3}>{title}</Typography>
          <div style={{
            width: '100%',
            height: '300px',
            backgroundColor: module.previewImage.backgroundColor,
            position: 'relative',
          }}
          >
            <Image
              fill
              src={`/modules/${module.slug}/${module.previewImage.filename}`}
              alt={module.variants[0].title}
              style={{
                padding: '1rem',
                objectFit: 'contain',
              }}
            />
          </div>
          <Typography variant="h3" marginY={3}>Languages</Typography>
          <Typography variant="body1" marginY={3}>
            This module is
            { module.visibility === 'draft' ? ' under development ' : '  available ' }
            in the following languages:
          </Typography>
          <ul>
            {
              module.variants.map((variant: NotebookVariant) => (
                <li key={variant.language}>
                  { module.visibility !== 'draft' && (
                    <Link href={{
                      pathname: '/modules/[slug]/[language]/[version]',
                      query: {
                        slug: module.slug,
                        language: variant.language,
                        version: variant.latestVersion,
                      },
                    }}
                    >
                      {variant.title}
                    </Link>
                  )}
                  { module.visibility === 'draft' && (
                    variant.title
                  )}
                  {' '}
                  (
                  {getLanguageDisplayName(variant.language)}
                  ,
                  {' '}
                  latest version:
                  {' '}
                  {variant.latestVersion}
                  )
                </li>
              ))
            }
          </ul>
          <Typography variant="h3" marginY={3}>Module Usage</Typography>
          {uses.length === 0 && (
            <Typography variant="body1" marginY={3}>
              We do not currently have information about courses using this module.
            </Typography>
          )}
          {uses.length > 0 && (
            <>
              <Typography variant="body1" marginY={3}>
                This module has been used in the following
                {' '}
                {uses.length}
                {' '}
                courses:
              </Typography>
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
                        View Course
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </>
          )}
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps(
  context: { params: { slug: string } },
) {
  const {
    slug,
  } = context.params;
  return {
    props: {
      slug,
      uses: await getNotebookUses(slug),
      module: await getModule(slug),
    },
  };
}

export async function getStaticPaths() {
  const modules = await listModules();
  const paths = modules.map((m) => `/modules/${m.slug}`);
  return {
    paths: (await Promise.all(paths)).flat(),
    fallback: false,
  };
}
