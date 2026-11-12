import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import {
  Alert,
  AlertProps,
  AlertTitle,
  Box,
  Container,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Head from 'next/head';
import { useContext, useEffect, useState } from 'react';
import ActivitiesStripe from '../components/ActivitiesStripe';
import DownloadCodeButton from '../components/CodeDownloadButton';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import MoreOptionsButton from '../components/MoreOptionsButton';
import NavigationBar from '../components/navbar/NavigationBar';
import PageTitle from '../components/PageTitle';
import { ShareButton } from '../components/ShareButton';
import CentralContent from '../components/sidebar/CentralContent';
import Sidebar from '../components/sidebar/Sidebar';
import ToolboxListSidebar from '../components/sidebar/ToolboxListSidebar';
import SingleCellResetButton from '../components/SingleCellResetButton';
import SolitaryCodeCell, {
  singleCodeCell,
} from '../components/SolitaryCodeCell';
import getActivitiesWithAPIs, {
  ActivityVariantWithNames,
} from '../src/activitiesAPIs';
import {
  urlWithCompressedCode,
  useSharedCodeFromQuery,
  useSharedCodeUrlUpdater,
} from '../src/codeSharing';
import { ExecutorContext } from '../src/execution/executorContext';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  playgroundActivityVariant,
  playgroundInitialSource,
} from '../src/playground';
import {
  findImportedNames,
  PythonName,
} from '../src/python-analyzer/python_analyzer';
import { translationProps } from '../src/serverSideTranslationProps';
import theme from '../src/theme';
import type { ActivityState } from '../src/useActivity';
import useReset from '../src/useReset';

function uniqueNames(names: PythonName[]): Set<string> {
  return new Set(names.map(({ module, name }) => `${module}.${name}`));
}

const FullWidthAlert = styled(Alert)<AlertProps>(() => ({
  '& .MuiAlert-message': {
    width: '100%',
  },
}));

function PlaygroundCodeCell({
  activityState,
  resetCounter,
  runEnabled,
  newReset,
}: {
  activityState: ActivityState;
  resetCounter: number;
  runEnabled: boolean;
  newReset: () => void;
}) {
  const {
    codeExecutionStates,
    handleToggleOutputArea,
    handleResetSingleCell,
    handleRestartPyodide,
    activitySession,
  } = activityState;

  useSharedCodeFromQuery({
    activitySession,
    onReplace: newReset,
    allowUncompressedCode: true,
    confirmDescription:
      'You are about to replace the code in your playground with new code!',
  });
  const updateQueryString = useSharedCodeUrlUpdater();

  return (
    <SolitaryCodeCell
      resetCounter={resetCounter}
      activityState={activityState}
      activityVariant={playgroundActivityVariant}
      postSourceChange={updateQueryString}
      allowToolboxSave={true}
      runEnabled={runEnabled}
      extraActions={
        <MoreOptionsButton
          activitySession={activitySession}
          cellIdx={0}
          codeCellExecutionState={codeExecutionStates[0]}
          onShowHideOutput={() => handleToggleOutputArea(0)}
          onReset={() => handleResetSingleCell(0, newReset)}
          onRestart={() => handleRestartPyodide()}
        />
      }
    />
  );
}

function RecommendedActivities({
  activitiesWithNames,
  activityState: activity,
}: {
  activitiesWithNames: ActivityVariantWithNames[];
  activityState: ActivityState;
}) {
  const [recommendedActivities, setRecommendedActivities] = useState<
    ActivityVariantWithNames[]
  >([]);

  const [showRecommendedActivities, setShowRecommendedActivities] =
    useState(true);

  const { codeCells, codeExecutionStates } = activity;
  const { outputSynced } = codeExecutionStates[0];

  useEffect(() => {
    if (outputSynced) {
      const currentlyImported = uniqueNames(
        findImportedNames(codeCells[0].source),
      );
      const scores = activitiesWithNames.map(
        (activityWithName: ActivityVariantWithNames) => {
          const { importedNames } = activityWithName;
          // Simple scoring algorithm:
          // for each name imported in the activity
          // +1 if also the user has imported it
          // -0.5 if the user has not imported it
          let score = 0;
          importedNames.forEach((name) => {
            score += currentlyImported.has(name) ? 1 : -0.5;
          });
          return score;
        },
      );
      const sortedActivities = activitiesWithNames
        .map((activity, index) => ({ activity, score: scores[index] }))
        .sort((a, b) => b.score - a.score);
      setRecommendedActivities(
        sortedActivities.map((wrapper) => wrapper.activity),
      );
    }
  }, [outputSynced, activitiesWithNames, codeCells]);

  return (
    showRecommendedActivities &&
    recommendedActivities.length > 0 && (
      <FullWidthAlert
        icon={<TipsAndUpdatesIcon fontSize='inherit' />}
        onClose={() => {
          setShowRecommendedActivities(false);
        }}
        severity='info'
        sx={{
          marginTop: 8,
          backgroundColor: theme.pytamaro.palette.background.light,
        }}
      >
        <AlertTitle>Try out these activities!</AlertTitle>
        <Typography variant='body1' gutterBottom>
          Based on your code, these are recommended activites you can try to do
          next:
        </Typography>
        <ActivitiesStripe activities={recommendedActivities} />
      </FullWidthAlert>
    )
  );
}

export default function Playground({
  activitiesWithNames,
}: {
  activitiesWithNames: ActivityVariantWithNames[];
}) {
  const initialCodeCells = singleCodeCell(playgroundInitialSource);
  const activityState = useLocalActivity(
    initialCodeCells,
    playgroundActivityVariant,
  );

  const { t } = useLocalTranslation();

  const { resetCounter, newReset } = useReset();

  const { metadata } = useLocalProfile();

  const { executorState } = useContext(ExecutorContext);
  // We don't care about isExecuting here because there's only one code cell
  // that we need to take care of
  const runEnabled = executorState.type !== 'loading';

  return (
    <div>
      <Head>
        <title>Playground - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar>
          <SingleCellResetButton
            activityState={activityState}
            newReset={newReset}
            subject={t('resetSingleCellSubject.playground')}
            tooltip={t('resetPlayground')}
          />
        </NavigationBar>
        <DataSharingPreferenceDialog />
        <Grid container>
          <Sidebar side='left'>
            <ToolboxListSidebar />
          </Sidebar>
          <CentralContent>
            <PageTitle>Playground</PageTitle>
            <Container maxWidth={metadata.wideEditor ? false : 'md'}>
              <PlaygroundCodeCell
                activityState={activityState}
                resetCounter={resetCounter}
                newReset={newReset}
                runEnabled={runEnabled}
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
                <DownloadCodeButton
                  activitySession={activityState.activitySession}
                />
                <ShareButton
                  getTextToCopy={() =>
                    urlWithCompressedCode(
                      activityState.activitySession.getSource(0),
                    )
                  }
                  message={t('share.urlCopiedToClipboard.success')}
                  failureMessage={t('share.urlCopiedToClipboard.failure')}
                />
                <RecommendedActivities
                  activitiesWithNames={activitiesWithNames}
                  activityState={activityState}
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
      activitiesWithNames: await getActivitiesWithAPIs(
        playgroundActivityVariant.authorSlug,
      ),
      ...(await translationProps(['activityfooter'])),
    },
  };
}
