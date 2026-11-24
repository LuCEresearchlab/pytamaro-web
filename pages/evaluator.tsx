import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import Head from 'next/head';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import NavigationBar from '../components/navbar/NavigationBar';
import PageTitle from '../components/PageTitle';
import { EvaluatorContent } from '../components/RapidEvaluator';
import { ShareButton } from '../components/ShareButton';
import CentralContent from '../components/sidebar/CentralContent';
import Sidebar from '../components/sidebar/Sidebar';
import ToolboxListSidebar from '../components/sidebar/ToolboxListSidebar';
import SingleCellResetButton from '../components/SingleCellResetButton';
import { emptySingleCell } from '../components/SolitaryCodeCell';
import {
  urlWithCompressedCode,
  useSharedCodeFromQuery,
  useSharedCodeUrlUpdater,
} from '../src/codeSharing';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { translationProps } from '../src/serverSideTranslationProps';
import { evaluatorActivityVariant } from '../src/specialActivities';
import useReset from '../src/useReset';

export default function EvaluatorPage() {
  const initialCodeCells = emptySingleCell();
  const activity = useLocalActivity(initialCodeCells, evaluatorActivityVariant);
  const { metadata } = useLocalProfile();
  const { t } = useLocalTranslation();
  const { resetCounter, newReset } = useReset();

  useSharedCodeFromQuery({
    activitySession: activity.activitySession,
    onReplace: newReset,
    confirmDescription: t('replaceSharedCodeEvaluatorWarning'),
  });
  const updateQueryString = useSharedCodeUrlUpdater();

  const pageTitle = t('evaluator');

  return (
    <div>
      <Head>
        <title>{`${pageTitle} - PyTamaro`}</title>
      </Head>
      <Box>
        <NavigationBar>
          <SingleCellResetButton
            activityState={activity}
            newReset={newReset}
            subject={t('resetSingleCellSubject.evaluator')}
            tooltip={t('resetEvaluator')}
          />
        </NavigationBar>
        <DataSharingPreferenceDialog />
        <Grid container>
          <Sidebar side='left'>
            <ToolboxListSidebar />
          </Sidebar>
          <CentralContent>
            <PageTitle>{pageTitle}</PageTitle>
            <Container maxWidth={metadata.wideEditor ? false : 'md'}>
              <EvaluatorContent
                activityState={activity}
                activityVariant={evaluatorActivityVariant}
                pageStyle={true}
                resetCounter={resetCounter}
                postSourceChange={updateQueryString}
              />
            </Container>
            <Container maxWidth='md'>
              <Grid
                spacing={2}
                container
                sx={{
                  justifyContent: 'center',
                  marginTop: 12,
                }}
              >
                <ShareButton
                  getTextToCopy={() =>
                    urlWithCompressedCode(activity.activitySession.getSource(0))
                  }
                  message={t('share.urlCopiedToClipboard.success')}
                  failureMessage={t('share.urlCopiedToClipboard.failure')}
                />
              </Grid>
            </Container>
          </CentralContent>
          <Sidebar side='right' />
        </Grid>
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
