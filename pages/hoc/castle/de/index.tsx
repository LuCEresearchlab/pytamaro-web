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
import { HOC_TP_URL } from '..';

export default function HocCastlePage() {
  return (
    <div>
      <Head>
        <title>Stunde des Codes: Programmiere Deine Burg</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Stunde des Codes mit PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Programmiere Deine Burg
          </Typography>
          <Typography marginY={3} variant="h6" color="textSecondary">
            Willkommen im Jahr 1430. Du bist der Chefarchitekt des Herzogs von Mailand.
            Der Herzog muss seine Ländereien vor den Schweizern schützen,
            die gerne aus dem bergigen Norden angreifen.
          </Typography>

          <Image
            src={Valleys}
            alt="Photo of Castle"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            Der Herzog bittet Dich,
            {' '}
            <strong>eine Befestigung zu bauen</strong>
            {' '}
            die sich über das gesamte Tal erstreckt.
            Er wählte die Stadt Bellinzona als perfekten Ort aus,
            um mehrere Bergpässe an einer einzigen Stelle kontrollieren zu können.
          </Typography>

          <Typography marginY={3}>
            Der Herzog ist ein moderner Herrscher: Er nutzt gerne die neueste Technologie.
            Er hat von einer neuen Technologie namens
            {' '}
            <strong>Programmierung</strong>
            {' '}
            gehört.
            Er möchte, dass Du ein Python-Programm schreibst, um die Befestigung zu entwerfen.
            Der Herzog mag Burgen, die aus unabhängigen Teilen bestehen.
            In Python kannst Du das
            indem Du reine Funktionen aufrufst, um Teile zu erzeugen und zu komponieren.
          </Typography>

          <Image
            priority
            src={MarketingImage}
            alt="Photo of Castle"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            <strong>Falls Du Erfolg hast</strong>
            ,
            können die Mailänder Bellinzona bis zum Ende des Jahrhunderts halten,
            wenn die Franzosen die Stadt mit ihren drei Burgen und Befestigungen übernehmen
            und sie schließlich 1503 den Schweizern überlassen.
          </Typography>

          <Typography marginY={3}>
            <strong>Falls Du scheiterst</strong>
            ,
            müssen wir die Geschichte neu schreiben.
            Und das möchten wir lieber nicht tun!
          </Typography>

          <Typography marginY={3} align="center">
            <NextLink href="/curricula/luce-hoc/burg" passHref>
              <Button
                startIcon={<PlayArrow />}
                variant="contained"
                size="large"
              >
                Beginne zu bauen!
              </Button>
            </NextLink>
          </Typography>

          <Typography marginY={3} align="center">
            Viel Glück!
          </Typography>
          <Typography marginY={3} align="center">
            Übrigens: Die echte
            {' '}
            <a href="https://fortezzabellinzona.ch/de/">Festung Bellinzona</a>
            {' '}
            ist ein UNESCO-Weltkulturerbe.
            Du trittst also in grosse Fußstapfen!
          </Typography>

          <Image
            src={HOC_TP_URL}
            width="1"
            height="1"
            alt="HoC participation tracking pixel"
          />
          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}
