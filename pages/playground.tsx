import {
  Alert,
  AlertProps,
  AlertTitle,
  Box,
  Container, Typography, styled,
} from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
// eslint-disable-next-line import/no-relative-packages
import { PythonName, imported_names } from '../src/parser/parser';
import CodeCell from '../components/CodeCell';
import DownloadCodeButton from '../components/CodeDownloadButton';
import NavigationBar from '../components/NavigationBar';
import { asSingleSource, createCodeCell, useLocalActivity } from '../src/localStorage/useLocalActivity';
import NetworkErrorSnackbar from '../components/NetworkErrorSnackbar';
import ResetButton from '../components/ResetButton';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import { playgroundActivityVariant, playgroundInitialSource } from '../src/playground';
import getActivitiesWithAPIs, { ActivityVariantWithNames } from '../src/activitiesAPIs';
import ActivitiesStripe from '../components/ActivitiesStripe';

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
  const initialCodeState = [createCodeCell(playgroundInitialSource, 0)];
  const {
    codeCells, cellsModified, networkError, setNetworkError,
    handleSourceChanged, handleExecute, handleToggleOutputArea,
    handleResetActivity, handleResetSingleCell,
  } = useLocalActivity(initialCodeState, playgroundActivityVariant);

  const [recommendedActivities,
    setRecommendedActivities] = useState<ActivityVariantWithNames[]>([]);

  const [showRecommendedActivities, setShowRecommendedActivities] = useState(false);

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

  return (
    <div>
      <Head>
        <title>Playground - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar>
          <ResetButton enabled={cellsModified} onReset={handleResetActivity} />
        </NavigationBar>
        <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />
        <DataSharingPreferenceDialog />
        <Container maxWidth="md">
          <Typography variant="h2" align="center" marginY={3}>Playground</Typography>
          <CodeCell
            codeCellState={codeCells[0]}
            onSourceChanged={(newSource) => handleSourceChanged(newSource, 0)}
            onExecutionRequested={() => { recommendActivities(); return handleExecute(0); }}
            onOutputAreaToggled={() => handleToggleOutputArea(0)}
            onReset={() => handleResetSingleCell(0)}
            firstLineNumber={1}
            activityVariant={playgroundActivityVariant}
          />
          <Box sx={{ display: 'flex', my: 4 }} justifyContent="center">
            <DownloadCodeButton getSource={() => asSingleSource(codeCells)} />
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
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      activitiesWithNames: await getActivitiesWithAPIs(playgroundActivityVariant.authorSlug),
    },
  };
}
