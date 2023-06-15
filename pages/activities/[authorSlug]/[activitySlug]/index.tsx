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
import NavigationBar from '../../../../components/NavigationBar';
import { getActivityUses, readActivity } from '../../../../src/fs-content/activities';
import { listAuthorsWithContent } from '../../../../src/fs-content/authors';
import getLanguageDisplayName from '../../../../src/internationalization';
import { Activity, ActivityUse } from '../../../../src/schemas/activitySchema';
import { activityAssetPathname, activityPathname, activityVariantPathname } from '../../../../src/urlUtils';

export default function InfoPage({ uses, activity }: {
  uses : ActivityUse[], activity : Activity
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
              src={activityAssetPathname(
                activity.authorSlug,
                activity.slug,
                activity.previewImage.filename,
              )}
              alt="Activity Image"
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
              activity.languagesInfo.map((info) => (
                <li key={info.language}>
                  { activity.visibility !== 'draft' && (
                    <Link href={activityVariantPathname(
                      activity.authorSlug,
                      activity.slug,
                      info.language,
                      info.latestVersion,
                    )}
                    >
                      {info.title}
                    </Link>
                  )}
                  { activity.visibility === 'draft' && (
                    info.title
                  )}
                  {' '}
                  (
                  {getLanguageDisplayName(info.language)}
                  ,
                  {' '}
                  latest version:
                  {' '}
                  {info.latestVersion}
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
              {uses.map((use) => (
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
      uses: await getActivityUses(authorSlug, activitySlug),
      activity: await readActivity(authorSlug, activitySlug),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsWithContent();
  const paths = authors.flatMap((author) => author.activities.map(
    (activity) => activityPathname(author.slug, activity.slug),
  ));
  return {
    paths,
    fallback: false,
  };
}
