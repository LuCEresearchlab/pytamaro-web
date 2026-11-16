import { PlayLesson } from '@mui/icons-material';
import Construction from '@mui/icons-material/Construction';
import Route from '@mui/icons-material/Route';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Typography,
  styled,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Trans } from 'next-i18next/pages';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { activityVariantStatus } from '../components/ActivityStatusBadge';
import NavigationBar from '../components/navbar/NavigationBar';
import PageTitle from '../components/PageTitle';
import {
  listActivitiesAllAuthors,
  listCurriculaAllAuthors,
} from '../src/fs-content/authors';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { findStartedCurricula, findUserActivities } from '../src/progress';
import { Activity } from '../src/schemas/activitySchema';
import { Curriculum } from '../src/schemas/curriculumSchema';
import { translationProps } from '../src/serverSideTranslationProps';
import { toolboxDemoActivityVariant } from '../src/specialActivities';
import theme from '../src/theme';
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

export default function MyProgress({
  activities,
  curricula,
}: {
  activities: Activity[];
  curricula: Curriculum[];
}) {
  const { metadata } = useLocalProfile();
  const { t } = useLocalTranslation(['myProgress', 'common']);
  const startedCurricula = findStartedCurricula(metadata.curricula, curricula);
  const userActivities = findUserActivities(metadata.activities, activities);
  const inProgressActivities = userActivities.filter(
    ({ variant }) =>
      activityVariantStatus(metadata.activities, variant) === 'in-progress',
  );
  const completedActivities = userActivities.filter(
    ({ variant }) =>
      activityVariantStatus(metadata.activities, variant) === 'completed',
  );
  const router = useRouter();
  return (
    <div>
      <Head>
        <title>{`${t('common:my-progress')} - PyTamaro`}</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='lg'>
          <PageTitle>{t('common:my-progress')}</PageTitle>
          <Grid container spacing={2} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ResourceCard>
                <CardIcon>
                  <Route sx={{ fontSize: theme.typography.h3.fontSize }} />
                </CardIcon>
                <CardHeader
                  title={t('myProgress:myCurricula')}
                  slotProps={{
                    title: { align: 'center' },
                  }}
                />
                <CardContent>
                  <Typography>
                    {startedCurricula.length === 0
                      ? t('myProgress:noCurriculumStarted')
                      : t('myProgress:curriculaStarted', {
                          count: startedCurricula.length,
                        })}
                  </Typography>
                </CardContent>
                <CardActions sx={{ marginTop: 'auto' }}>
                  {startedCurricula.length > 0 ? (
                    <Button onClick={() => router.push(myCurriculaPathname())}>
                      {t('myProgress:seeMyCurricula')}
                    </Button>
                  ) : (
                    <Button onClick={() => router.push(curriculaPathname())}>
                      {t('myProgress:exploreCurricula')}
                    </Button>
                  )}
                </CardActions>
              </ResourceCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ResourceCard>
                <CardIcon>
                  <PlayLesson sx={{ fontSize: theme.typography.h3.fontSize }} />
                </CardIcon>
                <CardHeader
                  title={t('myProgress:myActivities')}
                  slotProps={{
                    title: { align: 'center' },
                  }}
                />
                <CardContent>
                  <Typography>
                    {inProgressActivities.length === 0 &&
                    completedActivities.length === 0
                      ? t('myProgress:noActivityStarted')
                      : t('myProgress:activitiesProgress', {
                          started: t('myProgress:activitiesStarted', {
                            count: inProgressActivities.length,
                          }),
                          completed: t('myProgress:activitiesCompleted', {
                            count: completedActivities.length,
                          }),
                        })}
                  </Typography>
                </CardContent>
                <CardActions sx={{ marginTop: 'auto' }}>
                  {inProgressActivities.length > 0 ||
                  completedActivities.length > 0 ? (
                    <Button onClick={() => router.push(myActivitiesPathname())}>
                      {t('myProgress:seeMyActivities')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        router.push(activitiesByAuthorPathname('luce'))
                      }
                    >
                      {t('myProgress:exploreActivities')}
                    </Button>
                  )}
                </CardActions>
              </ResourceCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ResourceCard>
                <CardIcon>
                  <Construction
                    sx={{ fontSize: theme.typography.h3.fontSize }}
                  />
                </CardIcon>
                <CardHeader
                  title={t('common:myToolbox')}
                  slotProps={{
                    title: { align: 'center' },
                  }}
                />
                <CardContent>
                  <Typography>
                    {metadata.toolbox.length === 0
                      ? t('myProgress:toolboxEmpty')
                      : t('myProgress:toolboxCount', {
                          count: metadata.toolbox.length,
                        })}
                  </Typography>
                </CardContent>
                <CardActions sx={{ marginTop: 'auto' }}>
                  {metadata.toolbox.length > 0 ? (
                    <Button onClick={() => router.push(myToolboxPathname())}>
                      {t('myProgress:seeMyToolbox')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        router.push(
                          activityVariantPathname(toolboxDemoActivityVariant),
                        )
                      }
                    >
                      {t('myProgress:learnToolbox')}
                    </Button>
                  )}
                </CardActions>
              </ResourceCard>
            </Grid>
          </Grid>
          <Alert
            iconMapping={{
              info: <TipsAndUpdates fontSize='inherit' />,
            }}
            severity='info'
            sx={{
              my: 3,
              backgroundColor: theme.pytamaro.palette.background.light,
              '& .MuiAlert-icon': {
                pt: 1,
              },
            }}
          >
            <Typography
              component='span'
              sx={{
                mr: 2,
              }}
            >
              {t('myProgress:dataBanner')}
            </Typography>
            <Button
              variant='outlined'
              size='small'
              href={myDataPathname()}
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              <Trans
                i18nKey='myProgress:goToMyData'
                components={{ strong: <span style={{ fontWeight: 'bold' }} /> }}
              />
            </Button>
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
      ...(await translationProps(['myProgress'])),
    },
  };
}
