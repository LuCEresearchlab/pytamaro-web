import {
  Box,
  Button,
  Container, Link, Paper, Stack, Typography,
} from '@mui/material';
import Head from 'next/head';
import NextLink from 'next/link';
import useLocalStorageState from 'use-local-storage-state';
import NavigationBar from '../components/NavigationBar';
import { METADATA_KEY, getDefaultMetadata } from '../src/codeState';
import getLanguageDisplayName from '../src/internationalization';
import ExportLocalStorageButton from '../components/ExportLocalStorageButton';
import ImportLocalStorageButton from '../components/ImportLocalStorageButton';
import useLocalStorageMapState from '../src/localStorageMapState';
import { activityVariantPathname } from '../src/urlUtils';

function ActivityVariantsList({ ids } : { ids: string[] }) {
  return (
    <ul>
      {ids.map((id) => {
        const [authorSlug, activitySlug, language, version] = id.split('/');
        const pathname = activityVariantPathname(
          authorSlug,
          activitySlug,
          language,
          version,
        );
        return (
          <li key={id}>
            <Link href={pathname}>
              {`${authorSlug}/${activitySlug}`}
            </Link>
            {' '}
            (
            {getLanguageDisplayName(language)}
            ,
            {' '}
            latest version:
            {' '}
            {version}
            )
          </li>
        );
      })}
    </ul>
  );
}

export default function MyData() {
  const { localStorageMap, setLocalStorageMapFromString } = useLocalStorageMapState();
  const [metadata] = useLocalStorageState(METADATA_KEY, {
    defaultValue: getDefaultMetadata(),
  });
  const cellsModifiedActivityVariantIds = metadata.activities
    .filter((a) => a.cellsModified)
    .map((a) => a.id);
  const completedActivityVariantIds = metadata.activities
    .filter((a) => a.completed)
    .map((a) => a.id);

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
          <Typography variant="h4" align="center" marginY={3}>Privacy Settings</Typography>
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
            This is why we would like to place cookies in your browser.
          </Typography>
          <Paper sx={{ padding: '2rem' }}>
            <Typography variant="h5" marginBottom={3}>
              Cookie Permissions
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="success">Allow Luce Cookies</Button>
              <Button variant="contained" color="error">Disallow Luce Cookies</Button>
            </Stack>
            <Typography variant="body1" marginTop={3}>
              Please select whether you allow us to store our cookies in your browser.
            </Typography>
          </Paper>
          <Typography variant="body1" marginY={3}>
            Even if you allow our cookies,
            we do not collect any personally-identifiable data.
            You remain completely anonymous.
            We will not know who you are, we will not know where you are.
            We describe this fully in our
            {' '}
            <Link component={NextLink} href="/privacy">Privacy Policy</Link>
            .
          </Typography>
          <Typography variant="h4" align="center" marginY={3}>Export and Import</Typography>
          <Typography variant="body1" marginTop={3}>
            The data (e.g., source code) you enter in PyTamaro Web is stored in your browser,
            inside its local storage.
            You may want to export the data into a file
            you can carry around (e.g., if you work at home and in school),
            you can backup (e.g., if someone might clear your browser&apos;s local storage),
            or you can send to your teacher.
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <ExportLocalStorageButton
              getData={() => JSON.stringify(Object.fromEntries(localStorageMap))}
            />
            <ImportLocalStorageButton setLocalStorageMapFromString={setLocalStorageMapFromString} />
          </Stack>
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
        </Container>
      </Box>
    </div>
  );
}
