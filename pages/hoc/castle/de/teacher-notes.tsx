import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../../../components/NavigationBar';
import FortezzaBellinzonaHistory from '../../../../public/hoc/castle/FortezzaBellinzonaHistory.png';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';
import MarketingImage from '../../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay.jpg';
import PureFunctionImage from '../../../../public/hoc/castle/PureFunction.png';
import ProblemSolutionImage from '../../../../public/hoc/castle/ProblemSolution.png';
import CastleListImage from '../../../../public/hoc/castle/CastleList.png';
import BattlementImage from '../../../../public/hoc/castle/Battlement.jpg';
import CurtainWallImage from '../../../../public/hoc/castle/CurtainWall.jpg';
import DrawbridgeImage from '../../../../public/hoc/castle/Drawbridge.jpg';
import MerlonImage from '../../../../public/hoc/castle/Merlon.jpg';
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
            Leitfaden
          </Typography>
          <Typography marginY={3}>
            Dieser Leitfaden enthält Informationen über die Didaktik und den Inhalt
            (Programmierung und Geschichte)
            dieses Stunde des Codes-Tutorials.
            Wenn Sie über dieses einstündige Tutorial hinausgehen möchten,
            sehen Sie sich unsere vielen kostenlosen Ressourcen auf dieser PyTamaro-Website an.
            Viele der Ressourcen werden in Informatikkursen
            an verschiedenen Schweizer Gymnasien verwendet.
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Diese Stunde des Codes wurde von Studentinnen und Studenten entwickelt!
          </Typography>
          <Typography marginY={3}>
            Ja! Diese Stunde des Codes wurde von Informatikstudierenden
            an einer kleinen öffentlichen Universität in der Schweiz entwickelt.
          </Typography>
          <Grid container spacing={5} alignItems="flex-end">
            <ContributorCard firstName="Agnese" lastName="Zamboni" contribution="Lead Developer" imageName="AgneseZamboni.jpg" />
            <ContributorCard firstName="Davide" lastName="Frova" contribution="Developer" imageName="DavideFrova.jpg" />
            <ContributorCard firstName="Giorgia" lastName="Lillo" contribution="Developer" imageName="GiorgiaLillo.jpg" />
            <ContributorCard firstName="Jamila" lastName="Oubenali" contribution="Developer" imageName="JamilaOubenali.jpg" />
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
            <ContributorCard firstName="Luca" lastName="Chiodini" contribution="Platform" imageName="LucaChiodini.jpg" />
            <ContributorCard firstName="Igor" lastName="Moreno" contribution="PL Advice" imageName="IgorMoreno.jpg" />
            <ContributorCard firstName="Joey" lastName="Bevilacqua" contribution="Engineering" imageName="JoeyBevilacqua.jpg" />
            <ContributorCard firstName="Matthias" lastName="Hauswirth" contribution="Organization" imageName="MatthiasHauswirth.jpg" />
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
            Didaktik
          </Typography>
          <Typography marginY={3}>
            Hier sind einige didaktische Tipps, die Ihnen helfen,
            das Beste aus einer Stunde des Codes zu machen:
          </Typography>
          <List sx={{ width: '100%' }}>
            {
              [
                {
                  title: 'Pair Programming',
                  description:
  <>
    Diese Stunde des Codes kann besonders gut mit Pair Programming durchgeführt werden,
    indem zwei Lernende gemeinsam an einem Computer arbeiten.
    Bei der Paarprogrammierung übernehmen die beiden Lernenden eines Paares
    normalerweise unterschiedliche Rollen:
    Der Fahrer sitzt an der Tastatur und schreibt den Code,
    und der Navigator prüft jede eingegebene Codezeile.
    Sie können die Lernenden bitten, die Rollen zwischen den einzelnen Aktivitäten zu wechseln
    (beachten Sie aber, dass die ersten paar Aktivitäten nicht viel Schreibarbeit erfordern).
  </>,
                },
                {
                  title: 'Platformen',
                  description:
  <>
    Wir haben dieses Tutorial mit den Browsern Firefox, Chrome, Safari und Edge
    und auf macOS, Windows, iOS, iPadOS und Android getestet.
    Es kann zwar auch auf Mobiltelefonen verwendet werden,
    wir empfehlen aber Geräte mit größeren Bildschirmen und Tastaturen.
  </>,
                },
                {
                  title: 'Kompetenzen',
                  description:
  <>
    Jede Aktivität ist mit einer oder mehreren Programmierkompetenzen verbunden.
    Jedes Mal, wenn eine Schülerin oder ein Schüler eine Aktivität abschließt,
    werden die gerade geübten Kompetenzen
    als blaue &lsquo;Abzeichen&rsquo; in der linken Seitenleiste angezeigt.
    Ermuntern Sie Ihre Schülerinnen und Schüler,
    auf die Abzeichen zu klicken, um deren Beschreibungen zu lesen.
    Auf diese Weise werden sie mit der Terminologie der Programmierkonzepte vertraut gemacht.
    Unten finden Sie eine Matrix, die Aktivitäten und Kompetenzen aufeinander abstimmt.
  </>,
                },
                {
                  title: 'Fehlvorstellungen',
                  description:
  <>
    Ihre Schülerinnen und Schüler haben möglicherweise bereits
    verschiedene Fehlvorstellungen von Python.
    Als Lehrperson können Sie sich darauf vorbereiten,
    diese Fehlvorstellungen zu erkennen und zu beseitigen,
    indem Sie sich selbst auf
    {' '}
    <a href="https://progmiscon.org/">Progmiscon.org</a>
    , einem aus der Informatikdidaktik-Forschung stammenden Katalog
    von Programmiersprachen-Fehlvorstellungen,
    {' '}
    <a href="https://progmiscon.org/selfCheck?pl=Python">mit einem Self-Check testen</a>
    . Dadurch werden Sie Fehlvorstellungen wie
    {' '}
    <a href="https://progmiscon.org/misconceptions/Python/AssignCompares">AssignCompares</a>
    {' '}
    (Zuweisung als Vergleich interpretieren)
    oder
    {' '}
    <a href="https://progmiscon.org/misconceptions/Python/OutsideInFunctionNesting">OutsideInFunctionNesting</a>
    {' '}
    (von aussen nach innen ausführen von verschachtelten Funktionsaufrufen)
    besser erkennen.
  </>,
                },
                {
                  title: 'Aufgaben',
                  description:
  <>
    Jede Aktivität besteht aus einer oder mehreren kleinen Programmieraufgaben.
    Die Aufgaben sind mit 🎯 gekennzeichnet,
    in der Regel oberhalb der entsprechenden Codezelle,
    und innerhalb des Codes mit Kommentaren.
  </>,
                },
                {
                  title: 'Platzhalter',
                  description:
  <>
    Im Code verwenden wir
    {' '}
    <code>...</code>
    {' '}
    als Platzhalter für den von Lernenden zu schreibenden Code.
    Falls Lernende den Platzhalter nicht ersetzen,
    führt das zu einem Fehler, wenn sie den Code ausführen.
  </>,
                },
                {
                  title: 'Fehler',
                  description:
  <>
    Ein wichtiger Teil des Programmierenlernens
    ist das Verstehen und Beheben von Fehlern.
    Wenn bei der Ausführung des Codes ein Fehler auftritt,
    wird der Fehler unter der entsprechenden Codezelle angezeigt.
    Übliche Fehlerarten sind NameError, SyntaxError, TypeError und ImportError.
    Beachten Sie, dass die Fehlermeldung die Zeilennummer
    (und eine Kopie der Zeile) enthält
    wo der Fehler aufgetreten ist.
    Diese Informationen sind wichtig, um den Fehler zu finden und zu beheben.
  </>,
                },
                {
                  title: 'Stecken geblieben? Code durcheinander?',
                  description:
  <>
    Wenn Lernende bei einer Aufgabe nicht weiterkommen,
    zum Beispiel weil sie Fehler erhalten, die sie nicht beheben können,
    können sie eine Codezelle auf ihren ursprünglichen Inhalt zurücksetzen.
    (mit der Schaltfläche mit den drei senkrechten Punkten
    unten rechts in der Codezelle).
  </>,
                },
                {
                  title: 'TypeError',
                  description:
  <>
    Ein häufiger TypeError (Typ-Fehler) ist, wenn Schüler vergessen,
    ein ... (auf Englisch ellipsis genannt) durch eigenen Code zu ersetzen.
    Dieser Fehler tritt häufig auf,
    wenn zeige_grafik versucht, den Wert anzuzeigen, den es als Argument erhält,
    aber dieser Wert ein ... anstelle einer gültigen Grafik ist.
    Dies führt zu dem folgenden Fehler:
    TypeError: Invalid type for parameter graphic: expected Graphic, got ellipsis
  </>,
                },
                {
                  title: 'NameError',
                  description:
  <>
    Wenn Lernende einen Namen falsch schreiben (z. B. agische_brustwehr statt magische_brustwehr),
    erhalten sie möglicherweise einen NameError (Namensfehler).
    Manchmal verursachen Lernende einen NameError,
    weil sie Text zum Kopieren und Einfügen auswählen,
    aber ihre Auswahl nicht das gesamte Wort umfasst.
    Unserer Erfahrung nach sind NameError für viele Schüler einfacher zu beheben.
  </>,
                },
                {
                  title: 'SyntaxError',
                  description:
  <>
    Wenn Lernende die Struktur des Codes so verändern,
    dass sie die Python-Grammatik verletzt,
    erhalten sie einen SyntaxError.
    Häufige Gründe sind nicht zusammenpassende Klammern, wie ((...) oder ([...),
    oder fehlende Kommas, wie mauer(lila ohne_raender).
  </>,
                },
                {
                  title: 'ImportError',
                  description:
  <>
    Wenn Studierende eine der Import-Anweisungen ändern
    und einen Namen importieren, der nicht existiert,
    erhalten sie einen ImportError.
  </>,
                },
              ].map(({ title, description }) => (
                <ListItem key={title}>
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#00000000' }}>💡</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={title} secondary={description} />
                </ListItem>
              ))
            }
          </List>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Über diese Stunde des Codes Hinaus
          </Typography>
          <Typography marginY={3}>
            Diese Stunde des Codes kann sich gut als Einstieg
            in eine Unterrichtssequenz zur Programmierung mit Python eignen.
            Wenn Sie beabsichtigen, Python in Ihrem Unterricht weiter zu verwenden,
            möchten Sie vielleicht die PyTamaro-Grafikbibliothek nutzen,
            die dieser Stunde des Codes zugrunde liegt.
            Wenn Sie das tun, können Sie gerne die
            {' '}
            <Link href="/tamarocards" component={NextLink}>
              TamaroCards
            </Link>
            {' '}
            auszudrucken, um diese in unplugged Aktivitäten zu verwenden.
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Inhalt: Programmierung
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Komposition einer Burg
          </Typography>
          <Typography marginY={3}>
            Lernende bauen Burgen aus vorgefertigten Teilen zusammen.
            Wir stellen Funktionen zur Verfügung,
            um jedes Teil (Dach, Brustwehr, Mauer und Zugbrücke) zu erstellen.
            Wir stellen auch zwei Funktionen zur Verfügung, um Listen von Teilen zu erstellen,
            indem man sie übereinander (ueber_liste) oder nebeneinander (neben_liste) platziert.
          </Typography>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src={CastleListImage}
              alt="Photo of Castle"
              width="1261"
              height="831"
              sizes="100vw"
              style={{
                width: '60%',
                height: 'auto',
              }}
            />
          </div>

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
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item xs={12}>
              <div style={{ color: '#E50201', display: 'flex', justifyContent: 'center' }}>
                Keine Eingabe, Kein Zustand ausserhalb der Funktion
              </div>
            </Grid>
            <Grid item xs={4}>
              <div style={{ display: 'flex', justifyContent: 'right' }}>
                Argumente
              </div>
            </Grid>
            <Grid item xs={4}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={PureFunctionImage}
                  alt="Diagram of a pure function"
                  width="800"
                  height="588"
                  sizes="100vw"
                  style={{
                    width: '50%',
                    height: 'auto',
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={4}>
              <div style={{ display: 'flex', justifyContent: 'left' }}>
                Rückgabewert
              </div>
            </Grid>
            <Grid item xs={12}>
              <div style={{ color: '#E50201', display: 'flex', justifyContent: 'center' }}>
                Keine Ausgabe, Kein Zustand ausserhalb der Funktion
              </div>
            </Grid>
          </Grid>

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
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src={ProblemSolutionImage}
              alt="Diagram of Problem Decomposition and Solution Composition"
              width="1280"
              height="831"
              sizes="100vw"
              style={{
                width: '50%',
                height: 'auto',
              }}
            />
          </div>
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
            Die Wahrheit hinter unseren vorgefertigten Teilen
          </Typography>
          <Typography marginY={3}>
            Dieses Tutorial bietet Funktionen zum Erstellen von vier verschiedenen Arten
            von vorgefertigten Teilen:
            Mauern, Dächer, Brustwehren und Zugbrücken.
            Wussten Sie schon, dass diese vorgefertigten Teile
            selbst aus kleineren Teilen zusammengesetzt sind?
            Sie bestehen vollständig aus Rechtecken, Dreiecken, Ellipsen und Kreissektoren.
            Jemand (die Bachelor-Studierenden, die diese Stunde des Codes entworfen haben)
            hat diese vier Funktionen für vorgefertigte Teile programmiert,
            so dass sie primitive Grafiken kreieren und
            zu den vorgefertigten Teilen zusammensetzen, die in diesem Tutorial verwendet werden.
            Wenn Sie möchten, können Sie selbst ganz andere Teile erstellen!
            Schauen Sie sich das Welcome-Curriculum auf dieser Website an, um mehr zu erfahren.
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
            Inhalt: Geschichte
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
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Glossar der Burgarchitektur
          </Typography>
          <Typography marginY={3}>
            Hier sind die für unser Tutorial relevanten Begriffe,
            illustriert mit unseren Fotos aus der
            {' '}
            <a href="https://fortezzabellinzona.ch/">Fortezza Bellinzona</a>
            .
          </Typography>
          <Grid
            container
            spacing={2}
          >
            {
              [
                {
                  term: 'Brustwehr',
                  image: BattlementImage,
                  definition: 'Der obere Teil einer Mauer, der zwischen Brusthöhe und Kopfhöhe liegt und eine Reihe von Zinnen und Lücken aufweist.',
                },
                {
                  term: 'Schildmauer',
                  image: CurtainWallImage,
                  definition: 'Die Verteidigungsmauer zwischen zwei Wehrtürmen, die oft mit einer Brustwehr versehen ist.',
                },
                {
                  term: 'Zugbrücke',
                  image: DrawbridgeImage,
                  definition: 'Eine bewegliche Brücke, die normalerweise am Eingang einer Burg steht. Die Burg Montebello in Bellinzona ist mit einer Folge von zwei Zugbrücken geschützt.',
                },
                {
                  term: 'Zinne',
                  image: MerlonImage,
                  definition: 'Fester, aufrechter Teil einer Brustwehr zwischen zwei Lücken. Es gibt viele verschiedene Formen von Zinnen.',
                },
              ].map(({ term, image, definition }) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  key={term}
                >
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardMedia>
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Image
                          src={image}
                          alt={`Photo of ${term}`}
                          sizes="100vw"
                          style={{
                            width: '100%',
                            height: 'auto',
                          }}
                        />
                      </div>
                    </CardMedia>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {term}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {definition}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            }
          </Grid>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Literatur über Burgen
          </Typography>
          <Typography marginY={3}>
            J. E. Kaufmann &amp; H. W. Kaufmann; Robert M. Jurga (Illustrator).
            {' '}
            <a href="https://www.dacapopress.com/titles/j-e-kaufmann/the-medieval-fortress/9780306813580/">The Medieval Fortress: Castles, Forts, And Walled Cities Of The Middle Ages</a>
            . Da Capo Press, 2004. ISBN 978-0-306-81358-0.
          </Typography>
          <Typography marginY={3}>
            David Macaulay.
            {' '}
            <a href="https://www.harpercollins.com/products/castle-david-macaulay">Castle</a>
            . Clarion Books, 2013. ISBN 978-0-544-10226-2.
          </Typography>
          <Typography marginY={3}>
            Horst Wolfgang Böhme, Reinhard Friedrich, Barbara Schock-Werner (Hrsg.)
            {' '}
            <a href="https://books.ub.uni-heidelberg.de/arthistoricum/catalog/book/535">Wörterbuch der Burgen, Schlösser und Festungen</a>
            . Heidelberg: arthistoricum.net-ART-Books, 2020.
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
