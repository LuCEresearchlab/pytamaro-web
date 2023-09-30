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
        <title>Stunde des Codes: Programmiere Deine Burg: Informationen für Lehrpersonen</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Stunde des Codes mit PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Programmiere Deine Burg
            <br />
            Informationen für Lehrpersonen
          </Typography>
          <Typography marginY={3} variant="h6" align="center" color="textSecondary">
            Sie wollen Ihre Klasse ihre eigene Burg programmieren lassen?
            Dieses einstündige Tutorial kombiniert Programmierung und Geschichte.
            Es richtet sich an Schülerinnen und Schüler ab 13 Jahren,
            die bereit sind,
            ihre ersten Schritte in einer textbasierten Programmiersprache zu machen.
          </Typography>

          <Image
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

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Diese Stunde des Codes wurde von Studentinnen und Studenten entwickelt!
          </Typography>
          <Typography marginY={3}>
            Ja! Diese Stunde des Codes wurde von Informatikstudierenden
            an einer kleinen öffentlichen Universität in der Schweiz entwickelt.
          </Typography>
          <Grid container spacing={5} alignItems="flex-end">
            <ContributorCard firstName="Agnese" lastName="Zamboni" contribution="Chefentwicklerin" imageName="AgneseZamboni.jpg" />
            <ContributorCard firstName="Davide" lastName="Frova" contribution="Entwickler" imageName="DavideFrova.jpg" />
            <ContributorCard firstName="Giorgia" lastName="Lillo" contribution="Entwicklerin" imageName="GiorgiaLillo.jpg" />
            <ContributorCard firstName="Jamila" lastName="Oubenali" contribution="Entwicklerin" imageName="JamilaOubenali.jpg" />
          </Grid>

          <Typography marginY={3}>
            Der Inhalt
            (Aktivitäten und Sequenzierung, Anweisungen, Starter- und Lösungscode,
            sowie alle vorgefertigten Grafiken,
            die mit Python/PyTamaro-Code programmiert und nicht gezeichnet wurden)
            wurde von einem kleinen Team
            von Bachelorstudierenden der Fakultät für Informatik an der USI,
            der
            {' '}
            <Link href="https://www.usi.ch/">Università della Svizzera italiana</Link>
            ,
            im italienischsprachigen Teil der Schweiz entwickelt.
            Finanziert durch ein Didaktik-Innovationsstipendium,
            verbrachten sie einen Monat im Sommer 2023
            mit dem Besuch der echten Fortezza Bellinzona,
            dem Bau der größten Spielzeugburgen,
            der Recherche bestehender Hour Of Code-Aktivitäten
            und der Entwicklung dieser Aktivität in Python
            auf der PyTamaro Web-Plattform.
          </Typography>
          <Grid container spacing={5} alignItems="flex-end" justifyContent="center">
            <ContributorCard firstName="Luca" lastName="Chiodini" contribution="Plattform" imageName="LucaChiodini.jpg" />
            <ContributorCard firstName="Matthias" lastName="Hauswirth" contribution="Organisation" imageName="MatthiasHauswirth.jpg" />
          </Grid>
          <Typography marginY={3}>
            Die PyTamaro Web-Plattform
            und die kompositionale PyTamaro-Grafikbibliothek für Python
            wurden hauptsächlich von Luca Chiodini entwickelt,
            einem Doktoranden im
            {' '}
            <a href="https://luce.si.usi.ch/">Lugano Computing Education Research Lab</a>
            {' '}
            an der USI.
            Luca unterrichtete Schweizer Gymnasiallehrer,
            die in Zukunft Python-Programmierung in ihren Klassen unterrichten sollten.
            Er erkannte die Vorteile einer einfachen, kompositionellen Grafikbibliothek
            und implementierte PyTamaro.
            Um Lehrerinnen und Lehrer bei ihrem zukünftigen Unterricht zu unterstützen,
            entwickelte er die PyTamaro Web-Plattform.
            Diese ermöglicht es den Schülerinnen und Schülern,
            Python mit PyTamaro direkt im Browser zu programmieren,
            in einer Notebook-ähnlichen Umgebung,
            in der Anweisungen und Code in interaktiven Übungen verflochten sind.
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Programmierung
          </Typography>
          <Typography marginY={3}>
            Diese Aktivität führt die Schülerinnen und Schüler in eines der grundlegenden Konzepte
            in der Programmierung ein:
            die Idee einer
            {' '}
            <strong>Funktion</strong>
            .
            Funktionen sind eine Möglichkeit,
            Code in wiederverwendbare, unabhängige Teile zu organisieren.
            Eine Funktion nimmt einige Werte entgegen und liefert ein Ergebnis.
            Werte werden der Funktion explizit als Argumente übergeben.
            Das Ergebnis wird von der Funktion als Rückgabewert zurückgegeben.
          </Typography>
          <Typography marginY={3}>
            Eine
            {' '}
            <strong>reine</strong>
            {' '}
            Funktion kommuniziert ausschließlich über ihre Argumente und Rückgabewerte.
            Sie liest oder schreibt keinen Zustand außerhalb der Funktion
            und kommuniziert nicht mit der Welt außerhalb des Computers
            (sie empfängt keine Eingabe und erzeugt keine Ausgabe).
            Reine Funktionen können isoliert verstanden werden,
            ohne etwas über den Rest des Programms zu wissen.
          </Typography>
          <Typography marginY={3}>
            Dies bietet einen schönen Ansatz für die
            {' '}
            <strong>Problemlösung</strong>
            :
            Wir können ein Problem in unabhängige Teilprobleme zerlegen,
            diese Teilprobleme in kleinere unabhängige Teilprobleme zerlegen,
            bis sie klein genug sind, um sie direkt zu lösen.
            Aufgrund ihrer Unabhängigkeit
            müssen wir uns keine Gedanken über andere Teilprobleme machen,
            während wir uns auf eines konzentrieren.
          </Typography>
          <Typography marginY={3}>
            Reine Funktionen sind eine großartige Möglichkeit,
            unabhängige Teilprobleme zu lösen.
            Sie eignen sich auch hervorragend dazu,
            die Lösungen mehrerer unabhängiger Teilprobleme
            zu einer einzigen Lösung zusammenzufügen.
            Neben diesem pädagogischen Vorteil
            machen reine Funktionen Programme auch sicherer
            und vereinfachen verteilte Berechnungen
            in modernen Rechenzentren und Supercomputern.
          </Typography>
          <Typography marginY={3}>
            Die Python-Bibliothek, die in dieser Aktivität für die Grafik verwendet wird,
            PyTamaro, besteht aus einer kleinen Anzahl solcher reinen Funktionen.
            Einige dieser Funktionen erzeugen eine Grafik (ein Burgteil)
            basierend auf einigen Informationen (wie z.B. ihrer Farbe),
            die als Argumente übergeben werden.
            Andere Funktionen komponieren mehrere Teile (als Argumente übergeben)
            zu einer größeren Burg.
          </Typography>
          <Typography marginY={3}>
            Die reinen Funktionen in dieser Aktivität können genauso gesehen werden
            wie Funktionen in der Mathematik.
            Es ist nur so, dass unsere PyTamaro-Funktionen
            {' '}
            <strong>mit attraktiven Grafiken spielen</strong>
            {' '}
            anstatt mit Zahlen.
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Lernziele in der Programmierung
          </Typography>
          <Typography marginY={3}>
            Die folgende Tabelle zeigt die Aktivitäten und die Lernziele des
            &apos;
            { curriculum.title }
            &apos; Curriculums:
          </Typography>
          <ActivitiesCompetenciesMatrix curriculum={curriculum} />
          <Typography marginY={3}>
            Mehr Informationen finden Sie auf der
            {' '}
            <Link href="/curricula/luce-hoc/burg/info" component={NextLink}>
              Informationsseite des Curriculums
            </Link>
            .
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Weitere in Schweizer Gymnasien eingesetzte Programmieraktivitäten
          </Typography>
          <Typography marginY={3}>
            Falls Sie mehr über die Python-Programmierung mit dem grafischen PyTamaro-Ansatz
            erfahren möchten,
            besuchen Sie unsere zahlreichen Aktivitäten und Curricula auf dieser Website.
            Sie sind frei zugänglich.
            Viele von ihnen werden im Programmierunterricht
            in Schweizer Gymnasien verwendet.
            Einige wurden von Gymnasiallehrpersonen selbst entwickelt.
            Wir empfehlen Ihnen, mit dem
            {' '}
            <i>Welcome Curriculum</i>
            {' '}
            (momentan nur auf Englisch verfügbar)
            zu beginnen.
          </Typography>
          <Typography marginY={3} align="center">
            <NextLink href="/curricula/luce/welcome" passHref>
              <Button variant="contained">Welcome Curriculum</Button>
            </NextLink>
            {' '}
            <NextLink href="/activities/luce" passHref>
              <Button variant="contained">Activity Gallery</Button>
            </NextLink>
          </Typography>
          <Typography marginY={3}>
            Sollten Sie die Aktivitäten in Ihrem Unterricht einsetzen,
            würden wir uns sehr freuen, von Ihnen zu hören.
            Wir entwickeln und pflegen diese Website im Rahmen unserer Forschung
            über den effektiven Programmierunterricht.
            Zu erfahren, was funktioniert hat und was nicht,
            kann uns sehr helfen!
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Geschichte
          </Typography>
          <Typography marginY={3}>
            Diese Stunde des Codes wurde von den mittelalterlichen Burgen
            der Fortezza Bellinzona inspiriert.
            Während die Geschichte der ältesten Burg, Castelgrande,
            bis ins Römische Reich zurückreicht,
            wurde der grösste Teil der Befestigung im Spätmittelalter,
            im 14. und 15. Jahrhundert, erbaut.
          </Typography>

          <Image
            src={FortezzaBellinzonaHistory}
            alt="Historische Zeitleiste der Fortezza Bellinzona"
            width="3070"
            height="2125"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            Sie können mehr auf der offiziellen
            {' '}
            <a href="https://fortezzabellinzona.ch/de/">Fortezza Bellinzona Webseite</a>
            {' '}
            erfahren.
            Oder wenn Sie die Chance haben,
            den mediterranen Schweizer Kanton Tessin,
            südlich der Alpen
            und nördlich der italienischen Städte Como und Mailand,
            zu besuchen,
            können Sie diese mittelalterliche Festung
            in der Schweizer Stadt Bellinzona persönlich besuchen.
            Sie ist ein in Europa einzigartiges UNESCO-Weltkulturerbe,
            bestehend aus drei separaten Burgen und ihren Befestigungen!
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  const authorSlug = 'luce-hoc';
  const curriculumSlug = 'burg';
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      curriculum,
    },
  };
}
