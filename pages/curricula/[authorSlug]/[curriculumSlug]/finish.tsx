import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import CompetenciesList from '../../../../components/CompetenciesList';
import CurriculumCard from '../../../../components/CurriculumCard';
import NavigationBar from '../../../../components/NavigationBar';
import PageTitle from '../../../../components/PageTitle';
import { listAuthorsWithContent } from '../../../../src/fs-content/authors';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { translationProps } from '../../../../src/serverSideTranslationProps';
import { curriculumFinishPathname } from '../../../../src/urlUtils';

export default function CurriculumInfoPage({ curriculum }:
{ curriculum : Curriculum }) {
  const { title } = curriculum;
  const pageTitle = `Finished - ${title} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <PageTitle>
            Finished!
          </PageTitle>
          <CurriculumCard curriculum={curriculum} />
          {curriculum.competencies.length > 0 && (
            <>
              <Box display="flex" alignItems="baseline" marginTop={9} marginBottom={3}>
                <Typography variant="h5">Review the competencies practiced in this curriculum</Typography>
              </Box>
              <CompetenciesList curriculum={curriculum} />
            </>
          )}
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps(
  context: { params: {
    authorSlug: string,
    curriculumSlug: string,
  } },
) {
  const {
    authorSlug, curriculumSlug,
  } = context.params;
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      curriculum,
      ...await translationProps(),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsWithContent();
  const paths = authors
    .flatMap((author) => author.curricula.map(
      (curriculum) => curriculumFinishPathname(author.slug, curriculum.slug),
    ));
  return {
    paths,
    fallback: false,
  };
}
