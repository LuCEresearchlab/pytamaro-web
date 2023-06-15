import {
  Box, Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import CurriculaList from '../../../components/CurriculaList';
import NavigationBar from '../../../components/NavigationBar';
import { getAuthorProfile, listAuthorsProfiles } from '../../../src/fs-content/authors';
import { listCurricula } from '../../../src/fs-content/curricula';
import { AuthorProfile } from '../../../src/schemas/authorSchema';
import { Curriculum } from '../../../src/schemas/curriculumSchema';
import { curriculaByAuthorPathname } from '../../../src/urlUtils';

export default function CurriculaPage({ curricula, authorProfile }:
{ curricula: Curriculum[], authorProfile: AuthorProfile }) {
  const pageTitle = `Curricula by ${authorProfile.name} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography variant="h3" marginY={3}>
            Curricula by
            {' '}
            {authorProfile.name}
          </Typography>
          <CurriculaList curricula={curricula} />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps(
  context: { params: { authorSlug: string } },
) {
  const {
    authorSlug,
  } = context.params;
  return {
    props: {
      curricula: await listCurricula(authorSlug),
      authorProfile: await getAuthorProfile(authorSlug),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsProfiles();
  const paths = authors.map((a) => curriculaByAuthorPathname(a.slug));
  return {
    paths,
    fallback: false,
  };
}
