import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import ActivityConcepts from '../../../../components/ActivityConcepts';
import ActivityAuthorInfo from '../../../../components/AttributionInfo';
import CurriculaList from '../../../../components/CurriculaList';
import NavigationBar from '../../../../components/navbar/NavigationBar';
import visibleCurricula, { allActivities } from '../../../../src/curricula';
import {
  basicActivity,
  readActivity,
} from '../../../../src/fs-content/activities';
import {
  getAuthorProfile,
  listAuthorsWithContent,
  listCurriculaAllAuthors,
} from '../../../../src/fs-content/authors';
import getLanguageDisplayName from '../../../../src/internationalization';
import useLocalTranslation from '../../../../src/localStorage/useLocalTranslation';
import {
  Activity,
  BasicActivity,
} from '../../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../../src/schemas/authorSchema';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { translationProps } from '../../../../src/serverSideTranslationProps';
import {
  activityAssetPathname,
  activityPathname,
  activityVariantPathnameFromParts,
} from '../../../../src/urlUtils';

export default function ActivityInfoPage({
  activity,
  uses,
  derivedFrom,
  author,
  includingCurricula,
}: {
  activity: BasicActivity;
  uses: Activity['uses'];
  derivedFrom: Activity['derivedFrom'];
  author: AuthorProfile;
  includingCurricula: Curriculum[];
}) {
  const { t } = useLocalTranslation(['activity']);
  const title = activity.slug;
  const pageTitle = `${title} - PyTamaro`;

  const visibleUses = uses.filter((use) => use.hidden !== true);

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography
            variant='h2'
            sx={{
              marginY: 3,
            }}
          >
            {title}
          </Typography>
          <div
            style={{
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
              alt={t('activityImageAlt')}
              style={{
                padding: '1rem',
                objectFit: 'contain',
              }}
            />
          </div>
          <Typography
            variant='h4'
            sx={{
              marginTop: 4,
              marginBottom: 2,
            }}
          >
            {t('authorLicense')}
          </Typography>
          <ActivityAuthorInfo
            type='activity'
            author={author}
            derivedFrom={derivedFrom}
          />
          {activity.concepts.length > 0 && (
            <>
              <Typography
                variant='h4'
                sx={{
                  marginTop: 4,
                  marginBottom: 2,
                }}
              >
                {t('concepts')}
              </Typography>
              <ActivityConcepts concepts={activity.concepts} />
            </>
          )}
          <Typography
            variant='h4'
            sx={{
              marginTop: 4,
              marginBottom: 2,
            }}
          >
            {t('languages')}
          </Typography>
          <Typography variant='body1'>
            {activity.visibility === 'draft'
              ? t('underDevelopmentInLanguages')
              : t('availableInLanguages')}
          </Typography>
          <ul>
            {activity.languagesInfo.map((info) => (
              <li key={info.language}>
                {activity.visibility !== 'draft' ? (
                  <Link
                    href={activityVariantPathnameFromParts(
                      activity.authorSlug,
                      activity.slug,
                      info.language,
                      info.latestVersion,
                    )}
                  >
                    {info.title}
                  </Link>
                ) : (
                  <span>{info.title}</span>
                )}
                <span>
                  {` ${t('languageAndVersion', {
                    language: getLanguageDisplayName(info.language),
                    version: info.latestVersion,
                  })}`}
                </span>
              </li>
            ))}
          </ul>
          {includingCurricula.length > 0 && (
            <>
              <Typography
                variant='h4'
                sx={{
                  marginTop: 4,
                  marginBottom: 2,
                }}
              >
                {t('curricula')}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  marginBottom: 2,
                }}
              >
                {t('curriculaIncludingActivity', {
                  count: includingCurricula.length,
                })}
              </Typography>
              <CurriculaList curricula={includingCurricula} />
            </>
          )}
          {visibleUses.length > 0 && (
            <>
              <Typography
                variant='h4'
                sx={{
                  marginTop: 4,
                  marginBottom: 2,
                }}
              >
                {t('uses')}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  marginBottom: 3,
                }}
              >
                {t('usedInCourses', { count: visibleUses.length })}
              </Typography>
              <Stack spacing={2}>
                {visibleUses.map((use, idx) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Card key={idx}>
                    <CardContent>
                      <Typography
                        gutterBottom
                        sx={{
                          color: 'text.secondary',
                          fontSize: 14,
                        }}
                      >
                        {use.institution}
                      </Typography>
                      <Typography variant='h5' component='div'>
                        {use.course}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          mb: 1.5,
                        }}
                      >
                        {use.assignment}
                      </Typography>
                      <Typography variant='body2'>
                        {t('instructors', {
                          instructors: use.instructors.join(', '),
                        })}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button href={use.url} target='_blank' size='small'>
                        {t('viewCourse')}
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            </>
          )}
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps(context: {
  params: { authorSlug: string; activitySlug: string };
}) {
  const { authorSlug, activitySlug } = context.params;
  const allCurricula = await listCurriculaAllAuthors();
  const includingCurricula = visibleCurricula(allCurricula).filter(
    (curriculum) => {
      const activities = allActivities(curriculum);
      return activities.some(
        (activity) =>
          activity.variant.authorSlug === authorSlug &&
          activity.variant.activitySlug === activitySlug,
      );
    },
  );
  const activity = await readActivity(authorSlug, activitySlug);
  return {
    props: {
      author: await getAuthorProfile(authorSlug),
      activity: basicActivity(activity),
      uses: activity.uses,
      derivedFrom: activity.derivedFrom,
      includingCurricula,
      ...(await translationProps(['activity', 'concepts'])),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsWithContent();
  const paths = authors.flatMap((author) =>
    author.activities.map((activity) =>
      activityPathname(author.slug, activity.slug),
    ),
  );
  return {
    paths,
    fallback: false,
  };
}
