import {
  Box, Container, Divider, Typography,
} from '@mui/material';
import Head from 'next/head';
import ActivitiesGallery from '../../components/ActivitiesGallery';
import NavigationBar from '../../components/NavigationBar';
import { visibleActivities } from '../../src/fs-content/activities';
import { listActivitiesAllAuthors } from '../../src/fs-content/authors';
import { Concept, knownConcepts } from '../../src/schemas/activityConcepts';
import { BasicActivity } from '../../src/schemas/activitySchema';
import { translationProps } from '../../src/serverSideTranslationProps';
import { conceptPathname } from '../../src/urlUtils';

export default function ConceptPage({ concept, activities }:
{ concept: Concept, activities: BasicActivity[] }) {
  const pageTitle = `${concept.title} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography variant="h3" marginY={3}>
            {concept.title}
          </Typography>
          <Typography variant="h6" marginY={3}>
            {concept.description}
          </Typography>
          <Divider sx={{ my: 3 }} />
        </Container>
        <Container maxWidth="xl">
          <ActivitiesGallery activities={activities} />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps(
  context: { params: { id: string } },
) {
  const {
    id,
  } = context.params;
  return {
    props: {
      concept: knownConcepts[id],
      activities: visibleActivities(await listActivitiesAllAuthors())
        .filter((activity) => activity.concepts.includes(id)),
      ...await translationProps(),
    },
  };
}

export function getStaticPaths() {
  return {
    paths: Object.keys(knownConcepts).map(conceptPathname),
    fallback: false,
  };
}
