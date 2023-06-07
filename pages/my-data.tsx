/* eslint-disable max-len */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActions,
  Container, Link, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { produce } from 'immer';
import { useConfirm } from 'material-ui-confirm';
import Head from 'next/head';
import NextLink from 'next/link';
import { useState } from 'react';
import ExportLocalStorageButton from '../components/ExportLocalStorageButton';
import ImportLocalStorageButton from '../components/ImportLocalStorageButton';
import NavigationBar from '../components/NavigationBar';
import ToolboxFunctionSummary from '../components/ToolboxFunctionSummary';
import getLanguageDisplayName from '../src/internationalization';
import getEntireLocalStorage, { clearEntireLocalStorage, replaceEntireLocalStorage } from '../src/localStorage/entireLocalStorage';
import { ToolboxFunction } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import { isPlayground } from '../src/playground';
import { isSpecialActivity } from '../src/specialActivities';
import theme from '../src/theme';
import { activityVariantPathname, playgroundPathname } from '../src/urlUtils';

function ActivityVariantsList({ ids } : { ids: string[] }) {
  return (
    <ul>
      {ids.map((id) => {
        const [authorSlug, activitySlug, language, version] = id.split('/');
        if (isPlayground(authorSlug, activitySlug, language, version)) {
          return <li key={id}><Link href={playgroundPathname()}>Playground</Link></li>;
        }
        if (isSpecialActivity(authorSlug, activitySlug, language, version)) {
          return null;
        }
        const pathname = activityVariantPathname(
          authorSlug,
          activitySlug,
          language,
          version,
        );
        return (
          <li key={id}>
            <Link href={pathname}>
              {`${authorSlug} - ${activitySlug}`}
            </Link>
            {` (${getLanguageDisplayName(language)} at version ${version})`}
          </li>
        );
      })}
    </ul>
  );
}

