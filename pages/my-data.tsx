import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { produce } from 'immer';
import { useConfirm } from 'material-ui-confirm';
import Head from 'next/head';
import NextLink from 'next/link';
import { useState } from 'react';
import ExportLocalStorageButton from '../components/ExportLocalStorageButton';
import ImportLocalStorageButton from '../components/ImportLocalStorageButton';
import NavigationBar from '../components/navbar/NavigationBar';
import PageTitle from '../components/PageTitle';
import { clearStoredIdeWorkspace } from '../src/ide/filesPersistence';
import getEntireLocalStorage, {
  clearEntireLocalStorage,
  replaceEntireLocalStorage,
} from '../src/localStorage/entireLocalStorage';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { translationProps } from '../src/serverSideTranslationProps';
import theme from '../src/theme';
import { idePathname } from '../src/urlUtils';

export default function MyData() {
  const { metadata, setMetadata } = useLocalProfile();

  const [localStorageChanged, setLocalStorageChanged] = useState(0);
  const { t } = useLocalTranslation(['common']);
  const confirm = useConfirm();

  const currentSharingPreference = metadata.allowSharingAnonData;

  const changeExperimentKey = (newKey: string) => {
    setMetadata((currentMetadata) =>
      produce(currentMetadata, (draft) => {
        draft.experimentKey = newKey;
      }),
    );
  };

  const updateDataSharingPreference = (newPreference: 'yes' | 'no') => {
    setMetadata((currentMetadata) =>
      produce(currentMetadata, (draft) => {
        draft.allowSharingAnonData = newPreference;
      }),
    );
  };

  const handleGlobalReset = () => {
    confirm({
      title: t('resetAreYouSure'),
      description: t('deleteAllDataWarning'),
      confirmationText: t('deleteAllDataConfirm'),
    }).then(async ({ confirmed }) => {
      if (confirmed) {
        // Local storage + session storage + IndexedDB (IDE)
        clearEntireLocalStorage();
        sessionStorage.clear();
        await clearStoredIdeWorkspace();
        setLocalStorageChanged(localStorageChanged + 1);
      }
    });
  };

  const dataSharingOptIn = () => updateDataSharingPreference('yes');
  const dataSharingOptOut = () => updateDataSharingPreference('no');

  let currentSharingPreferenceDesc = 'not expressed';
  if (currentSharingPreference !== 'unknown') {
    currentSharingPreferenceDesc = `data collection${currentSharingPreference === 'yes' ? ' enabled' : ' disabled'}`;
  }

  return (
    <div>
      <Head>
        <title>My Data - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <PageTitle>My Data</PageTitle>
          <Typography
            variant='body1'
            sx={{
              marginY: 3,
            }}
          >
            Your data is stored in your browser&apos;s local storage. On this
            page you can see what is stored there, and you can import and export
            all your data if you wish. You also can configure your privacy
            settings, which influence what data gets sent to our server.
          </Typography>
          <Typography
            variant='h4'
            align='center'
            sx={{
              marginY: 3,
            }}
          >
            Export and Import
          </Typography>
          <Typography
            variant='body1'
            sx={{
              marginY: 3,
            }}
          >
            The data (e.g., source code) you enter in PyTamaro Web is stored in
            your browser, inside its local storage. You may want to export the
            data into a file you can carry around (e.g., if you work at home and
            in school), you can backup (e.g., if someone might clear your
            browser&apos;s local storage), or you can send to your teacher.
          </Typography>
          <Stack
            direction='row'
            spacing={10}
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ExportLocalStorageButton getData={getEntireLocalStorage} />
            <ImportLocalStorageButton
              onClick={(data) => {
                replaceEntireLocalStorage(data);
                setLocalStorageChanged(localStorageChanged + 1);
              }}
            />
          </Stack>
          <Typography
            variant='body1'
            sx={{
              marginY: 3,
            }}
          >
            If you have used the IDE, its files are not included in this export.
            To export or import your IDE files, go to the{' '}
            <Link component={NextLink} href={idePathname()}>
              IDE page
            </Link>{' '}
            and use the download and upload buttons in the file manager.
          </Typography>
          <Typography
            id='privacy-settings'
            variant='h4'
            align='center'
            sx={{
              marginY: 3,
            }}
          >
            Privacy Settings
          </Typography>
          <Typography
            variant='body1'
            sx={{
              marginY: 3,
            }}
          >
            PyTamaro Web is run by{' '}
            <Link href='https://luce.si.usi.ch/'>Luce</Link>, the computing
            education research group at USI in Lugano, Switzerland. We run
            PyTamaro Web on servers at USI. We can do this because our job is to
            conduct research on how people (like you) learn to program. We are
            not a company, and we do not sell your data to anyone. However, for
            our research, we need to understand the kind of programs learners
            write, and which learning trajectories they take through the
            activities. This is why we would like to anonymously store this
            data.
          </Typography>
          <Paper sx={{ padding: '2rem' }}>
            <Typography
              variant='h5'
              sx={{
                marginBottom: 3,
              }}
            >
              Anonymous data sharing for research
            </Typography>
            <Typography
              variant='body1'
              sx={{
                marginBottom: 3,
              }}
            >
              {`Current preference: ${currentSharingPreferenceDesc}.`}
            </Typography>
            <Stack direction='row' spacing={2}>
              <Button
                variant='contained'
                color='success'
                disabled={currentSharingPreference === 'yes'}
                onClick={dataSharingOptIn}
              >
                Enable
              </Button>
              <Button
                variant='contained'
                color='error'
                disabled={currentSharingPreference === 'no'}
                onClick={dataSharingOptOut}
              >
                Disable
              </Button>
            </Stack>
            <Typography
              variant='body1'
              sx={{
                marginTop: 3,
              }}
            >
              Please select whether you consent to anonymously use your data.
            </Typography>
          </Paper>
          <Typography
            variant='body1'
            sx={{
              marginY: 3,
            }}
          >
            Even if you allow sharing data for research purposes, we do not
            collect any personally-identifiable data. You remain completely
            anonymous. We will not know who you are, we will not know where you
            are. We describe this fully in our{' '}
            <Link component={NextLink} href='/privacy'>
              Privacy Policy
            </Link>
            .
          </Typography>
          <Accordion sx={{ mt: 6 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='body1'>
                Do you want to delete/reset ALL the data PyTamaro Web stores on
                your computer?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body2'>
                The button below will delete all the data this web application
                stores in your browser&apos;s local storage (i.e., deleting the
                code you have written in ALL activities and resetting the entire
                web application to its initial state).
              </Typography>
              <Button
                sx={{ mt: 2 }}
                variant='contained'
                color='error'
                onClick={handleGlobalReset}
              >
                ⚠️ Delete Everything ⚠️
              </Button>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ mt: 6 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='body1'>
                Are you part of a research experiment?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body2'>
                If you are part of a research experiment, specify here the{' '}
                <i>experiment key</i> you received from the researcher. This
                will allow us to associate the anonymous data with the
                experiment.
              </Typography>
              <TextField
                sx={{ mt: 2 }}
                fullWidth
                label='Experiment key'
                value={metadata.experimentKey}
                onChange={(e) => changeExperimentKey(e.target.value)}
                slotProps={{
                  htmlInput: {
                    style: { fontFamily: theme.pytamaro.monospaceFontFamily },
                    maxLength: 100,
                  },
                }}
              />
            </AccordionDetails>
          </Accordion>
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
