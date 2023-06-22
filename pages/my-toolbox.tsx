import {
  Box,
  Container
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import ToolboxFunctionsList from '../components/ToolboxFunctionsList';

export default function MyToolbox() {
  return (
    <div>
      <Head>
        <title>My Toolbox - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <PageTitle>My Toolbox</PageTitle>
          <ToolboxFunctionsList />
        </Container>
      </Box>
    </div>
  );
}
