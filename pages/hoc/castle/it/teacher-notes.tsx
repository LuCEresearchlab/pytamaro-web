import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Container,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../../../components/NavigationBar';
import FortezzaBellinzonaHistory from '../../../../public/hoc/castle/FortezzaBellinzonaHistory.png';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';
import MarketingImage from '../../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay.jpg';
import ActivitiesCompetenciesMatrix from '../../../../components/ActivitiesCompetenciesMatrix';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';

function ContributorCard({
  firstName, lastName, contribution, imageName,
} : {
  firstName: string,
  lastName: string,
  contribution: string,
  imageName: string,
}) {
  return (
    <Grid
      item
      xs={12}
      sm={3}
    >
      <Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '1rem 0',
          }}
        >
          <Avatar
            src={`../../../people/${imageName}`}
            sx={{ width: 80, height: 80 }}
          />
        </Box>
        <CardHeader
          title={(
            <>
              {firstName}
              <br />
              {lastName}
            </>
          )}
          subheader={contribution}
          titleTypographyProps={{ align: 'center' }}
          subheaderTypographyProps={{
            align: 'center',
          }}
        />
      </Card>
    </Grid>
  );
}

export default function FinishHocCastlePage({ curriculum }:
{ curriculum : Curriculum }) {
  return (
    <div>
      <Head>
        <title>Ora del Codice: Programma il tuo castello: Appunti per insegnanti</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Ora del Codice con PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Programma il tuo castello
            <br />
            Appunti per insegnanti
          </Typography>
          <Typography marginY={3} variant="h6" align="center" color="textSecondary">
            Desideri far programmare alla tua classe il proprio castello?
            Questo tutorial autoguidato dalla durata di un&apos;ora combina
            programmazione e storia.
            É ideato per studenti di almeno 13 anni, che sono pronti a compiere
            i loro primi passi con un linguaggio di programmazione testuale.
          </Typography>

          <Image
            src={MarketingImage}
            alt="Foto del castello"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            This Hour of Code was Developed by Students!
            Quest&apos;Ora del Codice è stata sviluppata da studenti!
          </Typography>
          <Typography marginY={3}>
            Si! Quest&apos;Ora del Codice è stata sviluppata da studenti
            d&apos;informatica in una piccola Università pubblica Svizzera.
          </Typography>
          <Grid container spacing={5} alignItems="flex-end">
            <ContributorCard firstName="Agnese" lastName="Zamboni" contribution="Lead Developer" imageName="AgneseZamboni.jpg" />
            <ContributorCard firstName="Davide" lastName="Frova" contribution="Developer" imageName="DavideFrova.jpg" />
            <ContributorCard firstName="Giorgia" lastName="Lillo" contribution="Developer" imageName="GiorgiaLillo.jpg" />
            <ContributorCard firstName="Jamila" lastName="Oubenali" contribution="Developer" imageName="JamilaOubenali.jpg" />
          </Grid>

          <Typography marginY={3}>
            I contenuti
            (attività e sequenze, istruzioni, codice iniziale e relative soluzioni
            e tutte le grafiche, che sono state programmate e non disegnate,
            componendo primitivi geometrici utilizzando codice Python/Pytamero),
            sono stati sviluppati da un piccolo gruppo di studenti universitari
            alla Facoltà d&apos;Informatica all&apos;USI,
            l&apos;
            {' '}
            <Link href="https://www.usi.ch/en">Università della Svizzera italiana</Link>
            ,
            nella parte di Svizzera che parla la lingua Italiana.
            Finanziati da un contributo per l&apos;innovazione didattica,
            hanno trascorso un mese nell&apos;estate 2023 visitando la vera
            Fortezza Bellinzona, costruendo i più grandi castelli giocattolo
            esistenti, ricercando altre attività dell&apos;Ora del Codice e
            infine sviluppando quest&apos;attività in Python utilizzando la
            piattaforma PyTamaro Web.
          </Typography>
          <Grid container spacing={5} alignItems="flex-end" justifyContent="center">
            <ContributorCard firstName="Luca" lastName="Chiodini" contribution="Platform" imageName="LucaChiodini.jpg" />
            <ContributorCard firstName="Matthias" lastName="Hauswirth" contribution="Organization" imageName="MatthiasHauswirth.jpg" />
          </Grid>
          <Typography marginY={3}>
            La piattaforma PyTamaro Web
            e la libreria grafica compositiva PyTamaro per Python
            sono state principalmente sviluppate da Luca Chiodini,
            uno studente PhD presso il
            {' '}
            <a href="https://luce.si.usi.ch/">Lugano Computing Education research lab</a>
            {' '}
            presso USI.
            Luca ha insegnato ad insegnanti di scuole superiori in Svizzera
            che insegneranno programmazione Python alle loro classi.
            Ha capito i benefici di una libreria grafica semplice e compositiva,
            quindi ha implementato PyTamaro.
            Per aiutare gli insegnanti ad insegnare, ha sviluppato la piattaforma
            PyTamaro Web.
            Questo consente agli studenti di programmare in Python utilizzando
            PyTamaro direttamente dal browser, in un ambiente simile ad un notebook,
            dove le istruzioni e il codice sono combinati in esercizi interattivi.
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Programmazione
          </Typography>
          <Typography marginY={3}>
            Quest&apos;attività introduce agli studenti uno dei concetti fondamentali della
            programmazione:
            l&apos;idea delle
            {' '}
            <strong>funzioni</strong>
            .
            Le funzioni sono un modo di organizzare il codice in
            pezzi riutilizzabili e indipendenti.
            Una funzione prende alcuni valori e ne produce un altro.
            I valori sono esplicitamente passati a una funzione come argomenti.
            Il risultato viene ritornato dalla funzione come valore di ritorno.
          </Typography>
          <Typography marginY={3}>
            Una funzione
            {' '}
            <strong>pura</strong>
            {' '}
            comunica esclusivamente attraverso i suoi parametri e valore
            ritornato.
            Non legge o scrive nessuno stato al di fuori della funzione,
            e non comunica con il mondo esterno al computer
            (non riceve input e non produce output).
            Le funzioni pure possono essere comprese in isolamento,
            senza comprendere niente altro riguardo al resto del programma.
          </Typography>
          <Typography marginY={3}>
            Questo fornisce una bellissima
            {' '}
            <strong>decomposizione di un problema</strong>
            :
            possiamo decomporre un problema in piú sotto-problemi indipendenti,
            decomponendo questi sotto-problemi in altri sotto-problemi
            indipendenti più piccoli fino a quando non sono piccoli a
            sufficienza da poterli risolvere in maniera diretta.
            Grazie alla loro indipendenza,
            non dobbiamo preoccuparci di altri sotto-problemi mentre ci
            stiamo focalizzando su uno.
          </Typography>
          <Typography marginY={3}>
            Le funzioni pure sono un modo fantastico per risolvere
            sotto-problemi indipendenti.
            Sono anche ideali per comporre soluzioni di molteplici
            sotto-problemi indipendenti in una singola soluzione.
            Oltre a questo vantaggio educativo,
            le funzioni pure rendono i programmi più sicuri,
            in quanto semplificano e distribuiscono la computazione
            in centri dati moderni e supercomputer.
          </Typography>
          <Typography marginY={3}>
            La liberia Python utilizzata in quest&apos;attività, PyTamaro,
            consiste in un piccolo gruppo di queste funzioni pure.
            Alcune di queste funzioni producono una grafica (un pezzo
            di castello) utilizzando informazioni (come il colore) fornite
            come argomenti.
            Altre funzioni compongono più pezzi (passati come argomenti)
            in un castello più grande.
          </Typography>
          <Typography marginY={3}>
            Le funzioni pure in quest&apos;attività possono essere
            concepite come funzioni matematiche.
            L&apos;unica differenza è che le funzioni di PyTamaro
            {' '}
            <strong>utilizzano grafiche interessanti</strong>
            {' '}
            anziché numeri.
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Obbiettivi d&apos;apprendimento nella Programmazione
          </Typography>
          <Typography marginY={3}>
            Ecco le attività e gli obbiettivi d&apos;apprendimento del curriculum
            &apos;
            { curriculum.title }
            &apos;:
          </Typography>
          <ActivitiesCompetenciesMatrix curriculum={curriculum} />
          <Typography marginY={3}>
            Ulteriori dettagli sono disponibili nella
            {' '}
            <Link href="/curricula/luce-hoc/castello/info" component={NextLink}>
              pagina delle informazioni
            </Link>
            .
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Altre Attività Educative Basate sulla Programmazione Utilizzate in Scuole
            Superiori Svizzere
          </Typography>
          <Typography marginY={3}>
            Se desideri scoprire di più sulla programmazione Python utilizzando
            l&apos;approccio grafico di PyTamaro,
            dai uno sguardo alle svariate attività e curricula disponibili
            su questo sito web.
            Sono liberamente disponibili online.
            Molte di queste risorse sono utilizzate per insegnare la programmazione
            in scuole superiori Svizzere.
            Alcune sono state sviluppate da insegnanti di scuole superiori stessi.
            Raccomandiamo di iniziare con il Curriculum di Benvenuto.
          </Typography>
          <Typography marginY={3} align="center">
            <NextLink href="/curricula/luce/welcome" passHref>
              <Button variant="contained">Curriculum di Benvenuto</Button>
            </NextLink>
            {' '}
            <NextLink href="/activities/luce" passHref>
              <Button variant="contained">Galleria delle Attività</Button>
            </NextLink>
          </Typography>
          <Typography marginY={3}>
            Se finissi con l&apos;utilizzare queste attività nelle tue lezioni,
            ci farebbe molto piacere sentire la tua opinione.
            Stiamo sviluppando e mantenendo questo sito web per scopi di
            ricerca su come insegnare la programmazione efficacemente.
            Sentire cosa è andato bene e cosa no, può aiutarci parecchio!
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Storia
          </Typography>
          <Typography marginY={3}>
            Quest&apos;Ora del Codice è ispirata dai castelli medievali che
            formano la Fortezza Bellinzona.
            Anche se la storia del più antico castello, Castelgrande,
            risale all&apos;Impero Romano, la maggior parte delle fortificazioni
            furono costruite nel tardo medioevo, nel Quattordicesimo e nel
            Quindicesimo secolo.
          </Typography>

          <Image
            src={FortezzaBellinzonaHistory}
            alt="Linea temporale storia della Fortezza Bellinzona"
            width="3070"
            height="2125"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            Puoi scoprirne di più sul
            {' '}
            <a href="https://fortezzabellinzona.ch/en/">sito ufficiale della Fortezza Bellinzona</a>
            .
            Oppure, se avessi l&apos;opportunità di visitare il cantone Ticino
            in Svizzera, a sud delle Alpi e a nord delle città italiane di
            Milano e Como, potresti visitare questa fortezza medievale nella
            città di Bellinzona in prima persona.
            La fortezza è un sito patrimonio mondiale dell&apos;UNESCO
            unico in Europa, in quanto consiste di tre castelli separati
            e le loro fortificazioni!
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  const authorSlug = 'luce-hoc';
  const curriculumSlug = 'castello';
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      curriculum,
    },
  };
}
