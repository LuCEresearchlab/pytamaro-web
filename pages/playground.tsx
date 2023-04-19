import {
  Box,
  Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import CodeCell from '../components/CodeCell';
import DownloadCodeButton from '../components/CodeDownloadButton';
import NavigationBar from '../components/NavigationBar';
import { createCodeCell, useCodeState } from '../src/codeState';
import NetworkErrorSnackbar from '../components/NetworkErrorSnackbar';
import ResetButton from '../components/ResetButton';

const INITIAL_SOURCE = `from pytamaro import rectangle, red, show_graphic

red_square = rectangle(100, 100, red)
show_graphic(red_square)`;

export default function Playground() {
  const initialCodeState = [createCodeCell(INITIAL_SOURCE, 0)];
  const {
    codeCells, cellsModified, networkError, setNetworkError,
    handleSourceChanged, handleExecute, handleToggleOutputArea, handleResetState, getWholeSource,
  } = useCodeState(initialCodeState, 'playground');
  const codeCellState = codeCells[0];
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
        <Container maxWidth="md">
          <Typography variant="h2" align="center" marginY={3}>Playground</Typography>
          <CodeCell
            codeCellState={codeCellState}
            onSourceChanged={(newSource) => handleSourceChanged(newSource, 0)}
            onExecutionRequested={() => handleExecute(0)}
            onOutputAreaToggled={() => handleToggleOutputArea(0)}
            firstLineNumber={1}
          />
          <DownloadCodeButton getSource={getWholeSource} />
        </Container>
      </Box>
    </div>
  );
}
