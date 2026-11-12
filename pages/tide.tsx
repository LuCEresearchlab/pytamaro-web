import { ReactFlowProvider } from '@xyflow/react';
import { useEffect, useRef } from 'react';

import Tide from '../components/tide/Tide';
import useJudiciousDocData from '../src/documentation';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { translationProps } from '../src/serverSideTranslationProps';
import { useStore } from '../src/tide/store';

import { Box } from '@mui/material';
import Head from 'next/head';
import PageTitle from '../components/PageTitle';
import { KNOWN_JUDICIOUS_MODULES } from '../components/documentation/utils';
import NavigationBar from '../components/navbar/NavigationBar';

function TidePage() {
  const { t } = useLocalTranslation(['tide']);
  const { setJudicious } = useStore();

  const cached_modules = useRef('');

  const modules = useJudiciousDocData(KNOWN_JUDICIOUS_MODULES);
  const moduleNames = modules.map((v) => v.module).join('|');

  useEffect(() => {
    if (moduleNames === cached_modules.current) return;
    setJudicious(modules);
    cached_modules.current = moduleNames;
  }, [moduleNames, modules, setJudicious]);

  return (
    <div>
      <Head>
        <title>TIDE - PyTamaro</title>
      </Head>
      <Box>
        <div className='graph_page'>
          <NavigationBar />
          <PageTitle>{t('page.title')}</PageTitle>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            <ReactFlowProvider>
              <Tide />
            </ReactFlowProvider>
          </div>
        </div>
      </Box>
    </div>
  );
}

export default TidePage;

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps(['tide'])),
    },
  };
}
