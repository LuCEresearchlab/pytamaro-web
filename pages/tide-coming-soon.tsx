import { Box, Container, Link, Typography } from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/navbar/NavigationBar';
import PageTitle from '../components/PageTitle';
import { translationProps } from '../src/serverSideTranslationProps';

export default function TIDEPage() {
  return (
    <div>
      <Head>
        <title>TIDE</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <PageTitle>TIDE: An IDE for TamaroCards</PageTitle>
          <Typography variant='h6' marginTop={12} align='center'>
            Coming soon! In the meantime, you can read the paper{' '}
            <Link href='https://doi.org/10.1145/3759534.3762683'>here</Link>.
          </Typography>
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps()),
    },
  };
}
