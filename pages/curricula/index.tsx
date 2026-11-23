import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { orderBy } from 'lodash';
import Head from 'next/head';
import CurriculaList from '../../components/CurriculaList';
import NavigationBar from '../../components/navbar/NavigationBar';
import visibleCurricula from '../../src/curricula';
import { visibleActivities } from '../../src/fs-content/activities';
import {
  listAuthorsProfiles,
  listAuthorsWithContent,
} from '../../src/fs-content/authors';
import { Author, AuthorProfile } from '../../src/schemas/authorSchema';
import { translationProps } from '../../src/serverSideTranslationProps';
import { curriculaByAuthorPathname } from '../../src/urlUtils';

export default function CurriculaPage({
  authors,
  authorsProfiles,
}: {
  authors: Author[];
  authorsProfiles: AuthorProfile[];
}) {
  const authorName = (slug: string) =>
    authorsProfiles.find((profile) => profile.slug === slug)?.name;

  // Sort authors alphabetically by name
  const sorted = orderBy(
    authors,
    [(author) => authorName(author.slug)],
    ['asc'],
  );
  // ... but keep 'luce' first
  const luceIndex = sorted.findIndex((author) => author.slug === 'luce');
  const sortedAuthors =
    luceIndex === -1 ? sorted : [sorted.splice(luceIndex, 1)[0], ...sorted];

  return (
    <div>
      <Head>
        <title>Curricula - PyTamaro</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography
            variant='h3'
            sx={{
              marginY: 3,
            }}
          >
            All Curricula
          </Typography>
          <Stack spacing={4}>
            {sortedAuthors.map((author: Author) => {
              if (author.curricula.length === 0) return null;
              const name = authorsProfiles.find(
                (profile) => profile.slug === author.slug,
              )?.name;
              return (
                <Stack spacing={2} key={author.slug}>
                  <Typography
                    variant='h4'
                    sx={{
                      marginY: 2,
                    }}
                  >
                    <Link
                      href={curriculaByAuthorPathname(author.slug)}
                      sx={{ textDecoration: 'none' }}
                    >
                      {name}
                    </Link>
                  </Typography>
                  <CurriculaList curricula={author.curricula} />
                </Stack>
              );
            })}
          </Stack>
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  const authorsWithContent = await listAuthorsWithContent();
  const authorsWithVisibleContent = authorsWithContent.map((content) => ({
    slug: content.slug,
    activities: visibleActivities(content.activities),
    curricula: visibleCurricula(content.curricula),
  }));
  return {
    props: {
      authorsProfiles: await listAuthorsProfiles(),
      authors: authorsWithVisibleContent,
      ...(await translationProps()),
    },
  };
}
