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
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';
import NavigationBar from '../../../../components/NavigationBar';
import DarkCastleImage from '../../../../public/hoc/castle/DarkCastle.jpg';

export default function FinishHocCastlePage() {
  return (
    <div>
      <Head>
        <title>Ora del Codice: Programma il tuo castello: Completato!</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Ora del Codice ® con PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Missione (Quasi) Completata!
          </Typography>
          <Typography marginY={3} variant="h6" color="textSecondary">
            Il tuo castello dovrebbe aiutare i Milanesi a tenere il possesso
            di Bellinzona fino alla fine del secolo.
          </Typography>
          <Typography marginY={3}>
            Nonostante la tua grandiosa costruzione, i Francesi conquisteranno
            la città e la sua fortificazione e infine la cederanno agli Svizzeri
            nel 1503.
          </Typography>

          <Typography marginY={3}>
            Sfortunatamente per gli Svizzeri, il 20 Maggio 1515
            {' '}
            <strong>il tuo castello verrà travolto da uno tsunami</strong>
            {' '}
            che distruggerà una buona parte delle mura!
            Sembra incredibile? Continua a leggere!
          </Typography>
          <Typography marginY={3}>
            Il 30 Settembre 1513, nella cosiddetta
            {' '}
            <a href="https://hls-dhs-dss.ch/it/articles/028662/2004-11-04/">Buzza di Biasca</a>
            ,
            una frana di circa 500 milioni di tonnellate creò una diga
            alta 60 metri che bloccava il fiume in una valle sopra Bellinzona.
            Nel corso del tempo, questa diga ha formato un lago lungo 5km,
            largo 1.2km, e profondo tra i 10 e 12 metri. Il lago conteneva
            200 milioni di metri cubi d&apos;acqua.
            Il 20 Maggio 1515 la diga si ruppe, facendo cadere verso valle
            un&apos;onda d&apos;acqua alta 10 metri.
            L&apos;onda colpì la fortificazione di Bellinzona ad una velocità
            di 40-60 km/h.
            Anche se buona parte della fortificazione è sopravvissuta,
            quest&apos;onda fu grande abbastanza da spazzarne via grossi pezzi.
          </Typography>
          <Typography marginY={3}>
            Questo evento cataclismico fece scalpore in tutta Europa.
            In quei tempi, il famoso
            {' '}
            <strong>Leonardo da Vinci</strong>
            {' '}
            disegnò
            {' '}
            <a href="https://insubricahistorica.ch/blog/2021/09/22/la-buzza-di-biasca-del-1515/">uno schizzo</a>
            {' '}
            che molto probabilmente rappresenta la distruzione della fortezza
            di Bellinzona.
          </Typography>
          <Typography marginY={3}>
            Non è forse sorprendente come&mdash;oltre 500 anni dopo&mdash;sappiamo
            le date esatte di questi eventi, e possiamo dire con
            precisione il volume delle frane e l&apos;altezza e la velocità
            di questo &ldquo;tsunami Alpino&rdquo;?
            La storia può essere affascinante!
          </Typography>

          <Image
            src={DarkCastleImage}
            alt="Foto del Castello"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3} align="center">
            Se vuoi tenere il tuo castello, naviga indietro all&apos;ultima
            attività e copia e incolla la grafica o scaricala come immagine.
            Puoi anche scaricare il codice Python che hai scritto ed eseguirlo
            nuovamente sul tuo computer piú tardi.
          </Typography>
          <Typography marginY={3} align="center">
            Il tuo codice è salvato nel tuo browser, quindi
            fintanto che hai accesso al tuo browser e nessuno elimina
            la memoria locale del browser, puoi ritornare su questo sito
            e modificare il tuo castello.
          </Typography>
          <Typography marginY={3} align="center">
            <NextLink href="https://code.org/api/hour/finish" passHref>
              <Button
                variant="contained"
                size="large"
              >
                Completa l&apos;Ora del Codice e ottieni il tuo Certificato
              </Button>
            </NextLink>
          </Typography>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Scopri di più sulla Programmazione Python
          </Typography>
          <Typography marginY={3} align="center">
            Hai appena completato un&apos;Ora del Codice.
            Questo sito include molte attività.
            Alcune di queste sono utilizzate in corsi d&apos;informatica
            nelle scuole superiori Svizzere.
            Sono tutte disponibili liberamente senza necessità di creare un
            account!
          </Typography>
          <Typography marginY={3} align="center">
            Se vuoi imparare Python da zero,
            ti consigliamo di iniziare con il nostro
            {' '}
            <Link href="/curricula/luce/welcome" component={NextLink}>
              Curriculum di Benvenuto
            </Link>
            .
          </Typography>
          <Typography marginY={3} align="center">
            Se vuoi esplorare oltre 100 attività di programmazione di grafiche,
            dai un&apos;occhiata alla
            {' '}
            <Link href="/activities/luce/" component={NextLink}>
              Galleria delle Attività
            </Link>
            .
          </Typography>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Scopri di più sulla Fortezza Bellinzona medievale
          </Typography>
          <Typography marginY={3} align="center">
            Puoi scoprire di più sul
            {' '}
            <a href="https://fortezzabellinzona.ch/en/">sito web della Fortezza Bellinzona</a>
            .
            Oppure, se hai l&apos;opportunità di visitare Bellinzona nel
            cantone Ticino in Svizzera appena a sud delle Alpi, potrai visitare
            questa fortezza medievale in prima persona.
            È un sito patrimonio mondiale dell&apos;UNESCO ed è costituita
            da tre castelli separati!
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}
