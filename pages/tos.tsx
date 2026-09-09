import { Box, Container, Typography } from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/navbar/NavigationBar';
import { translationProps } from '../src/serverSideTranslationProps';

export default function TermsOfService() {
  return (
    <div>
      <Head>
        <title>Terms of Service - PyTamaro Web</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <Typography
            variant='h3'
            align='center'
            sx={{
              marginY: 3,
            }}
          >
            Terms of Service
          </Typography>
          <Typography variant='h6'>.</Typography>
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
