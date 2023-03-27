import {
  Box,
  Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';

export default function TermsOfService() {
  return (
    <div>
      <Head>
        <title>Terms of Service - PyTamaro Web</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography variant="h3" align="center" marginY={3}>Terms of Service</Typography>
          <Typography variant="h6">
            .
          </Typography>
        </Container>
      </Box>
    </div>
  );
}
