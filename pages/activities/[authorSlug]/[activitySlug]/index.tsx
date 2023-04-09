import { useRouter } from 'next/router';
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
  getActivity,
  NotebookVariant,
} from '../../../../src/Activities';
import NavigationBar from '../../../../components/NavigationBar';
import getLanguageDisplayName from '../../../../src/internationalization';
import { listAuthors } from '../../../../src/Authors';

export default function InfoPage({ uses, activity }: {
  uses : NotebookUse[], activity : Activity
}) {
  const router = useRouter();
  const {
    authorSlug, activitySlug,
  } = router.query as {
    authorSlug: string,
    activitySlug: string,
  };
  const title = activitySlug;
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
              src={`/activities/${authorSlug}/${activitySlug}/${activity.previewImage.filename}`}
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
                      pathname: '/activities/[authorSlug]/[activitySlug]/[language]/[version]',
                      query: {
                        authorSlug,
                        activitySlug,
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
                {uses.length === 1 ? 'course' : `${uses.length} courses`}
                :
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
  context: { params: { authorSlug: string, activitySlug: string } },
) {
  const {
    authorSlug, activitySlug,
  } = context.params;
  return {
    props: {
      uses: await getNotebookUses(authorSlug, activitySlug),
      activity: await getActivity(authorSlug, activitySlug),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthors();
  const paths = authors.flatMap((author) => author.activities.map(
    (activity) => `/activities/${author.slug}/${activity.slug}`,
  ));
  return {
    paths,
    fallback: false,
  };
}
