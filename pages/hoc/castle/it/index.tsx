import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import { PlayArrow } from '@mui/icons-material';
import NavigationBar from '../../../../components/NavigationBar';
import MarketingImage from '../../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay-transparent.png';
import Valleys from '../../../../public/hoc/castle/BellinzonaAndValleysMap1862-sepia.gif';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';

export default function HocCastlePage() {
  return (
    <div>
      <Head>
        <title>Ora del Codice: Programma il Tuo Castello</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Ora del Codice ® con PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Programma il Tuo Castello
          </Typography>
          <Typography marginY={3} variant="h6" color="textSecondary">
            Benvenuto nell&apos;anno 1430. Sei il capo architetto del Duca
            di Milano. Il Duca ha bisogno di difendere le sue terre dagli
            Svizzeri, che vogliono attaccare dal Nord montuoso.
          </Typography>

          <Image
            priority
            src={Valleys}
            alt="Foto del Castello"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            Il Duca ti chiede di
            {' '}
            <strong>costruire una fortificazione</strong>
            {' '}
            che si estenda per l&apos;intera valle.
            Sceglie la città di Bellinzona come il luogo perfetto,
            in modo da poter controllare gli accessi ai vari passi
            di montagna da un unico punto.
          </Typography>

          <Typography marginY={3}>
            Il Duca é un governatore moderno: a lui piace utilizzare le ultime
            tecnologie.
            Ha sentito parlare di una nuova tecnologia chiamata
            {' '}
            <strong>programmazione</strong>
            .
            Vuole che tu scriva un programma Python per disegnare la
            fortificazione.
            Al Duca piacciono i castelli composti da diversi pezzi indipendenti.
            Puoi realizzare questo in Python invocando funzioni pure che
            producono e compongono pezzi.
          </Typography>

          <Image
            src={MarketingImage}
            alt="Foto del Castello"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            <strong>Se ci riesci</strong>
            ,
            i Milanesi saranno in grado di tenere Bellinzona fino alla fine del
            secolo, quando i Francesi prenderanno la città con i suoi tre
            castelli e bastioni e infine la cederanno agli Svizzeri nel 1503.
          </Typography>

          <Typography marginY={3}>
            <strong>Se fallisci</strong>
            ,
            dovremmo riscrivere la storia.
            E sarebbe meglio evitare di farlo!
          </Typography>

          <Typography marginY={3} align="center">
            <NextLink href="/curricula/luce-hoc/castle" passHref>
              <Button
                startIcon={<PlayArrow />}
                variant="contained"
                size="large"
              >
                Inizia a costruire!
              </Button>
            </NextLink>
          </Typography>

          <Typography marginY={3} align="center">
            Buona fortuna!
          </Typography>
          <Typography marginY={3} align="center">
            A proposito: La vera
            {' '}
            <a href="https://fortezzabellinzona.ch/en/">Fortezza Bellinzona</a>
            {' '}
            é un sito patrimonio mondiale dell&apos;UNESCO.
            Pertanto, le aspettative a cui dovrai rispondere sono alte!
          </Typography>
          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}
