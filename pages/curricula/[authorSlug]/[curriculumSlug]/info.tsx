import {
  Box,
  Card,
  Container, Stack, Typography,
} from '@mui/material';
import { sortBy } from 'lodash';
import Head from 'next/head';
import AttributionInfo from '../../../../components/AttributionInfo';
import CompetencyCard from '../../../../components/CompetencyCard';
import CurriculumCard from '../../../../components/CurriculumCard';
import NavigationBar from '../../../../components/NavigationBar';
import PageTitle from '../../../../components/PageTitle';
import { getAuthorProfile, listAuthorsWithContent } from '../../../../src/fs-content/authors';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import { AuthorProfile } from '../../../../src/schemas/authorSchema';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { curriculumInfoPathname } from '../../../../src/urlUtils';

export default function CurriculumInfoPage({ curriculum, author }:
{ curriculum : Curriculum, author: AuthorProfile }) {
  const { title } = curriculum;
  const pageTitle = `${title} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <PageTitle>
            Curriculum Information -
            {' '}
            {title}
          </PageTitle>
          <CurriculumCard curriculum={curriculum} />
          <Typography variant="h4" marginY={3}>Author & License</Typography>
          <AttributionInfo type="curriculum" author={author} derivedFrom={curriculum.derivedFrom} />
          {curriculum.competencies.length > 0 && (
            <>
              <Typography variant="h4" marginY={3}>Competencies</Typography>
              <Stack
                direction="column"
                spacing={2}
              >
                {sortBy(curriculum.competencies, (competency) => (competency.category === 'programming' ? 0 : 1)).map((competency) => (
                  <Card key={competency.id}>
                    <CompetencyCard
                      curriculum={curriculum}
                      competency={competency}
                      fullWidth
                    />
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

export async function getStaticProps(
  context: { params: {
    authorSlug: string,
    curriculumSlug: string,
  } },
) {
  const {
    authorSlug, curriculumSlug,
  } = context.params;
  const author = await getAuthorProfile(authorSlug);
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      author,
      curriculum,
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsWithContent();
  const paths = authors
    .flatMap((author) => author.curricula.map(
      (curriculum) => curriculumInfoPathname(author.slug, curriculum.slug),
    ));
  return {
    paths,
    fallback: false,
  };
}
