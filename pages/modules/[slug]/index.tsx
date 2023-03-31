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
  Activity,
  getNotebookUses,
  NotebookUse,
  listActivities,
  getActivity,
  NotebookVariant,
} from '../../../src/Activities';
import NavigationBar from '../../../components/NavigationBar';
import getLanguageDisplayName from '../../../src/internationalization';

export default function InfoPage({ uses, activity }: {
  uses : NotebookUse[], activity : Activity
}) {
  const title = activity.slug;
  const pageTitle = `${title} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography variant="h2" marginY={3}>{title}</Typography>
          <div style={{
            width: '100%',
            height: '300px',
            backgroundColor: activity.previewImage.backgroundColor,
            position: 'relative',
          }}
          >
            <Image
              fill
              src={`/modules/${activity.slug}/${activity.previewImage.filename}`}
              alt={activity.variants[0].title}
              style={{
                padding: '1rem',
                objectFit: 'contain',
              }}
            />
          </div>
          <Typography variant="h3" marginY={3}>Languages</Typography>
          <Typography variant="body1" marginY={3}>
            This activity is
            { activity.visibility === 'draft' ? ' under development ' : '  available ' }
            in the following languages:
          </Typography>
          <ul>
            {
              activity.variants.map((variant: NotebookVariant) => (
                <li key={variant.language}>
                  { activity.visibility !== 'draft' && (
                    <Link href={{
                      pathname: '/modules/[slug]/[language]/[version]',
                      query: {
                        slug: activity.slug,
                        language: variant.language,
                        version: variant.latestVersion,
                      },
                    }}
                    >
                      {variant.title}
                    </Link>
                  )}
                  { activity.visibility === 'draft' && (
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
          <Typography variant="h3" marginY={3}>Activity Usage</Typography>
          {uses.length === 0 && (
            <Typography variant="body1" marginY={3}>
              We do not currently have information about courses using this activity.
            </Typography>
          )}
          {uses.length > 0 && (
            <>
              <Typography variant="body1" marginY={3}>
                This activity has been used in the following
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
      activity: await getActivity(slug),
    },
  };
}

export async function getStaticPaths() {
  const activities = await listActivities();
  const paths = activities.map((a) => `/modules/${a.slug}`);
  return {
    paths: (await Promise.all(paths)).flat(),
    fallback: false,
  };
}
