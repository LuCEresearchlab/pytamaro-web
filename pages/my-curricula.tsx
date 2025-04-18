import { Box, Container, Link, Typography } from '@mui/material';
import Head from 'next/head';
import CurriculaList from '../components/CurriculaList';
import NavigationBar from '../components/navbar/NavigationBar';
import PageTitle from '../components/PageTitle';
import { listCurriculaAllAuthors } from '../src/fs-content/authors';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { findStartedCurricula } from '../src/progress';
import { Curriculum } from '../src/schemas/curriculumSchema';
import { translationProps } from '../src/serverSideTranslationProps';
import { curriculaPathname } from '../src/urlUtils';

export default function MyCurricula({
  curricula,
}: {
  curricula: Curriculum[];
}) {
  const { metadata } = useLocalProfile();
  const startedCurricula = findStartedCurricula(metadata.curricula, curricula);
  return (
    <div>
      <Head>
        <title>My Curricula - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='lg'>
          <PageTitle>My Curricula</PageTitle>
          {startedCurricula.length > 0 ? (
            <CurriculaList
              curricula={startedCurricula}
              userActivities={metadata.activities}
              alwaysClickable
            />
          ) : (
            <Typography>
              No curriculum started so far.{' '}
              <Link href={curriculaPathname()}>Explore our curricula!</Link>
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
      curricula: await listCurriculaAllAuthors(),
      ...(await translationProps()),
    },
  };
}
