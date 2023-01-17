import {
  Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';
import CodeCell from '../components/CodeCell';
import DownloadCodeButton from '../components/CodeDownloadButton';
import NavigationBar from '../components/NavigationBar';
import { executeCode } from '../src/CodeExecution';

const INITIAL_SOURCE = `from pytamaro import rectangle, red, show_graphic

red_square = rectangle(100, 100, red)
show_graphic(red_square)`;

export default function Playground() {
  const [source, setSource] = useState(INITIAL_SOURCE);
  return (
    <div>
      <Head>
        <title>Playground - PyTamaro</title>
      </Head>
      <Container maxWidth="lg">
        <NavigationBar title="Playground" />
        <Typography variant="h2" align="center" marginY={3}>Playground</Typography>
        <CodeCell
          source={source}
          onSourceChanged={setSource}
          compile={() => executeCode(source)}
        />
        <DownloadCodeButton getSource={() => source} />
      </Container>
    </div>
  );
}
