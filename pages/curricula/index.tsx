import {
  Box,
  Container,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { orderBy } from 'lodash';
import { listAuthorsProfiles, listAuthorsWithContent } from '../../src/fs-content/authors';
import { Author, AuthorProfile } from '../../src/schemas/authorSchema';
import NavigationBar from '../../components/NavigationBar';
import { Curriculum } from '../../src/schemas/curriculumSchema';
import CurriculumCard from '../../components/CurriculumCard';
import { curriculaByAuthorPathname } from '../../src/urlUtils';

export default function CurriculaPage({ authors, authorsProfiles }:
{ authors: Author[], authorsProfiles: AuthorProfile[] }) {
  const authorName = (slug: string) => authorsProfiles.find(
    (profile) => profile.slug === slug,
  )?.name;

  // Sort authors alphabetically by name
  const sorted = orderBy(authors, [(author) => authorName(author.slug)], ['asc']);
  // ... but keep 'luce' first
  const luceIndex = sorted.findIndex((author) => author.slug === 'luce');
  const luce = sorted.splice(luceIndex, 1)[0];
  const sortedAuthors = [luce, ...sorted];

  return (
    <div>
      <Head>
        <title>Curricula - PyTamaro</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography variant="h3" marginY={3}>
            All Curricula
          </Typography>
          <Stack spacing={4}>
            {sortedAuthors.map((author: Author) => {
              if (author.curricula.length === 0) return null;
              const name = authorsProfiles.find((profile) => profile.slug === author.slug)?.name;
              return (
                <Stack spacing={2} key={author.slug}>
                  <Typography variant="h4" marginY={2}>
                    <Link href={curriculaByAuthorPathname(author.slug)} sx={{ textDecoration: 'none' }}>{name}</Link>
                  </Typography>
                  {author.curricula.map((curriculum: Curriculum) => (
                    <CurriculumCard key={`${author.slug}/${curriculum.slug}`} authorSlug={author.slug} curriculum={curriculum} />
                  ))}
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
  return {
    props: {
      authorsProfiles: await listAuthorsProfiles(),
      authors: await listAuthorsWithContent(),
    },
  };
}
