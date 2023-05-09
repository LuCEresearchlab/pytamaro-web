import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import NavigationBar from '../../../components/NavigationBar';
import { listCurricula } from '../../../src/fs-content/curricula';
import { Curriculum } from '../../../src/schemas/curriculumSchema';
import listAuthors from '../../../src/fs-content/authors';
import { curriculaByAuthorPathname, curriculumPathname } from '../../../src/urlUtils';

export default function CurriculaPage({ curricula }: { curricula: Curriculum[] }) {
  const router = useRouter();
  const {
    authorSlug,
  } = router.query as {
    authorSlug: string,
  };
  const title = authorSlug;
  const pageTitle = `${title} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography variant="h2" marginY={3}>{title}</Typography>
          <Typography variant="h3" marginY={3}>Curricula</Typography>
          <Typography variant="body1" marginY={3}>
            The list of curricula offered by
            {' '}
            {authorSlug}
            :
          </Typography>
          <ul>
            {
              curricula.map((curriculum: Curriculum) => (
                <li key={curriculum.slug}>
                  { curriculum.visibility !== 'draft' && (
                    <Link href={{
                      pathname: curriculumPathname(authorSlug, curriculum.slug),
                    }}
                    >
                      {curriculum.title}
                    </Link>
                  )}
                </li>
              ))
            }
          </ul>
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
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthors();
  const paths = authors.map((a) => curriculaByAuthorPathname(a.slug));
  return {
    paths,
    fallback: false,
  };
}
