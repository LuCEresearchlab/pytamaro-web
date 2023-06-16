import { TipsAndUpdates } from '@mui/icons-material';
import {
  Alert,
  Box,
  Container,
  Link,
  Typography,
} from '@mui/material';
import { sortBy } from 'lodash';
import Head from 'next/head';
import { activityVariantStatus } from '../components/ActivityStatusBadge';
import CurriculaList from '../components/CurriculaList';
import NavigationBar from '../components/NavigationBar';
import ToolboxFunctionsList from '../components/ToolboxFunctionsList';
import VariantsGallery from '../components/VariantsGallery';
import { listActivitiesAllAuthors, listCurriculaAllAuthors } from '../src/fs-content/authors';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { isPlayground } from '../src/playground';
import { Activity } from '../src/schemas/activitySchema';
import { Curriculum, curriculumToId } from '../src/schemas/curriculumSchema';
import { isSpecialActivity } from '../src/specialActivities';
import { activitiesByAuthorPathname, curriculaPathname, myDataPathname } from '../src/urlUtils';

export default function MyProgress({ activities, curricula } :
{ activities: Activity[],
  curricula: Curriculum[] }) {
  const { metadata } = useLocalProfile();
  const userCurriculaIds = metadata.curricula.map((c) => c.id);
  const userCurricula = curricula.filter((c) => userCurriculaIds.includes(curriculumToId(c)));
  const activitiesWithVariants = activities.flatMap(
    (a) => a.variants.flatMap((v) => ({ activity: a, variant: v })),
  );
  const sortedActivities = sortBy(activitiesWithVariants, ({ variant }) => {
    const status = activityVariantStatus(metadata.activities, variant);
    if (status === 'completed') {
      return 1;
    }
    if (status === 'in-progress') {
      return 0;
    }
    return 2;
  }).filter(({ variant: v }) => {
    if (isPlayground(v.authorSlug, v.activitySlug, v.language, v.version)
      || isSpecialActivity(v.authorSlug, v.activitySlug, v.language, v.version)) {
      return false;
    }
    const status = activityVariantStatus(metadata.activities, v);
    return status !== 'initial';
  });
  return (
    <div>
      <Head>
        <title>My Progress - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography variant="h3" align="center" marginTop={3}>My Progress</Typography>
          <Alert
            iconMapping={{
              success: <TipsAndUpdates fontSize="inherit" />,
            }}
            sx={{ mt: 3 }}
          >
            Do you want to export/import your data? Review or change your privacy settings?
            Visit the
            {' '}
            <Link href={myDataPathname()}>My Data</Link>
            {' '}
            page.
          </Alert>
          <Typography variant="h5" marginTop={6} marginBottom={3}>My Curricula</Typography>
          {userCurricula.length > 0
            ? <CurriculaList curricula={userCurricula} />
            : (
              <Typography>
                No curriculum started so far.
                {' '}
                <Link href={curriculaPathname()}>Explore our curricula!</Link>
              </Typography>
            )}
          <Typography variant="h5" marginTop={6} marginBottom={3}>My Activities</Typography>
          {sortedActivities.length > 0
            ? <VariantsGallery activitiesWithVariants={sortedActivities} />
            : (
              <Typography>
                No activity started so far.
                {' '}
                <Link href={activitiesByAuthorPathname('luce')}>Explore our activities!</Link>
              </Typography>
            )}
          <Typography variant="h5" marginTop={6} marginBottom={3}>My Toolbox</Typography>
          <ToolboxFunctionsList />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  const activities = await listActivitiesAllAuthors();
  const curricula = await listCurriculaAllAuthors();
  return {
    props: {
      activities,
      curricula,
    },
  };
}
