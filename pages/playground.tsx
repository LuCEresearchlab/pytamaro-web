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
import { debounce } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import ActivitiesStripe from '../components/ActivitiesStripe';
import DownloadCodeButton from '../components/CodeDownloadButton';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import MoreOptionsButton from '../components/MoreOptionsButton';
import NavigationBar from '../components/navbar/NavigationBar';
import ResetButton from '../components/navbar/ResetButton';
import PageTitle from '../components/PageTitle';
import { ShareButton } from '../components/ShareButton';
import CentralContent from '../components/sidebar/CentralContent';
import Sidebar from '../components/sidebar/Sidebar';
import ToolboxListSidebar from '../components/sidebar/ToolboxListSidebar';
import SolitaryCodeCell, {
  initialStateSingleCell,
} from '../components/SolitaryCodeCell';
import getActivitiesWithAPIs, {
  ActivityVariantWithNames,
} from '../src/activitiesAPIs';
import { ExecutorContext } from '../src/execution/executorContext';
import { CodeCellState } from '../src/localStorage/schema';
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
import useReset from '../src/useReset';

async function compressString(data: string): Promise<string> {
  const stream = new Blob([data], { type: 'text/plain' })
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  const blob = await new Response(stream).blob();
  return Buffer.from(await blob.arrayBuffer()).toString('base64');
}

async function decompressString(data: string): Promise<string> {
  const stream = new Blob([data], { type: 'text/base64' })
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  const blob = await new Response(stream).blob();
  return Buffer.from(
    Buffer.from(await blob.arrayBuffer()).toString('base64'),
    'base64',
  ).toString('utf-8');
}

function uniqueNames(names: PythonName[]): Set<string> {
  return new Set(names.map(({ module, name }) => `${module}.${name}`));
}

const FullWidthAlert = styled(Alert)<AlertProps>(() => ({
  '& .MuiAlert-message': {
    width: '100%',
  },
}));

function PlaygroundReset({
  initialCodeCells,
  newReset,
}: {
  initialCodeCells: CodeCellState[];
  newReset: () => void;
}) {
  const { handleResetAllCellsNoConfirm, cellsModified } = useLocalActivity(
    initialCodeCells,
    playgroundActivityVariant,
  );
  const confirm = useConfirm();
  const handleReset = () => {
    confirm({
      description:
        'You are about to reset the playground to its initial state: this will delete all the code you have written. This action cannot be undone! ⚠️',
      confirmationText: 'Ok, delete my code',
    }).then(({ confirmed }) => {
      if (confirmed) {
        handleResetAllCellsNoConfirm();
        newReset();
      }
    });
  };

  return (
    <ResetButton
      enabled={cellsModified}
      onReset={handleReset}
      tooltip='Reset Playground'
    />
  );
}

function PlaygroundCodeCell({
  initialCodeCells,
  resetCounter,
  runEnabled,
  newReset,
  setInitialSource,
}: {
  initialCodeCells: CodeCellState[];
  resetCounter: number;
  runEnabled: boolean;
  newReset: () => void;
  setInitialSource: (newSource: string) => void;
}) {
  const localActivity = useLocalActivity(
    initialCodeCells,
    playgroundActivityVariant,
  );
  const {
    codeCells,
    codeExecutionStates,
    handleToggleOutputArea,
    handleResetSingleCell,
    handleResetAllCellsNoConfirm,
    handleRestartPyodide,
  } = localActivity;

  const confirm = useConfirm();

  const { query } = useRouter();
  const codeFromQuery = query?.code;
  const compressedCodeFromQuery = query?.c;
  useEffect(
    () => {
      const replaceCode = (newCode: string) => {
        setInitialSource(newCode);
        handleResetAllCellsNoConfirm();
        newReset();
      };

      const setCodeFromQuery = (queryCode: string) => {
        const userCode = codeCells[0].source;
        if (userCode !== queryCode) {
          if (userCode === playgroundInitialSource) {
            replaceCode(queryCode);
          } else {
            confirm({
              description:
                'You are about to replace the code in your playground with new code!',
              confirmationText: 'Ok, replace my code',
            }).then(({ confirmed }) => {
              if (confirmed) {
                replaceCode(queryCode);
              }
            });
          }
        }
      };

      if (typeof codeFromQuery === 'string') {
        setCodeFromQuery(
          Buffer.from(codeFromQuery, 'base64').toString('utf-8'),
        );
      } else if (typeof compressedCodeFromQuery === 'string') {
        decompressString(compressedCodeFromQuery)
          .then(setCodeFromQuery)
          .catch(() => {});
      }
    },
    // We need to run this only once, when the query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeFromQuery, compressedCodeFromQuery],
  );
  const updateQueryString = useMemo(
    () =>
      debounce((newSource: string) => {
        compressString(newSource).then((newCode: string) => {
          const newQuery = {
            ...query,
            c: newCode,
          };
          // Do not persist uncompressed code
          Reflect.deleteProperty(newQuery, 'code');
          window.history.replaceState(
            {},
            '',
            `?${new URLSearchParams(newQuery)}`,
          );
        });
      }, 1000),
    [query],
  );

  return (
    <SolitaryCodeCell
      resetCounter={resetCounter}
      activity={localActivity}
      activityVariant={playgroundActivityVariant}
      postSourceChange={updateQueryString}
      allowToolboxSave={true}
      runEnabled={runEnabled}
      extraActions={
        <MoreOptionsButton
          codeCellState={codeCells[0]}
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
  initialCodeCells,
}: {
  activitiesWithNames: ActivityVariantWithNames[];
  initialCodeCells: CodeCellState[];
}) {
  const [recommendedActivities, setRecommendedActivities] = useState<
    ActivityVariantWithNames[]
  >([]);

  const [showRecommendedActivities, setShowRecommendedActivities] =
    useState(true);

  const { codeCells, codeExecutionStates } = useLocalActivity(
    initialCodeCells,
    playgroundActivityVariant,
  );
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

function PlaygroundCodeDownloadButton({
  initialCodeCells,
}: {
  initialCodeCells: CodeCellState[];
}) {
  const localActivity = useLocalActivity(
    initialCodeCells,
    playgroundActivityVariant,
  );
  const { codeCells } = localActivity;
  return <DownloadCodeButton codeCells={codeCells} />;
}

function PlaygroundCodeShareButton() {
  const { t } = useLocalTranslation();

  return (
    <ShareButton
      getTextToCopy={() => window.location.toString()}
      message={t('share.urlCopiedToClipboard.success')}
      failureMessage={t('share.urlCopiedToClipboard.failure')}
    />
  );
}

export default function Playground({
  activitiesWithNames,
}: {
  activitiesWithNames: ActivityVariantWithNames[];
}) {
  const [initialSource, setInitialSource] = useState(playgroundInitialSource);

  const initialCodeCells = initialStateSingleCell(initialSource);

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
          <PlaygroundReset
            initialCodeCells={initialCodeCells}
            newReset={newReset}
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
                initialCodeCells={initialCodeCells}
                resetCounter={resetCounter}
                newReset={newReset}
                runEnabled={runEnabled}
                setInitialSource={setInitialSource}
              />
            </Container>
            <Container maxWidth='md'>
              <Grid
                sx={{ marginTop: 12 }}
                justifyContent='center'
                spacing={2}
                container
              >
                <PlaygroundCodeDownloadButton
                  initialCodeCells={initialCodeCells}
                />
                <PlaygroundCodeShareButton />
                <RecommendedActivities
                  activitiesWithNames={activitiesWithNames}
                  initialCodeCells={initialCodeCells}
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
