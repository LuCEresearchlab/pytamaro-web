import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import {
  Alert,
  AlertProps,
  AlertTitle,
  Box,
  Container,
  Typography,
  styled,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useConfirm } from 'material-ui-confirm';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ActivitiesStripe from '../components/ActivitiesStripe';
import DownloadCodeButton from '../components/CodeDownloadButton';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import FailedExecutionSnackbar from '../components/FailedExecutionSnackbar';
import MoreOptionsButton from '../components/MoreOptionsButton';
import NavigationBar from '../components/navbar/NavigationBar';
import ResetButton from '../components/navbar/ResetButton';
import PageTitle from '../components/PageTitle';
import SaveToToolboxButton from '../components/SaveToToolboxButton';
import CentralContent from '../components/sidebar/CentralContent';
import Sidebar from '../components/sidebar/Sidebar';
import ToolboxListSidebar from '../components/sidebar/ToolboxListSidebar';
import SolitaryCodeCell, {
  initialStateSingleCell,
} from '../components/SolitaryCodeCell';
import getActivitiesWithAPIs, {
  ActivityVariantWithNames,
} from '../src/activitiesAPIs';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import {
  playgroundActivityVariant,
  playgroundInitialSource,
} from '../src/playground';
import { PythonName, analyze } from '../src/python-analyzer/python_analyzer';
import { translationProps } from '../src/serverSideTranslationProps';
import useReset from '../src/useReset';

function uniqueNames(names: PythonName[]): Set<string> {
  return new Set(names.map(({ module, name }) => `${module}.${name}`));
}

const FullWidthAlert = styled(Alert)<AlertProps>(() => ({
  '& .MuiAlert-message': {
    width: '100%',
  },
}));

export default function Playground({
  activitiesWithNames,
}: {
  activitiesWithNames: ActivityVariantWithNames[];
}) {
  const [initialSource, setInitialSource] = useState(playgroundInitialSource);

  const localActivity = useLocalActivity(
    initialStateSingleCell(initialSource),
    playgroundActivityVariant,
  );

  const {
    codeCells,
    codeExecutionStates,
    cellsModified,
    executionFailed,
    sourcesUpTo,
    handleResetAllCellsNoConfirm,
    handleToggleOutputArea,
    handleResetSingleCell,
  } = localActivity;
  const { outputSynced } = codeExecutionStates[0];

  const [recommendedActivities, setRecommendedActivities] = useState<
    ActivityVariantWithNames[]
  >([]);

  const [showRecommendedActivities, setShowRecommendedActivities] =
    useState(true);

  const confirm = useConfirm();

  const { resetCounter, newReset } = useReset();

  const handleReset = () => {
    confirm({
      description:
        'You are about to reset the playground to its initial state: this will delete all the code you have written. This action cannot be undone! ⚠️',
      confirmationText: 'Ok, delete my code',
    }).then(() => {
      handleResetAllCellsNoConfirm();
      newReset();
    });
  };

  const { query } = useRouter();
  const codeFromQuery = query?.code;
  useEffect(
    () => {
      const replaceCode = (newCode: string) => {
        setInitialSource(newCode);
        handleResetAllCellsNoConfirm();
        newReset();
      };
      if (typeof codeFromQuery === 'string') {
        const queryCode = Buffer.from(codeFromQuery, 'base64').toString(
          'utf-8',
        );
        const userCode = codeCells[0].source;
        if (userCode !== queryCode) {
          if (userCode === playgroundInitialSource) {
            replaceCode(queryCode);
          } else {
            confirm({
              description:
                'You are about to replace the code in your playground with new code!',
              confirmationText: 'Ok, replace my code',
            }).then(() => {
              replaceCode(queryCode);
            });
          }
        }
      }
    },
    // We need to run this only once, when the query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeFromQuery],
  );

  const [fullWidthCell, setFullWidthCell] = useState(false);

  useEffect(() => {
    if (outputSynced) {
      const currentlyImported = uniqueNames(
        analyze(codeCells[0].source).imported_names,
      );
      const scores = activitiesWithNames.map(
        (activityWithName: ActivityVariantWithNames) => {
          const { importedNames } = activityWithName;
          // Simple scoring algorithm:
          // for each name imported in the activity
          // +1 if also the user has imported it
          // -0.5 if the user has not imported it
          let score = 0;
          uniqueNames(importedNames).forEach((name) => {
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
    <div>
      <Head>
        <title>Playground - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar>
          <ResetButton
            enabled={cellsModified}
            onReset={handleReset}
            tooltip='Reset Playground'
          />
        </NavigationBar>
        {executionFailed && <FailedExecutionSnackbar res={executionFailed} />}
        <DataSharingPreferenceDialog />
        <Grid container>
          <Sidebar side='left'>
            <ToolboxListSidebar />
          </Sidebar>
          <CentralContent>
            <PageTitle>Playground</PageTitle>
            <Container maxWidth={fullWidthCell ? false : 'md'}>
              <SolitaryCodeCell
                resetCounter={resetCounter}
                activity={localActivity}
                activityVariant={playgroundActivityVariant}
                extraActions={
                  <>
                    <SaveToToolboxButton
                      sources={sourcesUpTo(0)}
                      originalActivity={playgroundActivityVariant}
                    />
                    <MoreOptionsButton
                      codeCellState={codeCells[0]}
                      codeCellExecutionState={codeExecutionStates[0]}
                      onShowHideOutput={() => handleToggleOutputArea(0)}
                      onReset={() => handleResetSingleCell(0, newReset)}
                      fullWidthCell={fullWidthCell}
                      onFullWidthToggle={() => setFullWidthCell(!fullWidthCell)}
                    />
                  </>
                }
              />
            </Container>
            <Container maxWidth='md'>
              <Box
                sx={{ display: 'flex', marginTop: 12 }}
                justifyContent='center'
              >
                <DownloadCodeButton codeCells={codeCells} />
              </Box>
              {showRecommendedActivities &&
                recommendedActivities.length > 0 && (
                  <FullWidthAlert
                    icon={<TipsAndUpdatesIcon fontSize='inherit' />}
                    onClose={() => {
                      setShowRecommendedActivities(false);
                    }}
                    severity='info'
                    sx={{
                      marginTop: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <AlertTitle>Try out these activities!</AlertTitle>
                    <Typography variant='body1' gutterBottom>
                      Based on your code, these are recommended activites you
                      can try to do next:
                    </Typography>
                    <ActivitiesStripe activities={recommendedActivities} />
                  </FullWidthAlert>
                )}
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