function ToolboxList({ functions } : { functions: ToolboxFunction[] }) {
  const { deleteFunction } = useLocalToolbox();
  const confirm = useConfirm();

  const askDeleteFunction = (fn: ToolboxFunction) => {
    confirm({
      description:
  <Typography component="span">
    Are you sure you want to delete the function
    {' '}
    <Typography fontFamily={theme.pytamaro.monospaceFontFamily} component="span">{fn.name}</Typography>
    {' '}
    from your toolbox?
  </Typography>,
    }).then(() => {
      deleteFunction(fn);
    });
  };

  return (
    <>
      <Typography variant="h4" align="center" marginY={3}>My Toolbox</Typography>
      {functions.length === 0 ? (
        <Typography variant="body1" marginY={3}>
          Your toolbox is still empty.
        </Typography>
      ) : (
        <>
          <Typography variant="body1" marginY={3}>
            Your toolbox contains the following functions:
          </Typography>

          <Stack
            direction="column"
            spacing={2}
          >
            {functions.map((fn) => (
              <Card variant="outlined" key={fn.name}>
                <ToolboxFunctionSummary fn={fn} />
                <CardActions>
                  <Button
                    onClick={() => askDeleteFunction(fn)}
                    color="primary"
                    variant="contained"
                    sx={{ ml: 1 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </>
  );
}

export default function MyData() {
  const { metadata, setMetadata } = useLocalProfile();
  const cellsModifiedActivityVariantIds = metadata.activities
    .filter((a) => a.cellsModified)
    .map((a) => a.id);
  const completedActivityVariantIds = metadata.activities
    .filter((a) => a.completed)
    .map((a) => a.id);

  const { list } = useLocalToolbox();

  const [localStorageChanged, setLocalStorageChanged] = useState(0);
  const confirm = useConfirm();

  const currentSharingPreference = metadata.allowSharingAnonData;

  const changeExperimentKey = (newKey: string) => {
    setMetadata((currentMetadata) => produce(currentMetadata, (draft) => {
      draft.experimentKey = newKey;
    }));
  };

  const updateDataSharingPreference = (newPreference: 'yes' | 'no') => {
    setMetadata((currentMetadata) => produce(currentMetadata, (draft) => {
      draft.allowSharingAnonData = newPreference;
    }));
  };

  const handleGlobalReset = () => {
    confirm({ description: 'You are about to delete ALL the data. This action cannot be undone! ⚠️', confirmationText: 'Ok, delete everything' })
      .then(() => {
        clearEntireLocalStorage();
        setLocalStorageChanged(localStorageChanged + 1);
      });
  };

  const dataSharingOptIn = () => updateDataSharingPreference('yes');
  const dataSharingOptOut = () => updateDataSharingPreference('no');

  return (
    <div>
      <Head>
        <title>My Data - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography variant="h3" align="center" marginY={3}>My Data</Typography>
          <Typography variant="body1" marginY={3}>
            Your data is stored in your browser&apos;s local storage.
            On this page you can see what is stored there,
            and you can import and export all your data if you wish.
            You also can configure your privacy settings,
            which influence what data gets sent to our server.
          </Typography>
          <Typography variant="h4" align="center" marginY={3}>My Source Code</Typography>
          {cellsModifiedActivityVariantIds.length > 0 && (
            <>
              <Typography variant="body1" marginY={3}>
                You wrote source code for the following activities:
              </Typography>
              <ActivityVariantsList ids={cellsModifiedActivityVariantIds} />
            </>
          )}
          {cellsModifiedActivityVariantIds.length === 0 && (
            <Typography variant="body1" marginY={3}>
              You haven&apos;t written source code for any activities.
            </Typography>
          )}
          {completedActivityVariantIds.length > 0 && (
            <>
              <Typography variant="body1" marginY={3}>
                You completed the following activities:
              </Typography>
              <ActivityVariantsList ids={completedActivityVariantIds} />
            </>
          )}
          {completedActivityVariantIds.length === 0 && (
            <Typography variant="body1" marginY={3}>
              You haven&apos;t completed any activities.
            </Typography>
          )}
          <div id="toolbox" className="anchor">
            <ToolboxList functions={list()} />
          </div>
          <Typography variant="h4" align="center" marginY={3}>Export and Import</Typography>
          <Typography variant="body1" marginTop={3}>
            The data (e.g., source code) you enter in PyTamaro Web is stored in your browser,
            inside its local storage.
            You may want to export the data into a file
            you can carry around (e.g., if you work at home and in school),
            you can backup (e.g., if someone might clear your browser&apos;s local storage),
            or you can send to your teacher.
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={10}>
            <ExportLocalStorageButton
              getData={getEntireLocalStorage}
            />
            <ImportLocalStorageButton onClick={
                (data) => {
                  replaceEntireLocalStorage(data);
                  setLocalStorageChanged(localStorageChanged + 1);
                }
              }
            />
          </Stack>
          <Typography id="privacy-settings" variant="h4" align="center" marginY={3}>Privacy Settings</Typography>
          <Typography variant="body1" marginY={3}>
            PyTamaro Web is run by
            {' '}
            <Link href="https://luce.si.usi.ch/">Luce</Link>
            , the computing education research group at USI in Lugano, Switzerland.
            We run PyTamaro Web on servers at USI.
            We can do this because our job is to conduct research on how people (like you)
            learn to program.
            We are not a company, and we do not sell your data to anyone.
            However, for our research, we need to understand the kind of programs learners write,
            and which learning trajectories they take through the activities.
            This is why we would like to anonymously store this data.
          </Typography>
          <Paper sx={{ padding: '2rem' }}>
            <Typography variant="h5" marginBottom={3}>
              Anonymous data sharing for research
            </Typography>
            <Typography variant="body1" marginBottom={3}>
              Current preference:
              {' '}
              {currentSharingPreference === 'yes' && 'data collection enabled'}
              {currentSharingPreference === 'no' && 'data collection disabled'}
              {currentSharingPreference === 'unknown' && 'not expressed'}
              .
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="success" disabled={currentSharingPreference === 'yes'} onClick={dataSharingOptIn}>Enable</Button>
              <Button variant="contained" color="error" disabled={currentSharingPreference === 'no'} onClick={dataSharingOptOut}>Disable</Button>
            </Stack>
            <Typography variant="body1" marginTop={3}>
              Please select whether you consent to anonymously use your data.
            </Typography>
          </Paper>
          <Typography variant="body1" marginY={3}>
            Even if you allow sharing data for research purposes,
            we do not collect any personally-identifiable data.
            You remain completely anonymous.
            We will not know who you are, we will not know where you are.
            We describe this fully in our
            {' '}
            <Link component={NextLink} href="/privacy">Privacy Policy</Link>
            .
          </Typography>
          <Accordion sx={{ mt: 6 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1">Do you want to delete/reset ALL the data PyTamaro Web stores on your computer?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                The button below will delete all the data this web application stores in your browser&apos;s local storage
                (i.e., deleting the code you have written in ALL activities
                and resetting the entire web application to its initial state).
              </Typography>
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                color="error"
                onClick={handleGlobalReset}
              >
                ⚠️ Delete Everything ⚠️
              </Button>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ mt: 6 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1">Are you part of a research experiment?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                If you are part of a research experiment,
                specify here the
                {' '}
                <i>experiment key</i>
                {' '}
                you received from the researcher.
                This will allow us to associate the anonymous data with the experiment.
              </Typography>
              <TextField
                sx={{ mt: 2 }}
                inputProps={{
                  style: { fontFamily: theme.pytamaro.monospaceFontFamily },
                  maxLength: 100,
                }}
                fullWidth
                label="Experiment key"
                value={metadata.experimentKey}
                onChange={(e) => changeExperimentKey(e.target.value)}
              />
            </AccordionDetails>
          </Accordion>
        </Container>
      </Box>
    </div>
  );
}
