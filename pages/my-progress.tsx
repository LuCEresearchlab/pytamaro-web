import {
  Assignment,
  Handyman, Route, TipsAndUpdates,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Link,
  Typography,
  styled,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { activityVariantStatus } from '../components/ActivityStatusBadge';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import { listActivitiesAllAuthors, listCurriculaAllAuthors } from '../src/fs-content/authors';
import { format } from '../src/internationalization';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { findStartedCurricula, findUserActivities } from '../src/progress';
import { Activity } from '../src/schemas/activitySchema';
import { Curriculum } from '../src/schemas/curriculumSchema';
import { toolboxDemoActivityVariant } from '../src/specialActivities';
import th from '../src/theme';
import {
  activitiesByAuthorPathname,
  activityVariantPathname,
  curriculaPathname,
  myActivitiesPathname,
  myCurriculaPathname,
  myDataPathname,
  myToolboxPathname,
} from '../src/urlUtils';

const ResourceCard = styled(Card)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const CardIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(1),
}));

export default function MyProgress({ activities, curricula } :
{ activities: Activity[],
  curricula: Curriculum[] }) {
  const { metadata } = useLocalProfile();
  const startedCurricula = findStartedCurricula(metadata.curricula, curricula);
  const userActivities = findUserActivities(metadata.activities, activities);
  const inProgressActivities = userActivities.filter(({ variant }) => activityVariantStatus(metadata.activities, variant) === 'in-progress');
  const completedActivities = userActivities.filter(({ variant }) => activityVariantStatus(metadata.activities, variant) === 'completed');
  const router = useRouter();
  return (
    <div>
      <Head>
        <title>My Progress - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="lg">
          <PageTitle>My Progress</PageTitle>
          <Grid container spacing={2} sx={{ mb: 6 }}>
            <Grid xs={12} lg={4}>
              <ResourceCard>
                <CardIcon>
                  <Route sx={{ fontSize: th.typography.h3.fontSize }} />
                </CardIcon>
                <CardHeader
                  title="My Curricula"
                  titleTypographyProps={{ align: 'center' }}
                />
                <CardContent>
                  <Typography>
                    {startedCurricula.length === 0 ? 'No curriculum started so far.' : `${format(startedCurricula.length, 'curriculum', 'curricula')} started.`}
                  </Typography>
                </CardContent>
                <CardActions sx={{ marginTop: 'auto' }}>
                  {startedCurricula.length > 0 ? (
                    <Button onClick={() => router.push(myCurriculaPathname())}>
                      See My Curricula
                    </Button>
                  ) : (
                    <Button onClick={() => router.push(curriculaPathname())}>
                      Explore Curricula
                    </Button>
                  )}
                </CardActions>
              </ResourceCard>
            </Grid>
            <Grid xs={12} lg={4}>
              <ResourceCard>
                <CardIcon>
                  <Assignment sx={{ fontSize: th.typography.h3.fontSize }} />
                </CardIcon>
                <CardHeader
                  title="My Activities"
                  titleTypographyProps={{ align: 'center' }}
                />
                <CardContent>
                  <Typography>
                    {(inProgressActivities.length === 0 && completedActivities.length === 0) ? 'No activity started so far.'
                      : `${format(inProgressActivities.length, 'activity', 'activities')} started and ${format(completedActivities.length, 'activity', 'activities')} completed.`}
                  </Typography>
                </CardContent>
                <CardActions sx={{ marginTop: 'auto' }}>
                  {inProgressActivities.length > 0 || completedActivities.length > 0 ? (
                    <Button onClick={() => router.push(myActivitiesPathname())}>
                      See My Activities
                    </Button>
                  ) : (
                    <Button onClick={() => router.push(activitiesByAuthorPathname('luce'))}>
                      Explore Activities
                    </Button>
                  )}
                </CardActions>
              </ResourceCard>
            </Grid>
            <Grid xs={12} lg={4}>
              <ResourceCard>
                <CardIcon>
                  <Handyman sx={{ fontSize: th.typography.h3.fontSize }} />
                </CardIcon>
                <CardHeader
                  title="My Toolbox"
                  titleTypographyProps={{ align: 'center' }}
                />
                <CardContent>
                  <Typography>
                    {metadata.toolbox.length === 0 ? 'Toolbox still empty.' : `${format(metadata.toolbox.length, 'function', 'functions')} in the toolbox.`}
                  </Typography>
                </CardContent>
                <CardActions sx={{ marginTop: 'auto' }}>
                  {metadata.toolbox.length > 0 ? (
                    <Button onClick={() => router.push(myToolboxPathname())}>
                      See My Toolbox
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push(
                        activityVariantPathname(toolboxDemoActivityVariant),
                      )}
                    >
                      Learn How to Use the Toolbox
                    </Button>
                  )}
                </CardActions>
              </ResourceCard>
            </Grid>
          </Grid>
          <Alert
            iconMapping={{
              success: <TipsAndUpdates fontSize="inherit" />,
            }}
            sx={{ my: 3 }}
          >
            Do you want to export/import all your data? Review or change your privacy settings?
            Visit the
            {' '}
            <Link href={myDataPathname()}>My Data</Link>
            {' '}
            page.
          </Alert>
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
