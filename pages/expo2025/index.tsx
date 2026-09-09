import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';
import SchoolIcon from '@mui/icons-material/School';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../components/navbar/NavigationBar';
import PyTamaroLogo from '../../public/PyTamaroLogo.png';
import SA23_ColorImage from '../../public/events/2023-SA-Colors.jpg';
import SA23_FoppaImage from '../../public/events/2023-SA-Foppa.jpg';
import SA23_TableImage from '../../public/events/2023-SA-Table.jpg';
import SA23_TableImage2 from '../../public/events/2023-SA-Table2.jpg';
import HOC from '../../public/expo/HOC.png';
import Info1010 from '../../public/expo/Info1010.png';
import Info1010Exhibit from '../../public/expo/Info1010Exhibit.png';
import HeroImage from '../../public/expo/PyTamaro-Expo-2025-Banner.png';
import PyTamaroLogoExplained from '../../public/expo/PyTamaroLogoExplained.png';
import SwissFlagDecomposition from '../../public/expo/SwissFlagDecomposition.png';
import SwissFlagTask from '../../public/expo/SwissFlagTask.png';
import TamaroCardsExample from '../../public/expo/TamaroCardsExample.png';
import WarmingStripes from '../../public/expo/WarmingStripes.png';
import GymInfLogo from '../../public/expo/gyminf_logo.png';
import RotatingSnakes from '../../public/expo/serpenti.png';
import { translationProps } from '../../src/serverSideTranslationProps';

function activityGraphic(
  imageName: string,
  alt: string,
  sm: number,
  background: string,
) {
  const imagePath = `../../expo/${imageName}`;
  return (
    <Grid
      size={{
        xs: 12,
        sm: sm
      }}>
      <Card elevation={0} style={{ background }}>
        <CardMedia>
          <div
            style={{
              margin: '10%',
              position: 'relative',
              width: '80%',
              height: '110px',
              alignContent: 'center',
            }}
          >
            <Image
              key={10}
              src={imagePath}
              alt={alt}
              width={100}
              height={100}
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
          </div>
        </CardMedia>
      </Card>
    </Grid>
  );
}

function personCard(imageName: string, name: string) {
  const imagePath = `../people/${imageName}`;
  return (
    <Grid
      size={{
        xs: 12,
        sm: 3
      }}>
      <Card elevation={0}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '1rem 0 1rem 0',
          }}
        >
          <Avatar src={imagePath} sx={{ width: 140, height: 140 }} />
        </Box>
        <CardHeader
          subheader={name}
          slotProps={{
            title: { align: 'center' },

            subheader: {
              align: 'center',
            }
          }} />
      </Card>
    </Grid>
  );
}

const germanCode = `balken = rechteck(20, 6, weiss)
kreuz = ueberlagere(
  balken,
  drehe(90, balken)
)
grund = rechteck(32, 32, rot)
fahne = ueberlagere(kreuz, grund)
`;
const englishCode = `background = rectangle(20, 6, white)
cross = overlay(
  bar,
  rotate(90, bar)
)
ground = rectangle(32, 32, red)
flag = overlay(cross, ground)
`;
const italianCode = `barra = rettangolo(20, 6, bianco)
croce = sovvraponi(
  barra,
  ruota(90, barra)
)
fondo = rettangolo(32, 32, rosso)
bandiera = sovvraponi(croce, fondo)
`;
const frenchCode = `barre = rectangle(20, 6, blanc)
croix = superpose(
  barre,
  pivote(90, barre)
)
fond = rectangle(32, 32, rouge)
drapeau = superpose(croix, fond)
`;

