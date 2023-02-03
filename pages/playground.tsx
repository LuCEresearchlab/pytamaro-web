import {
  Box,
  Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import CodeCell from '../components/CodeCell';
import DownloadCodeButton from '../components/CodeDownloadButton';
import NavigationBar from '../components/NavigationBar';
import ResetButton from '../components/ResetButton';
import { createCodeCell, useCodeState } from '../src/codeState';

const INITIAL_SOURCE = `from pytamaro import rectangle, red, show_graphic

red_square = rectangle(100, 100, red)
show_graphic(red_square)`;

export default function Playground() {
  const initialCodeState = [createCodeCell(INITIAL_SOURCE, 0)];
  const {
    codeCells, cellsModified,
    handleSourceChanged, handleExecute, handleToggleOutputArea, handleResetState, getWholeSource,
  } = useCodeState(initialCodeState, 'playground');
  const codeCellState = codeCells[0];
  return (
    <div>
      <Head>
        <title>Playground - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar title="Playground" />
        <ResetButton visible={cellsModified} onReset={handleResetState} />
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" marginY={3}>Playground</Typography>
          <CodeCell
            codeCellState={codeCellState}
            onSourceChanged={(newSource) => handleSourceChanged(newSource, 0)}
            onExecutionRequested={() => handleExecute(0)}
            onOutputAreaToggled={() => handleToggleOutputArea(0)}
          />
          <DownloadCodeButton getSource={getWholeSource} />
        </Container>
      </Box>
    </div>
  );
}
