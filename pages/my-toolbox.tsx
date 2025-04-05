import { Box, Container, TextField } from '@mui/material';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import ToolboxFunctionsList from '../components/ToolboxFunctionsList';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { translationProps } from '../src/serverSideTranslationProps';

export default function MyToolbox() {
  const { t } = useLocalTranslation();
  const pageTitle = t('myToolbox');
  const [filterNameDesc, setFilterNameDesc] = useState('');
  const handleNewFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterNameDesc(e.target.value);
  };
  return (
    <div>
      <Head>
        <title>{`${pageTitle} - PyTamaro`}</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <PageTitle>{pageTitle}</PageTitle>
          <TextField
            fullWidth
            label={t('toolbox.searchByNameOrDesc')}
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
