import {
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../../../components/NavigationBar';
import { listCurricula } from '../../../src/fs-content/curricula';
import { Curriculum } from '../../../src/schemas/curriculumSchema';
import { curriculaByAuthorPathname } from '../../../src/urlUtils';
import CurriculumCard from '../../../components/CurriculumCard';
import { AuthorProfile } from '../../../src/schemas/authorSchema';
import { getAuthorProfile, listAuthorsProfiles } from '../../../src/fs-content/authors';

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
          <Stack spacing={2}>
            {curricula.map((curriculum: Curriculum) => (
              <CurriculumCard key={`${authorProfile.slug}/${curriculum.slug}`} authorSlug={authorProfile.slug} curriculum={curriculum} />
            ))}
          </Stack>
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
