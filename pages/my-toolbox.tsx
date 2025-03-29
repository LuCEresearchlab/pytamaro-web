import { Box, Container, TextField } from '@mui/material';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import ToolboxFunctionsList from '../components/ToolboxFunctionsList';
import { translationProps } from '../src/serverSideTranslationProps';

export default function MyToolbox() {
  const [filterNameDesc, setFilterNameDesc] = useState('');
  const handleNewFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterNameDesc(e.target.value);
  };
  return (
    <div>
      <Head>
        <title>My Toolbox - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <PageTitle>My Toolbox</PageTitle>
          <TextField
            fullWidth
            label='Search by function name or description'
            variant='outlined'
            onChange={debounce(handleNewFilter, 100)}
            sx={{ mb: 3 }}
          />
          <ToolboxFunctionsList filterNameDesc={filterNameDesc} />
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
