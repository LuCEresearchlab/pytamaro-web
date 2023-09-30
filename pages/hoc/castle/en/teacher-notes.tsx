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
        <title>Hour of Code: Program Your Own Castle: Teacher Notes</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Hour of Code ® with PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Program Your Own Castle
            <br />
            Teacher Notes
          </Typography>
          <Typography marginY={3} variant="h6" align="center" color="textSecondary">
            You intend to let your class program their own castle?
            This self-guided one-hour tutorial combines programming and history.
            It is targeted at students aged 13 and older,
            who are ready to make their first steps in a text-based programming language.
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
            This Hour of Code was Developed by Students!
          </Typography>
          <Typography marginY={3}>
            Yes! This Hour of Code was developed by informatics students
            at a small public university in Switzerland.
          </Typography>
          <Grid container spacing={5} alignItems="flex-end">
            <ContributorCard firstName="Agnese" lastName="Zamboni" contribution="Lead Developer" imageName="AgneseZamboni.jpg" />
            <ContributorCard firstName="Davide" lastName="Frova" contribution="Developer" imageName="DavideFrova.jpg" />
            <ContributorCard firstName="Giorgia" lastName="Lillo" contribution="Developer" imageName="GiorgiaLillo.jpg" />
            <ContributorCard firstName="Jamila" lastName="Oubenali" contribution="Developer" imageName="JamilaOubenali.jpg" />
          </Grid>

          <Typography marginY={3}>
            The content
            (activities and sequencing, instructions, starter and solution code,
            and all pre-made graphics,
            which were programmed, not drawn,
            by composing geometric primitives with Python/PyTamaro code)
            was developed by a small team
            of undergraduate students at the Faculty of Informatics at USI,
            the
            {' '}
            <Link href="https://www.usi.ch/en">Università della Svizzera italiana</Link>
            ,
            in the Italian-speaking part of Switzerland.
            Funded by a didactics innovation grant,
            they spent a month in summer 2023
            visiting the real Fortezza Bellinzona,
            building the largest toy castles out there,
            researching existing Hour Of Code activities,
            and then developing this activity in Python
            on top of the PyTamaro Web platform.
          </Typography>
          <Grid container spacing={5} alignItems="flex-end" justifyContent="center">
            <ContributorCard firstName="Luca" lastName="Chiodini" contribution="Platform" imageName="LucaChiodini.jpg" />
            <ContributorCard firstName="Igor" lastName="Moreno" contribution="PL Advice" imageName="IgorMoreno.jpg" />
            <ContributorCard firstName="Joey" lastName="Bevilacqua" contribution="Engineering" imageName="JoeyBevilacqua.jpg" />
            <ContributorCard firstName="Matthias" lastName="Hauswirth" contribution="Organization" imageName="MatthiasHauswirth.jpg" />
          </Grid>
          <Typography marginY={3}>
            The PyTamaro Web platform
            and the compositional PyTamaro graphics library for Python
            were primarily developed by Luca Chiodini,
            a PhD student in the
            {' '}
            <a href="https://luce.si.usi.ch/">Lugano Computing Education research lab</a>
            {' '}
            at USI.
            Luca had been teaching Swiss high school teachers
            who were going to teach Python programming in their future classes.
            He realized the benefits of a simple, compositional graphics library,
            so he implemented PyTamaro.
            To support teachers in their future teaching,
            he developed the PyTamaro Web platform.
            This allows students to program Python using PyTamaro
            directly in the browser, in a notebook-like environment,
            where instructions and code are interleaved in interactive exercises.
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Programming
          </Typography>
          <Typography marginY={3}>
            This activity introduces students to one of the fundamental concepts in programming:
            the idea of a
            {' '}
            <strong>function</strong>
            .
            Functions are a way to organize code into reusable, independent, pieces.
            A function takes some values, and produces a result.
            Values are explicitly passed to a function as arguments.
            The result is returned by the function as a return value.
          </Typography>
          <Typography marginY={3}>
            A
            {' '}
            <strong>pure</strong>
            {' '}
            function communicates exclusively through its arguments and return value.
            It does not read or write any state outside of the function,
            and it does not communicate with the world outside the computer
            (it does not receive input or produce output).
            Pure functions can be understood in isolation,
            without understanding anything about the rest of the program.
          </Typography>
          <Typography marginY={3}>
            This provides a beautiful approach to
            {' '}
            <strong>problem decomposition</strong>
            :
            we can decompose a problem into independent subproblems,
            decompose those subproblems into smaller independent subproblems,
            until they are small enough so we can solve them directly.
            Because of their independence,
            we do not have to worry about other subproblems while focusing on one.
          </Typography>
          <Typography marginY={3}>
            Pure functions are a great way to solve independent subproblems.
            They are also ideal for composing the solutions of multiple independent subproblems
            into a single solution.
            Besides this educational advantage,
            pure functions also make programs more secure,
            and they simplify distributed computation
            in modern data centers and supercomputers.
          </Typography>
          <Typography marginY={3}>
            The Python library used for the graphics in this activity, PyTamaro,
            consists of a small set of such pure functions.
            Some of those functions produce a graphic (a castle piece)
            based on some information (like its color) passed as arguments.
            Other functions compose multiple pieces (passed as arguments)
            into a larger castle.
          </Typography>
          <Typography marginY={3}>
            The pure functions in this activity can be seen in the same way
            as functions in mathematics.
            It&apos;s just that our PyTamaro functions
            {' '}
            <strong>play with attractive graphics</strong>
            {' '}
            instead of numbers.
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Learning Objectives in Programming
          </Typography>
          <Typography marginY={3}>
            Here are the activities and the learning objectives of the
            &apos;
            { curriculum.title }
            &apos; curriculum:
          </Typography>
          <ActivitiesCompetenciesMatrix curriculum={curriculum} />
          <Typography marginY={3}>
            More information is available on the curriculum&apos;s
            {' '}
            <Link href="/curricula/luce-hoc/castle/info" component={NextLink}>
              information page
            </Link>
            .
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            More Educational Programming Activities Used in Swiss High Schools
          </Typography>
          <Typography marginY={3}>
            If you would like to learn more about
            Python programming using the graphical PyTamaro approach,
            have a look at the many activities and curricula on this web site.
            They are freely available online.
            Many of them are in use for teaching programming in Swiss high schools.
            Some were developed by high school teachers themselves.
            We recommend you start with the Welcome Curriculum.
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
            Should you end up using the activities in your classroom,
            we would be very happy to hear from you.
            We are developing and maintaining this web site as part of our research
            on how to effectively teach programming.
            Hearing what worked, and what did not work, can help us a great deal!
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            History
          </Typography>
          <Typography marginY={3}>
            This Hour of Code was inspired by the medieval castles
            that form the Fortezza Bellinzona.
            While the story of the oldest castle, Castelgrande,
            goes back to the Roman Empire,
            most of the fortification was built in the Late Middle Ages,
            in the fourteenth and fifteenth centuries.
          </Typography>

          <Image
            src={FortezzaBellinzonaHistory}
            alt="Historical Timelne of Fortezza Bellinzona"
            width="3070"
            height="2125"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            You can learn more on the official
            {' '}
            <a href="https://fortezzabellinzona.ch/en/">Fortezza Bellinzona web site</a>
            .
            Or if you have a chance to visit the mediterranean Swiss canton of Ticino,
            just south of the Alps,
            and north of the Italian cities of Como and Milan,
            you could visit this medieval fortress in
            the Swiss city of Bellinzona in person.
            It is a UNESCO World Heritage Site
            that is unique in Europe,
            consisting of three separate castles and their fortifications!
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  const authorSlug = 'luce-hoc';
  const curriculumSlug = 'castle';
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      curriculum,
    },
  };
}
