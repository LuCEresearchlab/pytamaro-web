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
            Guidance
          </Typography>
          <Typography marginY={3}>
            These teacher notes provide information on the
            pedagogy and content (programming and history)
            of this Hour of Code tutorial.
            If you would like to go beyond this one-hour tutorial,
            check out our many free resources on this PyTamaro web site.
            Many of the resources are used
            in computer science courses in Swiss high schools.
          </Typography>

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
            Pedagogy
          </Typography>
          <Typography marginY={3}>
            Here are a few pedagogical tips to help you make the most of an Hour of Code:
          </Typography>
          <List sx={{ width: '100%' }}>
            {
              [
                {
                  title: 'Pair Programming',
                  description:
  <>
    This Hour of Code can work particularly well in a pair-programming setting,
    where two students work together at one computer.
    In pair programming, the two students in a pair usually take on different roles:
    the driver is at the keyboard writing code,
    and the navigator is reviewing each line of code as it is typed in.
    You may ask students to switch roles between each activity
    (but note that the first few activities do not require much writing).
  </>,
                },
                {
                  title: 'Platforms',
                  description:
  <>
    We tested this tutorial on the Firefox, Chrome, Safari, and Edge browsers
    and on macOS, Windows, iOS, iPadOS, and Android.
    While it can be used on mobile phones,
    we recommend devices with larger screens and keyboards.
  </>,
                },
                {
                  title: 'Competencies',
                  description:
  <>
    Each activity is associated with one or more programming competencies.
    Whenever a student completes an activity,
    the competencies they just practiced
    are added as blue &lsquo;badges&rsquo; to the left sidebar.
    Encourage your students to click on the badges to read their descriptions.
    This introduces them to the terminology of programming concepts.
    You can find a matrix aligning activities and competencies below.
  </>,
                },
                {
                  title: 'Misconceptions',
                  description:
  <>
    Your students may have various misconceptions about Python.
    To prepare yourself to recognize and address those misconceptions,
    {' '}
    <a href="https://progmiscon.org/selfCheck?pl=Python">perform a self-check</a>
    {' '}
    on
    {' '}
    <a href="https://progmiscon.org/">Progmiscon.org</a>
    , a research-based inventory of programming language misconceptions.
    This prepares you to recognize misconceptions like
    {' '}
    <a href="https://progmiscon.org/misconceptions/Python/AssignCompares">AssignCompares</a>
    {' '}
    or
    {' '}
    <a href="https://progmiscon.org/misconceptions/Python/OutsideInFunctionNesting">OutsideInFunctionNesting</a>
    .
  </>,
                },
                {
                  title: 'Tasks',
                  description:
  <>
    Each activity is involves one or more small programming tasks.
    Tasks are indicated with 🎯, usually above the corresponding code cell,
    and inside the code with comments.
  </>,
                },
                {
                  title: 'Placeholders',
                  description:
  <>
    In the code, we use
    {' '}
    <code>...</code>
    {' '}
    as a placeholder for students to fill in.
    Students are supposed to replace the placeholder with the required code.
    If they do not replace a placeholder, this will lead to an error when they run the code.
  </>,
                },
                {
                  title: 'Errors',
                  description:
  <>
    A major part of learning to program is learning to understand and fix errors.
    If an error happens when running the code, the error is shown below the corresponding code cell.
    Common kinds of errors are NameError, SyntaxError, TypeError, and ImportError.
    Note that the error message includes the line number (and a copy of the line)
    where the error happened.
    This information is essential for finding and fixing the mistake.
  </>,
                },
                {
                  title: 'Stuck? Code Messed Up?',
                  description:
  <>
    If a student is stuck in an activity,
    for example because they receive errors that they cannot figure out how to fix,
    they can reset a code cell (three-vertical-dot button at its bottom right)
    to its original contents.
  </>,
                },
                {
                  title: 'TypeError',
                  description:
  <>
    A common TypeError is if students forget to replace
    a ... (also known as an ellipsis) with their own code.
    Often that error happens when show_graphic tries to show the value it receives as an argument,
    but that value is a ... instead of a valid Graphic.
    This leads to the following error:
    TypeError: Invalid type for parameter graphic: expected Graphic, got ellipsis
  </>,
                },
                {
                  title: 'NameError',
                  description:
  <>
    If students misspell a name (e.g., they write agical_battlement instead of magical_battlement),
    they may receive a NameError.
    Sometimes students introduce NameErrors because they select text to copy and paste,
    but their selection does not include the entire word.
    In our experience, NameErrors are easier to fix for many students.
  </>,
                },
                {
                  title: 'SyntaxError',
                  description:
  <>
    If students modify the structure of the code so it violates the Python grammar,
    they get a SyntaxError.
    Common reasons are unmatched parentheses, such as ((...) or ([...),
    or missing commans, such as wall(purple no_borders).
  </>,
                },
                {
                  title: 'ImportError',
                  description:
  <>
    If students modify one of the import statements
    and they end up importing a name that does not exist,
    they will get an ImportError.
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
            Beyond this Hour of Code
          </Typography>
          <Typography marginY={3}>
            This Hour of Code can be a great introduction
            for a sequence of lessons in Python programming.
            If you intend to continue with Python in your classroom,
            you may want to use the PyTamaro graphics library
            that underlies this Hour of Code.
            If you do, then consider printing out some
            {' '}
            <Link href="/tamarocards" component={NextLink}>
              TamaroCards
            </Link>
            {' '}
            to use in unplugged activities.
          </Typography>

          <Typography marginTop={5} variant="h4" align="center" color="textSecondary" paragraph>
            Content: Programming
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Composition of a Castle
          </Typography>
          <Typography marginY={3}>
            Learners compose castles from prefabricated pieces.
            We provide a function to create each piece (roof, battlement, wall, and drawbridge).
            We also provide two functions to compose lists of pieces,
            by placing them above each other (above_list) or beside each other (beside_list).
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
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item xs={12}>
              <div style={{ color: '#E50201', display: 'flex', justifyContent: 'center' }}>
                No Input, No Outside State
              </div>
            </Grid>
            <Grid item xs={4}>
              <div style={{ display: 'flex', justifyContent: 'right' }}>
                Arguments
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
                Return Value
              </div>
            </Grid>
            <Grid item xs={12}>
              <div style={{ color: '#E50201', display: 'flex', justifyContent: 'center' }}>
                No Output, No Outside State
              </div>
            </Grid>
          </Grid>
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
            <strong>play with graphics</strong>
            {' '}
            instead of numbers.
          </Typography>
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            The Truth Behind Our Prefabricated Pieces
          </Typography>
          <Typography marginY={3}>
            This tutorial provides functions to create four different kinds of prefabricated pieces:
            walls, roofs, battlements, and drawbridges.
            Did you realize that these prefabricated pieces
            are themselves composed of smaller parts?
            They are entirely composed of rectangles, triangles, ellipses, and circular sectors.
            Someone (the Bachelor students designing this Hour of Code)
            programmed those four prefabricated piece functions,
            so that they compose primitive graphics
            into the prefabricated pieces used in this tutorial.
            If you would like, you can create completely different pieces yourself!
            Check out the Welcome Curriculum on this web site to learn more.
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
            Content: History
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
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Glossary of Castle Architecture
          </Typography>
          <Typography marginY={3}>
            Here are the terms relevant for our tutorial
            with photos we took at the three castles of the
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
                  term: 'Battlement',
                  image: BattlementImage,
                  definition: 'The top part of a wall, between chest-height and head-height, holding a sequence of merlons and crenels (gaps).',
                },
                {
                  term: 'Curtain Wall',
                  image: CurtainWallImage,
                  definition: 'The defensive wall between two fortified towers, often topped with a battlement.',
                },
                {
                  term: 'Drawbridge',
                  image: DrawbridgeImage,
                  definition: 'A movable bridge usually at the entrance of a castle. The Montebello castle in Bellinzona is protected with a sequence of two drawdriges.',
                },
                {
                  term: 'Merlon',
                  image: MerlonImage,
                  definition: 'Solid upright part of a battlement between two crenels (gaps). There are many different shapes of merlons.',
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
            Literature on Castles
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
  const curriculumSlug = 'castle';
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      curriculum,
    },
  };
}
