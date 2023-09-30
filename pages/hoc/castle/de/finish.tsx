import {
  Box,
  Button,
  Container,
  Link,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../../../components/NavigationBar';
import MarketingImage from '../../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay.jpg';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';

export default function FinishHocCastlePage() {
  return (
    <div>
      <Head>
        <title>Stunde des Codes: Programmiere Deine Burg: Ziel Erreicht!</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Stunde des Codes mit PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Mission (Fast) Beendet!
          </Typography>
          <Typography marginY={3} variant="h6" color="textSecondary">
            Deine Burg sollte den Mailändern helfen,
            die Stadt Bellinzona bis zum Ende des Jahrhunderts in Besitz zu halten.
          </Typography>
          <Typography marginY={3}>
            Trotz Deiner großartigen Konstruktion
            werden die Franzosen die Stadt und ihre Befestigung schließlich übernehmen,
            und sie werden sie dann um 1503 den Schweizern überlassen.
          </Typography>

          <Typography marginY={3}>
            Unglücklicherweise für die Schweizer wird am 20. Mai 1515
            {' '}
            <strong>Deine Burg von einer Tsunami-Welle getroffen werden</strong>
            {' '}
            die einen großen Teil der Mauern zerstören wird!
            Klingt unglaublich? Nun, lies weiter!
          </Typography>
          <Typography marginY={3}>
            Am 30. September 1513, im sogenannten
            {' '}
            <a href="https://hls-dhs-dss.ch/de/articles/028662/2004-11-04/">Buzza di Biasca</a>
            ,
            rutschten etwa 500 Millionen Tonnen Fels
            in ein Tal oberhalb von Bellinzona
            und bildeten einen 60 Meter hohen Damm,
            der den Fluss blockierte.
            Im Laufe der Zeit bildete dieser Damm einen See,
            der 5 km lang, 1,2 km breit und 10 bis 12 Meter tief war
            und etwa 200 Millionen Kubikmeter Wasser enthielt.
            Am 20. Mai 1515 brach der Damm,
            was zu einer Welle von Wasser führte, die etwa 10 Meter hoch
            das Tal hinunterkam.
            Sie traf die Befestigungsmauern von Bellinzona mit einer Geschwindigkeit von 40-60 km/h.
            Während ein großer Teil der Befestigung überlebte,
            war diese Tsunami-Welle massiv genug, um große Teile weg zu spülen.
          </Typography>
          <Typography marginY={3}>
            Dieses kataklysmische Ereignis machte in ganz Europa Schlagzeilen.
            Um diese Zeit zeichnete der berühmte
            {' '}
            <strong>Leonardo da Vinci</strong>
            {' '}
            <a href="https://insubricahistorica.ch/blog/2021/09/22/la-buzza-di-biasca-del-1515/">eine Skizze</a>
            ,
            die wahrscheinlich die Zerstörung der Bellinzona-Befestigung darstellt.
          </Typography>
          <Typography marginY={3}>
            Ist es nicht beeindruckend, dass wir über 500 Jahre später
            die genauen Daten dieser Ereignisse kennen,
            und wir die Volumina von Felsrutschen
            und die Höhen und Geschwindigkeiten
            dieser &ldquo;Alpen-Tsunami-Welle&rdquo; berechnen können?
            Geschichte kann faszinierend sein!
          </Typography>

          <Image
            src={MarketingImage}
            alt="Bild der Burg"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3} align="center">
            Falls Du Deine Burg behalten möchtest,
            navigiere zurück zur letzten Aktivität
            und kopiere das Bild oder lade es als Grafikdatei herunter.
            Du kannst sogar den Python-Code herunterladen,
            den Du geschrieben hast,
            um ihn später auf Deinem eigenen Computer auszuführen.
          </Typography>
          <Typography marginY={3} align="center">
            Dein Code wird in Deinem Webbrowser gespeichert.
            Solange Du Zugriff auf Deinen Browser hast,
            und niemand den lokalen Speicher Deines Browsers löscht,
            kannst Du zu dieser Website zurückkehren und Deine Burg modifizieren.
          </Typography>
          <Typography marginY={3} align="center">
            <NextLink href="https://code.org/api/hour/finish" passHref>
              <Button
                variant="contained"
                size="large"
              >
                Schliesse Deine Stunde des Codes ab und erhalte Dein Zertifikat
              </Button>
            </NextLink>
          </Typography>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Lerne mehr über die Python-Programmierung
          </Typography>
          <Typography marginY={3} align="center">
            Du hast gerade eine Stunde des Codes abgeschlossen.
            Diese Website enthält viele weitere Aktivitäten.
            Einige davon werden in Informatikkursen an Schweizer Gymnasien verwendet.
            Alle sind kostenlos und ohne Anmeldung zugänglich!
          </Typography>
          <Typography marginY={3} align="center">
            Falls Du die Python-Programmierung von Grund auf lernen möchtest,
            empfehlen wir Dir, mit unserem
            {' '}
            <Link href="/curricula/luce/welcome" component={NextLink}>
              Willkommens-Curriculum
            </Link>
            {' '}
            (bisher nur auf Englisch vorhanden) zu beginnen.
          </Typography>
          <Typography marginY={3} align="center">
            Falls Du die über 100 Grafikprogrammierungsaktivitäten erkunden möchtest,
            schau Dir die
            {' '}
            <Link href="/activities/luce/" component={NextLink}>
              Aktivitäts-Galerie
            </Link>
            {' '}
            an.
          </Typography>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Lerne mehr über die mittelalterliche Festung Bellinzona
          </Typography>
          <Typography marginY={3} align="center">
            Du kannst auf der offiziellen
            {' '}
            <a href="https://fortezzabellinzona.ch/de/">Festung Bellinzona Webseite</a>
            {' '}
            mehr erfahren.
            Oder wenn Du die Gelegenheit hast, Bellinzona zu besuchen,
            im Schweizer Kanton Tessin,
            südlich der Alpen,
            kannst Du diese mittelalterliche Festung persönlich besuchen.
            Sie ist ein UNESCO-Weltkulturerbe
            und besteht aus drei separaten Burgen!
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}
