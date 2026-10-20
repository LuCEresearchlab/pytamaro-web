import { ReactFlowProvider } from '@xyflow/react';
import { useEffect, useRef } from 'react';

import Tide from '../../components/tide/Tide';
import useJudiciousDocData from '../../src/documentation';
import { translationProps } from '../../src/serverSideTranslationProps';
import { useStore } from '../../src/tide/store';

import { FeedbackOutlined } from '@mui/icons-material';
import { Alert, Box, Container, Link, Typography } from '@mui/material';
import Head from 'next/head';
import PageTitle from '../../components/PageTitle';
import NavigationBar from '../../components/navbar/NavigationBar';
import theme from '../../src/theme';
import { KNOWN_JUDICIOUS_MODULES } from '../../components/documentation/utils';

function TidePage() {
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
          <PageTitle>TIDE: An IDE for TamaroCards</PageTitle>
          <Container>
            <Alert
              icon={<FeedbackOutlined />}
              severity='info'
              sx={{
                fontSize: theme.typography.body1.fontSize,
                fontWeight: 'normal',
                backgroundColor: theme.pytamaro.palette.background.light,
                marginBottom: 2,
              }}
            >
              TIDE is currently available in early preview. If you encounter any
              error, send us feedback using the button at the top right of the
              page.
            </Alert>
          </Container>

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
          <Container>
            <Typography
              variant='body1'
              align='center'
              sx={{
                marginTop: 8,
                fontSize: '1.3em',
              }}
            >
              Curious to know more about the design of TIDE? Read the research
              paper!{' '}
              <Link href='https://luce.si.usi.ch/assets/publications/bevilacquaTIDEEducationalLive2025.pdf'>
                [PDF]
              </Link>{' '}
              <Link href='https://doi.org/10.1145/3759534.3762683'>[DOI]</Link>
            </Typography>
          </Container>
        </div>
      </Box>
    </div>
  );
}

export default TidePage;

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps()),
    },
  };
}
