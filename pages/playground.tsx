import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import {
  Alert,
  AlertProps,
  AlertTitle,
  Box,
  Container, Typography, styled,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useConfirm } from 'material-ui-confirm';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import ActivitiesStripe from '../components/ActivitiesStripe';
import DownloadCodeButton from '../components/CodeDownloadButton';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import NavigationBar from '../components/NavigationBar';
import NetworkErrorSnackbar from '../components/NetworkErrorSnackbar';
import ResetButton from '../components/ResetButton';
import SaveToToolboxButton from '../components/SaveToToolboxButton';
import SolitaryCodeCell, { initialStateSingleCell } from '../components/SolitaryCodeCell';
import CentralContent from '../components/sidebar/CentralContent';
import Sidebar from '../components/sidebar/Sidebar';
import ToolboxListSidebar from '../components/sidebar/ToolboxListSidebar';
import getActivitiesWithAPIs, { ActivityVariantWithNames } from '../src/activitiesAPIs';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { playgroundActivityVariant, playgroundInitialSource } from '../src/playground';
import { PythonName, imported_names } from '../src/python-analyzer/python_analyzer';
import { translationProps } from '../src/serverSideTranslationProps';

function uniqueNames(names : PythonName[]) : Set<string> {
  return new Set(names.map(({ module, name }) => `${module}.${name}`));
}

const FullWidthAlert = styled(Alert)<AlertProps>(() => ({
  '& .MuiAlert-message': {
    width: '100%',
  },
}));

export default function Playground({ activitiesWithNames } :
{ activitiesWithNames : ActivityVariantWithNames[] }) {
  const localActivity = useLocalActivity(
    initialStateSingleCell(playgroundInitialSource),
    playgroundActivityVariant,
  );
  const {
    codeCells, codeExecutionStates, cellsModified, networkError, sourcesUpTo,
    setNetworkError, handleResetAllCellsNoConfirm,
  } = localActivity;
  const { outputSynced } = codeExecutionStates[0];

  const [recommendedActivities,
    setRecommendedActivities] = useState<ActivityVariantWithNames[]>([]);

  const [showRecommendedActivities, setShowRecommendedActivities] = useState(false);

  const confirm = useConfirm();

  const handleReset = () => {
    confirm({ description: 'You are about to reset the playground to its initial state: this will delete all the code you have written. This action cannot be undone! ⚠️', confirmationText: 'Ok, delete my code' })
      .then(() => {
        handleResetAllCellsNoConfirm();
      });
  };

  useEffect(() => {
    const recommendActivities = () => {
      try {
        const currentlyImported = uniqueNames(imported_names(codeCells[0].source));
        const scores = activitiesWithNames.map((activityWithName: ActivityVariantWithNames) => {
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
        });
        const sortedActivities = activitiesWithNames
          .map((activity, index) => ({ activity, score: scores[index] }))
          .sort((a, b) => b.score - a.score);
        setRecommendedActivities(sortedActivities.map((wrapper) => wrapper.activity));
        setShowRecommendedActivities(sortedActivities.length > 0);
      } catch (e) {
      // Could not parse, do not update recommendations.
      }
    };
    if (outputSynced) {
      recommendActivities();
    }
  }, [outputSynced, activitiesWithNames, codeCells]);

  return (
    <div>
      <Head>
        <title>Playground - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar>
          <ResetButton enabled={cellsModified} onReset={handleReset} tooltip="Reset Playground" />
        </NavigationBar>
        <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />
        <DataSharingPreferenceDialog />
        <Grid container>
          <Sidebar side="left">
            <ToolboxListSidebar />
          </Sidebar>
          <CentralContent>
            <Container maxWidth="md">
              <Typography variant="h2" align="center" marginY={3}>Playground</Typography>
              <SolitaryCodeCell
                activity={localActivity}
                activityVariant={playgroundActivityVariant}
                extraActions={(
                  <SaveToToolboxButton
                    sources={sourcesUpTo(0)}
                    originalActivity={playgroundActivityVariant}
                  />
            )}
              />
              <Box sx={{ display: 'flex', my: 4 }} justifyContent="center">
                <DownloadCodeButton codeCells={codeCells} />
              </Box>
              { showRecommendedActivities && (
              <FullWidthAlert
                icon={<TipsAndUpdatesIcon fontSize="inherit" />}
                onClose={() => { setShowRecommendedActivities(false); }}
                severity="success"
              >
                <AlertTitle>Try out these activities!</AlertTitle>
                <Typography variant="body1" gutterBottom>
                  Based on your code, these are recommended activites you can try to do next:
                </Typography>
                <ActivitiesStripe activities={recommendedActivities} />
              </FullWidthAlert>
              )}
            </Container>
          </CentralContent>
          <Sidebar side="right" />
        </Grid>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      activitiesWithNames: await getActivitiesWithAPIs(playgroundActivityVariant.authorSlug),
      ...await translationProps(['activityfooter']),
    },
  };
}
