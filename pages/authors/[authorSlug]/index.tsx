import { Box, Container, Divider, Link, Typography } from '@mui/material';
import { MDXRemote } from 'next-mdx-remote';
import Head from 'next/head';
import ActivitiesGallery from '../../../components/ActivitiesGallery';
import CurriculaList from '../../../components/CurriculaList';
import NavigationBar from '../../../components/NavigationBar';
import visibleCurricula from '../../../src/curricula';
import { visibleActivities } from '../../../src/fs-content/activities';
import {
  getAuthorContent,
  getAuthorProfile,
  listAuthorsProfiles,
} from '../../../src/fs-content/authors';
import { BasicActivity } from '../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../src/schemas/authorSchema';
import { Curriculum } from '../../../src/schemas/curriculumSchema';
import { translationProps } from '../../../src/serverSideTranslationProps';
import {
  activitiesByAuthorPathname,
  authorPathname,
  curriculaByAuthorPathname,
} from '../../../src/urlUtils';

export default function AuthorPage({
  authorProfile,
  curricula,
  activities,
}: {
  authorProfile: AuthorProfile;
  curricula: Curriculum[];
  activities: BasicActivity[];
}) {
  const pageTitle = `${authorProfile.name} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography variant='h3' marginY={3}>
            {authorProfile.name}
          </Typography>
          {authorProfile.description && (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <MDXRemote {...authorProfile.description} />
          )}
          <Divider />
          <Typography variant='h5' marginY={3}>
            <Link
              href={curriculaByAuthorPathname(authorProfile.slug)}
              underline='none'
            >
              Curricula by {authorProfile.name}
            </Link>
          </Typography>
          <CurriculaList curricula={curricula} />
          <Divider sx={{ my: 3 }} />
          <Typography variant='h5' marginY={3}>
            <Link
              href={activitiesByAuthorPathname(authorProfile.slug)}
              underline='none'
            >
              Activities by {authorProfile.name}
            </Link>
          </Typography>
        </Container>
        <Container maxWidth='xl'>
          <ActivitiesGallery activities={activities} />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps(context: {
  params: { authorSlug: string };
}) {
  const { authorSlug } = context.params;
  const content = await getAuthorContent(authorSlug);
  return {
    props: {
      authorProfile: await getAuthorProfile(authorSlug),
      curricula: visibleCurricula(content.curricula),
      activities: visibleActivities(content.activities),
      ...(await translationProps()),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsProfiles();
  const paths = authors.map((a) => authorPathname(a.slug));
  return {
    paths,
    fallback: false,
  };
}