export default function Expo2025() {
  return (
    <div style={{ backgroundColor: 'white' }}>
      <Head>
        <title>The Visually Swiss Programming Experience</title>
      </Head>
      <Box>
        <NavigationBar />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Image
            src={HeroImage}
            alt='Photo of Alpe Foppa'
            width='2048'
            height='576'
            sizes='100vw'
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </div>

        <Container maxWidth='md' component='main' style={{ marginTop: '5rem' }}>
          <Grid container spacing={5} alignItems='flex-end'>
            {personCard('MatthiasHauswirth.jpg', 'Matthias Hauswirth')}
            {personCard('IgorMoreno.jpg', 'Igor Moreno')}
            {personCard('LucaChiodini.jpg', 'Luca Chiodini')}
            {personCard('JoeyBevilacqua.jpg', 'Joey Bevilacqua')}
          </Grid>
        </Container>

        <Container maxWidth='md'>
          <Typography
            variant='h5'
            gutterBottom
            style={{ marginTop: '3rem', color: '#D2071C' }}
          >
            We are LuCE
          </Typography>
          <Typography paragraph>
            LuCE is a research group at USI, Università della Svizzera italiana,
            in Lugano. LuCE, lead by Prof. Matthias Hauswirth, is based at the
            Software Institute of the Faculty of Informatics. Our goal is to
            prepare our society for the new digital future by designing
            innovative and effective educational experiences. We focus on{' '}
            <b>helping humans learn to reason</b>, informed by the{' '}
            <b>simple, unambiguous languages computer scientists discovered</b>{' '}
            over the last century.
          </Typography>
          <Typography
            variant='h5'
            gutterBottom
            style={{ marginTop: '3rem', color: '#D2071C' }}
          >
            Our Motivation: Programming for Democracy
          </Typography>
          <Typography paragraph>
            Switzerland is successful because of our empowered population. In
            our direct democracy, we Swiss <b>co-create</b> our{' '}
            <b>societal structures</b>. To actively participate in designing our
            future society, our ability to reason about structures of all
            kinds—such as organizations or regulations—is essential. This
            analytical reasoning requires us to <b>recognize patterns</b>, to{' '}
            <b>decompose structures</b> into smaller parts, to{' '}
            <b>identify similarities and differences</b>, and to <b>abstract</b>{' '}
            over differences.
          </Typography>
          <Typography paragraph>
            These are not just essential competencies of citizens in a
            democracy. These also happen to be{' '}
            <b>core competencies in informatics</b>, software engineering, and
            programming. Thus, allowing all citizens to learn about informatics,
            and especially to learn to program, may* have{' '}
            <b>potential benefits for society far beyond</b> the mere technical
            programming skills.
          </Typography>
          <Typography paragraph variant='caption'>
            * Up to now there is little scientific evidence that learning to
            program improves general reasoning abilities. Our research aims at
            studying the effectiveness of programming education. It is our
            long-term goal to better understand potential connections to general
            reasoning abilities.
          </Typography>
          <Typography
            variant='h5'
            gutterBottom
            style={{ marginTop: '3rem', color: '#D2071C' }}
          >
            Our Proposal for Swissnex @ the Swiss Pavilion
          </Typography>
          <Typography paragraph>
            We propose to design and run “
            <b>The Visually Swiss Programming Experience</b>
            ”, a highly interactive <b>in-person learning experience</b>{' '}
            complemented with <b>online activities</b> tailored to the Swiss
            presence at the Expo 2025.
          </Typography>
          <Typography
            variant='h5'
            gutterBottom
            style={{ marginTop: '3rem', color: '#D2071C' }}
          >
            The Visually Swiss Programming Experience
          </Typography>
          <Typography>
            We propose two types of workshops plus complementary activities
            during the “Learning and Playing” Week, July 17–28, 2025:
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Image width='32' alt='PyTamaro Logo' src={PyTamaroLogo} />
              </ListItemAvatar>
              <ListItemText
                primary='Learner’s Workshop'
                secondary='These address a general audience (especially, but not only, late middle school and high school students). The workshops will introduce participants to programming in a visual way, by decomposing graphics related to Switzerland.'
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SchoolIcon fontSize='large' color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='Teacher’s Workshop'
                secondary='This workshop provides conceptual background information, pedagogical information, and a walk-through of materials for teachers who are interested in adopting our ideas and approach in their classroom.'
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ImportantDevicesIcon fontSize='large' color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='Digital Experience'
                secondary='This online learning experience is accessible from anywhere. It consists of a sequence of activities (similar to our existing “Build Your Own Castle” Hour of Code tutorial). It could also be made available via self-service tablets set up in the physical space.'
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TipsAndUpdatesIcon fontSize='large' color='primary' />
              </ListItemIcon>
              <ListItemText
                primary='Interactive Installation'
                secondary='In addition to digital tablets, visitors can experience programming by designing and solving programming challenges using cards on a table.'
              />
            </ListItem>
          </List>
          <Typography paragraph>
            The duration of a workshop could be about 3 hours, but shorter or
            longer options are possible.
          </Typography>
          <Typography paragraph>
            The language of the workshop is English (or a Swiss national
            language). Materials could be provided in Swiss national languages
            and potentially also in Japanese.
          </Typography>
          <Typography
            variant='h5'
            gutterBottom
            style={{ marginTop: '3rem', color: '#D2071C' }}
          >
            Our Approach: Decompose Graphics to Compose Programs
          </Typography>
          <Typography paragraph>
            Our approach is <b>simple</b>: Learners look at everyday graphics
            and analyze their <b>structure</b>. Do we see patterns? Can we
            identify repeated components? What are their similarities and
            differences?
          </Typography>
          <Typography>
            <b>These are questions computer scientists ask</b> when they work
            with <b>abstract</b> phenomena. Our approach makes that abstract
            reasoning <b>concrete and tangible</b>! We can <b>touch</b> the
            graphics, we can <b>cut</b> them into (paper) pieces, and we can
            rearrange and <b>compose</b> the pieces.
          </Typography>
          <Grid
            container
            spacing={1}
            alignItems='center'
            style={{ marginTop: '2rem', marginBottom: '2rem' }}
          >
            {activityGraphic('swiss-flag.svg', 'Swiss Flag', 2, '#C2EBFF')}
            {activityGraphic(
              'mountain-trail-signpost.svg',
              'Swiss Hiking Trail Signpost',
              2,
              '#C2EBFF',
            )}
            {activityGraphic('clock.svg', 'Swiss Railway Clock', 2, '#C2EBFF')}
            {activityGraphic('spielhaus.svg', 'Spielhaus', 2, '#C2EBFF')}
            {activityGraphic(
              'simple-maze.svg',
              'Simple Pacman Maze',
              2,
              '#C2EBFF',
            )}
            {activityGraphic(
              'japanese-flag.svg',
              'Japanese Flag',
              2,
              '#C2EBFF',
            )}
          </Grid>
          <Typography paragraph>
            From a shopping receipt to a railway clock, from a computer game to
            a passenger information display on the train, our world is full of
            graphics. And many of these graphics have a <b>structure</b>. We can{' '}
            <b>decompose</b> them. This decomposition into independent graphics
            components, known as “problem decomposition” in computer science, is
            the starting point of programming in Python with the PyTamaro
            graphics library. The core idea: the structure of a graphic
            corresponds to the structure of the program that can generate that
            graphic. When we look closely at graphics, then we see the
            sequences, selections, and repetitions that form the foundation of
            computation.
          </Typography>
          <Typography
            variant='h6'
            gutterBottom
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            Meaningful Graphics Related to Everyday Life
          </Typography>
          <Typography paragraph>
            Some graphics we use are playful, others have a deeper meaning. Such
            as the{' '}
            <Link
              component={NextLink}
              href='/activities/luce/warming-stripes/en/v1'
            >
              Warming Stripes
            </Link>{' '}
            learners compose from the temperature history of their own place.
          </Typography>
          <Image
            key={10}
            src={WarmingStripes}
            alt='Warming Stripes'
            width='1280'
            height='285'
            sizes='100vw'
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography
            variant='h5'
            style={{ marginTop: '3rem', color: '#D2071C' }}
          >
            PyTamaro – Swiss Through and Through
          </Typography>
          <Grid
            container
            spacing={5}
            alignItems='center'
            style={{ marginTop: '0rem', marginBottom: '2rem' }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <Typography paragraph>
                <Image
                  key={10}
                  src={PyTamaroLogoExplained}
                  alt='PyTamaro Logo explained'
                  width='1280'
                  height='285'
                  sizes='100vw'
                  style={{
                    width: '80%',
                    height: 'auto',
                  }}
                />
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <Typography paragraph>
                <b>Swissness</b> is at the core of our approach. It starts with
                the name and the logo:
              </Typography>
              <Typography paragraph>
                PyTamaro is a homage to our beloved Monte Tamaro in the heart of
                Ticino.
              </Typography>
            </Grid>
          </Grid>
          <Typography
            variant='h6'
            gutterBottom
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            PyTamaro &mdash; Swiss Content
          </Typography>
          <Typography paragraph>
            PyTamaro is about decomposing geometric graphics. Switzerland has
            some iconic graphics that lend themselves to decomposition, such as
            the wonderfully clear <b>Swiss Hiking Trail</b> signage.
          </Typography>
          <Grid
            container
            spacing={1}
            alignItems='center'
            style={{ marginTop: '2rem', marginBottom: '2rem' }}
          >
            {activityGraphic(
              'swiss-hiking-confirmations.svg',
              'Swiss Hiking',
              3,
              '#4CAC23',
            )}
            {activityGraphic(
              'swiss-hiking-direction-pointers.svg',
              'Swiss Hiking',
              3,
              '#4CAC23',
            )}
            {activityGraphic(
              'swiss-hiking-marks.svg',
              'Swiss Hiking',
              3,
              '#4CAC23',
            )}
            {activityGraphic(
              'mountain-trail-signpost.svg',
              'Swiss Hiking Trail Signpost',
              3,
              '#4CAC23',
            )}
          </Grid>
          <Typography
            variant='h6'
            gutterBottom
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            PyTamaro &mdash; Swiss Essence
          </Typography>
          <Typography paragraph>
            Like the Swiss Pavilion, PyTamaro focuses on the essential. Instead
            of overwhelming learners with irrelevant complexity, the approach
            distills the challenge to its <b>most essential core</b>. We focus
            on a very <b>small</b> set of graphical primitives (like ellipses
            and rectangles) and just a few ways to combine them (like placing
            graphics beside and above each other). And like with the
            architecture of the Swiss Pavilion, our focus on the essential can
            bring out <b>beauty and joy</b>.
          </Typography>
          <Typography
            variant='h6'
            gutterBottom
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            PyTamaro &mdash; Swiss Co-Creation, with a Touch of Japanese
          </Typography>
          <Typography>
            PyTamaro is the result of a <b>multi-year co-creation effort</b>.
            Our <b>research team</b> designed the foundations,{' '}
            <b>university students</b> designed prototypical activities, and{' '}
            <b>teachers</b> from schools across Switzerland adopted and designed
            activities and curricula tailored for their classroom.
          </Typography>
          <Grid
            container
            spacing={5}
            alignItems='center'
            style={{ marginTop: '0rem', marginBottom: '2rem' }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <Typography paragraph>
                <Image
                  key={10}
                  src={RotatingSnakes}
                  alt='Rotating Snakes'
                  width='1280'
                  height='285'
                  sizes='100vw'
                  style={{
                    width: '70%',
                    height: 'auto',
                  }}
                />
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <Typography paragraph>
                Teachers can adopt existing activities and develop their own.
                The PyTamaro library, with its simple, compositional approach,
                allows them to focus on the essence, while empowering them to
                develop attractive visual programming exercises.
              </Typography>
              <Typography paragraph>
                Creativity abounds, like in the activities about optical
                illusions developed by a high school teacher in Ticino, Nicola
                Dal Pian, which culminate in an{' '}
                <Link
                  component={NextLink}
                  href='/activities/dalpian/rotating-snakes/it/v1'
                >
                  activity where students compose the “Rotating Snakes” illusion
                </Link>{' '}
                by Professor Akiyoshi Kitaoka, who coincidentally is based in
                the Expo 2025 host city, <b>Osaka</b>.
              </Typography>
            </Grid>
          </Grid>
          <Typography paragraph>
            PyTamaro is not one central resource, but a{' '}
            <b>co-created ecosystem</b> that keeps evolving thanks to a
            community of empowered participants. Just a bit like Switzerland!
          </Typography>
          <Typography
            variant='h6'
            gutterBottom
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            PyTamaro &mdash; Swiss Multilingualism
          </Typography>
          <Typography>
            The language of the PyTamaro library and activities is{' '}
            <b>Deutsch</b>, <b>Italiano</b>, <b>Français</b>, and <b>English</b>
            . And hopefully soon also <b>Rumantsch</b>. And possibly also{' '}
            <b>日本語</b>?
          </Typography>
          <Grid
            container
            spacing={5}
            alignItems='center'
            style={{ marginTop: '0rem', marginBottom: '2rem' }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 5
              }}>
              <Image
                key={10}
                src={SwissFlagTask}
                alt='Swiss Flag Task'
                width='1280'
                height='285'
                sizes='100vw'
                style={{
                  width: '70%',
                  height: 'auto',
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 2
              }}>
              {' '}
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 5
              }}>
              <Image
                key={10}
                src={SwissFlagDecomposition}
                alt='Swiss Flag Decomposition'
                width='1280'
                height='285'
                sizes='100vw'
                style={{
                  width: '70%',
                  height: 'auto',
                }}
              />
            </Grid>
          </Grid>
          <Typography>
            Here is an example: the Swiss flag. <b>One structure</b>, composed
            in <b>four different languages</b>:
          </Typography>
          <Grid
            container
            spacing={5}
            alignItems='center'
            style={{ marginTop: '0rem', marginBottom: '0rem' }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <b>Deutsch</b>
              <Card>
                <Box sx={{ marginLeft: '1rem', fontFamily: 'Monospace' }}>
                  <pre>{germanCode}</pre>
                </Box>
              </Card>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <b>English</b>
              <Card>
                <Box sx={{ marginLeft: '1rem', fontFamily: 'Monospace' }}>
                  <pre>{englishCode}</pre>
                </Box>
              </Card>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={5}
            alignItems='center'
            style={{ marginTop: '0rem', marginBottom: '2rem' }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <b>Italiano</b>
              <Card>
                <Box sx={{ marginLeft: '1rem', fontFamily: 'Monospace' }}>
                  <pre>{italianCode}</pre>
                </Box>
              </Card>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <b>Français</b>
              <Card>
                <Box sx={{ marginLeft: '1rem', fontFamily: 'Monospace' }}>
                  <pre>{frenchCode}</pre>
                </Box>
              </Card>
            </Grid>
          </Grid>
          <Typography paragraph>
            Our unplugged activities include <b>multilingual</b>{' '}
            <Link component={NextLink} href='/tamarocards'>
              TamaroCards
            </Link>
            :
          </Typography>
          <Image
            key={10}
            src={TamaroCardsExample}
            alt='TamaroCards Example'
            width='1280'
            height='285'
            sizes='100vw'
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography paragraph>
            Like multilingual labeling of Swiss products, TamaroCards expose
            students to other languages.
          </Typography>
          <Typography
            variant='h5'
            gutterBottom
            style={{ marginTop: '3rem', color: '#D2071C' }}
          >
            Our Track-Record
          </Typography>
          <Typography paragraph>
            Education is our passion. We have over a decade of experience in
            designing extraordinary computer science learning experiences in
            informal and formal contexts. We have a tendency to embark on
            projects that go beyond what a small university research group
            usually would tackle.
          </Typography>
          <Typography
            variant='h6'
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            Interactive “Pop-Up” Science Center &mdash; Experiencing Informatics
          </Typography>
          <Grid
            container
            spacing={5}
            alignItems='center'
            style={{ marginTop: '0rem', marginBottom: '1rem' }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 7
              }}>
              <Typography paragraph>
                Our track-record goes back over a decade, when we organized and
                co-designed <b>INFO1010</b>, a 4-day “pop-up” science center in
                Lugano, to celebrate the tenth anniversary of the USI Faculty of
                Informatics.
              </Typography>
              <Typography paragraph>
                At 42 interactive stations,{' '}
                <b>co-designed and run by our students</b>, over 1000 visitors
                experienced the different facets of informatics hands-on.
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 5
              }}>
              <Image
                key={10}
                src={Info1010}
                alt='INFO 1010'
                width='1280'
                height='285'
                sizes='100vw'
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </Grid>
          </Grid>
          <Image
            key={10}
            src={Info1010Exhibit}
            alt='INFO 1010 Exhibit'
            width='1280'
            height='285'
            sizes='100vw'
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography
            variant='h6'
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            GymInf &mdash; Training the New High School Informatics Teachers
          </Typography>
          <Typography>
            Over the last five years we collaborated with professors across
            Swiss universities, universities of applied science, and
            universities of teacher education, to prepare existing high school
            informatics teachers for the challenge of teaching the newly
            mandatory informatics course.
          </Typography>
          <Grid
            container
            spacing={5}
            alignItems='center'
            style={{ marginTop: '0rem', marginBottom: '2rem' }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 7
              }}>
              <Typography>
                We were part of the program committee designing the national
                retraining program and we taught courses on{' '}
                <b>Programming Languages</b> and on <b>Informatics Didactics</b>{' '}
                in the German-speaking and Italian-speaking parts of
                Switzerland.
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 5
              }}>
              <Typography paragraph>
                <Image
                  key={10}
                  src={GymInfLogo}
                  alt='GymInf Logo'
                  width='1280'
                  height='285'
                  sizes='100vw'
                  style={{
                    width: '100%',
                    height: 'auto',
                  }}
                />
              </Typography>
            </Grid>
          </Grid>
          <Typography
            variant='h6'
            gutterBottom
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            PyTamaro Summer Academy &mdash; A Community of Practice
          </Typography>
          <Typography paragraph>
            To support the <b>community</b> of teachers, we organize the yearly{' '}
            <Link component={NextLink} href='/summeracademy'>
              PyTamaro Summer Academy
            </Link>{' '}
            at USI in beautiful Ticino. In a week of interactive activities,
            unplugged and on the computer, we explore innovative ways to teach
            informatics.
          </Typography>
          <Grid container spacing={1} alignItems='flex-end'>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <Image
                src={SA23_TableImage}
                alt='Photo of Table'
                width='1261'
                height='831'
                sizes='100vw'
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <Image
                src={SA23_ColorImage}
                alt='Photo of Table'
                width='1261'
                height='831'
                sizes='100vw'
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <Image
                src={SA23_FoppaImage}
                alt='Photo of Table2'
                width='1261'
                height='825'
                sizes='100vw'
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <Image
                src={SA23_TableImage2}
                alt='Photo of Table2'
                width='1261'
                height='825'
                sizes='100vw'
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </Grid>
          </Grid>
          <Typography
            variant='h6'
            gutterBottom
            style={{ marginTop: '2rem', color: '#008CCD' }}
          >
            Hour of Code &mdash; Co-Designed by Students for Teachers World-Wide
          </Typography>
          <Typography paragraph style={{ marginBottom: '2rem' }}>
            To make our ideas available world-wide, we put together a{' '}
            <b>team of students</b> to co-create an{' '}
            <Link href='https://hourofcode.com/usicastle'>
              online programming tutorial
            </Link>{' '}
            (and{' '}
            <Link component={NextLink} href='/hoc/castle/teacher-notes'>
              teacher notes
            </Link>
            ) for the international “Hour of Code”.
          </Typography>
          <Grid container spacing={5} alignItems='flex-end'>
            {personCard('AgneseZamboni.jpg', 'Agnese Zamboni')}
            {personCard('DavideFrova.jpg', 'Davide Frova')}
            {personCard('GiorgiaLillo.jpg', 'Giorgia Lillo')}
            {personCard('JamilaOubenali.jpg', 'Jamila Oubenali')}
          </Grid>
          <Typography paragraph style={{ marginTop: '1rem' }}>
            Inspired by the imposing Fortezza Bellinzona, our team developed a
            one-hour self-guided virtual tutorial where learners can compose
            their own castle using the PyTamaro approach.
          </Typography>
          <Image
            key={10}
            src={HOC}
            alt='Hour of Code: Build your own castle'
            width='1280'
            height='285'
            sizes='100vw'
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography paragraph>
            Teachers world-wide can now find our student-designed “Build Your
            Own Castle” tutorial <b>next to tutorials developed by giants</b>{' '}
            like Disney, Microsoft, NASA, or MIT.
          </Typography>
          <Typography paragraph>
            Since its release in December 2023, over <b>20’000 visitors</b> from
            countries like the US, UK, Canada, and even Japan,{' '}
            <b>have experienced our students’ tutorial</b>.
          </Typography>
          <Typography
            variant='h5'
            gutterBottom
            style={{ marginTop: '3rem', color: '#D2071C' }}
          >
            Our Vision
          </Typography>
          <Typography paragraph>
            With this project want to{' '}
            <b>
              bring the abstract world of computing to life in a fun and
              concrete way
            </b>
            .
          </Typography>
          <Typography paragraph>
            We want to <b>excite visitors about programming</b> and leave them
            with an impression of its key ideas. We want to showcase a Swiss way
            of co-creating educational experiences rooted in local culture and
            languages.
          </Typography>
          <Typography paragraph>
            We want middle and high school teachers to learn about an engaging
            but foundational approach to introducing their students to
            programming, and we would love to{' '}
            <b>grow a community of teachers beyond Switzerland</b>.
          </Typography>
          <Typography paragraph>
            In the long term we would love to form a world-wide community of
            educators who combine learning to program with collaboration across
            languages and cultures and the goal of{' '}
            <b>raising a new generation of empowered citizens</b>.
          </Typography>
        </Container>
        <Container maxWidth='lg'>
          <Typography align='center' marginY={3}>
            For more information contact&nbsp;
            <Link href='mailto:Matthias.Hauswirth@usi.ch'>
              Matthias.Hauswirth@usi.ch
            </Link>
            .
          </Typography>
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps()),
    },
  };
}
