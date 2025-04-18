import { Box, Container, Link, Typography } from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/navbar/NavigationBar';
import PageTitle from '../components/PageTitle';
import VariantsGallery from '../components/VariantsGallery';
import { listActivitiesAllAuthors } from '../src/fs-content/authors';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { findUserActivities } from '../src/progress';
import { Activity } from '../src/schemas/activitySchema';
import { translationProps } from '../src/serverSideTranslationProps';
import { activitiesByAuthorPathname } from '../src/urlUtils';

export default function MyActivities({
  activities,
}: {
  activities: Activity[];
}) {
  const { metadata } = useLocalProfile();
  const userActivities = findUserActivities(metadata.activities, activities);
  return (
    <div>
      <Head>
        <title>My Activities - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <PageTitle>My Activities</PageTitle>
          {userActivities.length > 0 ? (
            <VariantsGallery activitiesWithVariants={userActivities} />
          ) : (
            <Typography>
              No activity started so far.{' '}
              <Link href={activitiesByAuthorPathname('luce')}>
                Explore our activities!
              </Link>
            </Typography>
          )}
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      activities: await listActivitiesAllAuthors(),
      ...(await translationProps()),
    },
  };
}
