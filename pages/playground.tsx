import {
  Box,
  Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import CodeCell from '../components/CodeCell';
import DownloadCodeButton from '../components/CodeDownloadButton';
import NavigationBar from '../components/NavigationBar';
import { asSingleSource, createCodeCell, useLocalActivity } from '../src/localStorage/useLocalActivity';
import NetworkErrorSnackbar from '../components/NetworkErrorSnackbar';
import ResetButton from '../components/ResetButton';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import { playgroundActivityVariant, playgroundInitialSource } from '../src/playground';

export default function Playground() {
  const initialCodeState = [createCodeCell(playgroundInitialSource, 0)];
  const {
    codeCells, cellsModified, networkError, setNetworkError,
    handleSourceChanged, handleExecute, handleToggleOutputArea, handleResetState,
  } = useLocalActivity(initialCodeState, playgroundActivityVariant);
  return (
    <div>
      <Head>
        <title>Playground - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar>
          <ResetButton enabled={cellsModified} onReset={handleResetState} />
        </NavigationBar>
        <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />
        <DataSharingPreferenceDialog />
        <Container maxWidth="md">
          <Typography variant="h2" align="center" marginY={3}>Playground</Typography>
          <CodeCell
            codeCellState={codeCells[0]}
            onSourceChanged={(newSource) => handleSourceChanged(newSource, 0)}
            onExecutionRequested={() => handleExecute(0)}
            onOutputAreaToggled={() => handleToggleOutputArea(0)}
            firstLineNumber={1}
          />
          <DownloadCodeButton getSource={() => asSingleSource(codeCells)} />
        </Container>
      </Box>
    </div>
  );
}
