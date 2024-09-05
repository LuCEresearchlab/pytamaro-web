import ArticleIcon from '@mui/icons-material/Article';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
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
import PyTamaroAPI from '../../components/documentation/PyTamaroAPI';
import NavigationBar from '../../components/NavigationBar';
import SA23_TableImage from '../../public/SA-2023-Table.jpg';
import SA23_TableImage2 from '../../public/SA-2023-Table2.jpg';
import SA23_TableImage3 from '../../public/SA-2023-Table3.jpg';
import TamaroCardSheetsPyTamaroFunctionsCommon from '../../public/tamarocards/v2/CardSheet/Common@0.25x.png';
import TamaroCardSheetsPyTamaroConstants from '../../public/tamarocards/v2/CardSheet/Constants@0.25x.png';
import TamaroCardSheetsPyTamaroFunctions from '../../public/tamarocards/v2/CardSheet/Functions@0.25x.png';
import TamaroCardSheetsNames from '../../public/tamarocards/v2/CardSheet/Names@0.25x.png';
import TamaroCardSheetsPythonFunctions from '../../public/tamarocards/v2/CardSheet/PythonFunctions@0.25x.png';
import TamaroCardSheetsPythonOperators from '../../public/tamarocards/v2/CardSheet/PythonOperators@0.25x.png';
import DocLanguagePythonOperators from '../../public/tamarocards/v2/Doc/Language-Python-Operators@0.25x.png';
import DocLibraryPyTamaroColors from '../../public/tamarocards/v2/Doc/Library-PyTamaro-Colors@0.25x.png';
import DocLibraryPyTamaroCombinators from '../../public/tamarocards/v2/Doc/Library-PyTamaro-Combinators@0.25x.png';
import DocLibraryPyTamaroOutput from '../../public/tamarocards/v2/Doc/Library-PyTamaro-Output@0.25x.png';
import DocLibraryPyTamaroPinning from '../../public/tamarocards/v2/Doc/Library-PyTamaro-Pinning@0.25x.png';
import DocLibraryPyTamaroPrimitives from '../../public/tamarocards/v2/Doc/Library-PyTamaro-Primitives@0.25x.png';
import DocLibraryPythonFunctions from '../../public/tamarocards/v2/Doc/Library-Python-Functions@0.25x.png';
import ExampleCardsImage from '../../public/tamarocards/v2/ExampleCards@0.5x.png';
import UnparseImage from '../../public/tamarocards/v2/unparse.gif';
import { translationProps } from '../../src/serverSideTranslationProps';
import { tamaroCardsPageActivityVariant } from '../../src/specialActivities';

function API({ name } : { name: string }) {
  return <PyTamaroAPI name={name} activityVariant={tamaroCardsPageActivityVariant} />;
}

export default function TamaroCardsPage() {
  const api = [
    {
      name: 'Colors',
      desc: 'Color constants, functions for RGB and HSV color spaces',
      img: DocLibraryPyTamaroColors,
    },
    {
      name: 'Primitives',
      desc: 'Functions to create primitive graphics',
      img: DocLibraryPyTamaroPrimitives,
    },
    {
      name: 'Combinators',
      desc: 'Functions to compose graphics',
      img: DocLibraryPyTamaroCombinators,
    },
    {
      name: 'Pinning',
      desc: 'Functions for general composition using pinning',
      img: DocLibraryPyTamaroPinning,
    },
    {
      name: 'Python Functions',
      desc: 'Common Python Functions',
      img: DocLibraryPythonFunctions,
    },
    {
      name: 'Python Operators',
      desc: 'Common Python Operators',
      img: DocLanguagePythonOperators,
    },
    {
      name: 'Output',
      desc: 'Function to show a graphic (output)',
      img: DocLibraryPyTamaroOutput,
    },
  ];

  const sheets = [
    {
      name: 'Constants',
      desc: 'Constant cards (blue), and empty white cards for primitive literals',
      img: TamaroCardSheetsPyTamaroConstants,
    },
    {
      name: 'Functions',
      desc: 'All PyTamaro function cards (red)',
      img: TamaroCardSheetsPyTamaroFunctions,
    },
    {
      name: 'Common',
      desc: 'Common PyTamaro function cards (red)',
      img: TamaroCardSheetsPyTamaroFunctionsCommon,
    },
    {
      name: 'Names',
      desc: 'Cards for definition and use of own constants and functions',
      img: TamaroCardSheetsNames,
    },
    {
      name: 'PythonOperators',
      desc: 'Cards for common Python operators (green)',
      img: TamaroCardSheetsPythonOperators,
    },
    {
      name: 'PythonFunctions',
      desc: 'Cards cards for common Python functions (red)',
      img: TamaroCardSheetsPythonFunctions,
    },
  ];

  return (
    <div>
      <Head>
        <title>TamaroCards (Version 2)</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography variant="h3" marginY={3}>
            TamaroCards - A Tangible Way to Compose Programs
          </Typography>
          <Typography variant="h4" marginY={3}>
            Version 2, September 2024
          </Typography>

          <Typography marginY={3}>
            PyTamaro is often used to teach complete novices.
            For them, writing Python code on a computer can be challenging.
            To support novices in reasoning about a graphic and its composition,
            we developed TamaroCards.
            Each Python function, constant, or operator is represented by a card.
            The cards can be arranged on a table to compose a Python expression
            that corresponds to a graphic.
          </Typography>

          <Image
            src={SA23_TableImage}
            alt="Photo of Table"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '33%',
              height: 'auto',
            }}
          />
          <Image
            src={SA23_TableImage3}
            alt="Photo of Table"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '33%',
              height: 'auto',
            }}
          />
          <Image
            src={SA23_TableImage2}
            alt="Photo of Table"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '33%',
              height: 'auto',
            }}
          />

          <Typography variant="h5" marginY={3}>
            TamaroCards
          </Typography>

          <Typography>
            Literals are white empty pieces of paper,
            constants are blue rectangles,
            functions are red rounded rectangles, and
            operators are green circles.
          </Typography>

          <Image
            src={ExampleCardsImage}
            alt="Example Cards"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            <strong>Function cards</strong>
            {' '}
            are the most important.
            They are needed to produce or compose graphics.
            Functions have parameters (arrows on the left),
            and we need to provide an argument for each parameter.
            We use cards to specify the arguments.
            Some arguments can simply be given literally,
            using an empty white
            {' '}
            <strong>Literal card</strong>
            {' '}
            onto which
            students write the corresponding literal value
            (such as 250, or &quot;ciao&quot;).
            For other arguments we want to use constants,
            such as the predefined constants for the base colors
            (e.g.,
            {' '}
            <API name="red" />
            )
            We provide
            {' '}
            <strong>Constant cards</strong>
            {' '}
            for those.
            More advanced TamaroCard expressions may involve operators
            (like +, -, *, and /).
            We provide
            {' '}
            <strong>Operator cards</strong>
            {' '}
            for Python&apos;s most important unary, binary, and ternary operators.
          </Typography>

          <Typography variant="h5" marginY={3}>
            Composing Cards into Expressions
          </Typography>
          <Typography marginY={1}>
            To express a computation,
            students connect together individual cards into an expression.
          </Typography>

          <Typography variant="h5" marginY={3}>
            Evaluating Expressions
          </Typography>
          <Typography marginY={1}>
            Expressions are tree structures composed of cards.
            The evaluation of the expression flows from left to right.
            Each constant, function, and operator emits a value on its right.
            Function arguments enter functions from the left,
            and, similarly, operands enter operators from the left.
            Students can place cards near each other,
            and they can draw lines with pencil to connect the cards.
            We recommend putting large sheets of paper on the table,
            so students can easily draw between cards.
          </Typography>
          <Typography marginY={1}>
            When composing or interpreting an expression,
            students can annotate the visual expression with the values emitted by the cards.
            Values of built-in types (int, float, str, bool) are written as normal Python literals.
            Values of PyTamaro types (Graphic, Color, Point) are drawn graphically;
            graphics can even be cut out from colored sheets of paper.
          </Typography>

          <Typography variant="h5" marginY={3}>
            Translating Cards to Python Code
          </Typography>
          <Typography marginY={1}>
            Once students understand the meaning of cards and their compositions,
            it makes sense to transition from TamaroCards to Python source code.
          </Typography>
          <Image
            src={UnparseImage}
            alt="Translating Cards to Python Code"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography>
            Like for evaluation, also for translation we can use a systematic approach:
            a depth-first traversal of the tree.
            We draw a line (let&apos;s call it a &quot;street&quot;)
            through the tree to make the traversal explicit.
            We starting at the root of the tree (the rightmost card).
            Whenever we visit a function card for the first time,
            we write down the function&apos;s name followed by an opening parenthesis.
            Between each of a card&apos;s arguments, we write down a comma.
            And when we visit the card the last time, we write down a closing parenthesis.

          </Typography>

          <Typography variant="h4" marginY={3}>
            Printable Documentation Pages
          </Typography>
          <Typography marginY={1}>
            When using the TamaroCards,
            we provide each student (or student team)
            with the &quot;documentation&quot; in the form of a few printed pages.
          </Typography>
          <Typography>
            Each documentation page shows a specific set of cards.
            These pages correspond to the library and language
            {' '}
            <b>documentation</b>
            : they explain what each function, constant, or operator does.
            The explanations are provided in a visual form:
            showing example arguments and return values of functions,
            example operands and results of operators,
            and the specific values of constants.
            This documentation should be sufficient to remember how to use the cards.
          </Typography>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '1rem 0',
            }}
          />
          <Grid container spacing={5} alignItems="flex-end">
            {
              api.map(({ name, desc, img }) => (
                <Grid
                  key={name}
                  item
                  xs={12}
                  sm={6}
                >
                  <Card key={name}>
                    <CardActionArea LinkComponent={NextLink} href={`tamarocards/v1/api/PyTamaro-Cards-API-${name}.pdf`}>
                      <CardMedia>
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <Image
                            src={img}
                            alt={`Doc: ${name}`}
                            sizes="100vw"
                            style={{
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        </div>
                      </CardMedia>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            }
          </Grid>
          <Typography marginY={3}>
            Students use the documentation pages as a reference
            when they try to understand the meaning of a specific card.
            Using these pages is training students to use reference documentation.
            We often initially distribute the
            {' '}
            <strong>Primitives</strong>
            {' '}
            and
            {' '}
            <strong>Colors</strong>
            {' '}
            pages,
            then the
            {' '}
            <strong>Combinators</strong>
            {' '}
            page,
            and later provide more pages as needed.
          </Typography>

          <Typography variant="h4" marginY={3}>
            Printable Card Sheets
          </Typography>

          <Typography marginY={1}>
            The six sheets contain cards arranged in a way
            so they can be printed and easily cut out.
            The sheets contain more copies of more commonly needed cards.
          </Typography>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '1rem 0',
            }}
          />
          <Grid container spacing={5} alignItems="flex-end">
            {
              sheets.map(({ name, desc, img }) => (
                <Grid
                  key={name}
                  item
                  xs={12}
                  sm={6}
                >
                  <Card key={name}>
                    <CardActionArea LinkComponent={NextLink} href={`tamarocards/v2/CardSheet/${name}.pdf`}>
                      <CardMedia>
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <Image
                            src={img}
                            alt={`API: ${name}`}
                            sizes="100vw"
                            style={{
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        </div>
                      </CardMedia>
                      <CardHeader
                        title={name}
                        subheader={desc}
                        titleTypographyProps={{ align: 'center' }}
                        subheaderTypographyProps={{
                          align: 'center',
                        }}
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            }
          </Grid>
          <Typography marginY={3}>
            Note that the individual cards, unlike the documentation,
            do not contain any annotations on parameters, return values, or constant values.
            This is akin to code:
            when you call a function, you just write its name,
            and you provide arguments,
            but you don&apos;t write the names of the parameters.
          </Typography>

          <Typography variant="h4" marginY={3}>
            Individual Cards
          </Typography>
          <Typography>
            We recommend printing the above sheets and cutting out the cards.
            However, if needed, one can download the ZIP file
            which contains an individual PDF, SVG, and PNG file for each card.
            This can be helpful, e.g., if you use a whiteboard application
            to work with the cards.
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <FolderZipIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText secondary="Packaged in a ZIP file">
                <Link component={NextLink} href="tamarocards/v2/Card.zip">Individual Cards</Link>
              </ListItemText>
            </ListItem>
          </List>

          <Typography variant="h4" marginY={3}>
            Individual Documentation Pictures
          </Typography>
          <Typography marginY={1}>
            Do not use documentation pictures for composing TamaroCard expressions.
            The documentation pictures include, in addition to the card,
            extra annotations with example arguments and return values.
            Those extra annotations conflict with the values
            your students will have to reason about when looking the TamaroCard expression.
            For this reason, use cards, not documentation pictures,
            to construct a TamaroCard expression.
          </Typography>
          <Typography marginY={1}>
            We recommend handing out the documentation pages (shown above) to students.
            Those pages meaningfully group the documentation for related cards together.
          </Typography>
          <Typography marginY={1}>
            In some situations it can make sense to include
            task-specific subsets of the documentation in teaching material.
            For example, you may write a Word document with an exercise for your students,
            and include the documentation of just those cards that are needed for that exercise.
            For this purpose, we also include individual pictures files
            of the documentation of each card.
            You can download the ZIP file
            which contains individual PDF, SVG, and PNG documentation pictures.
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <FolderZipIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText secondary="Packaged in a ZIP file">
                <Link component={NextLink} href="tamarocards/v2/CardDoc.zip">Individual Documentation Pictures</Link>
              </ListItemText>
            </ListItem>
          </List>

          <Typography variant="h4" marginY={3}>
            When NOT To Use TamaroCards
          </Typography>
          <Typography marginY={3}>
            TamaroCards are designed for composing relatively simple Python expressions,
            mostly involving calls to PyTamaro functions.
            However, when including the function definition cards
            (from the &quot;Names&quot; card sheet),
            and the if-else card
            (from the &quot;Operators&quot; card sheet),
            TamaroCards actually represent a
            {' '}
            <strong>
              Turing-complete
            </strong>
            {' '}
            programming language!
          </Typography>
          <Typography marginY={3}>
            You can implement any algorithm with TamaroCards.
            Even algorithms for which you normally would use loops!
            Why?
            Because loops are not the only way to repeat computations.
            There are other ways, one of them being recursion.
            And TamaroCards could be used to define recursive functions.
          </Typography>
          <Typography marginY={3}>
            TamaroCards focus on a functional subset of Python:
            they contain pure functions (except show_graphic)
            and immutable variables (which we call constants).
            We recommend to use TamaroCards at the very start of a programming course
            for explaining
            pure expressions,
            constant definitions, and
            the definition of pure functions.
          </Typography>
          <Typography marginY={3}>
            And once you introduce imperative Python features,
            such as mutable variables or loops in Python,
            you go beyond the TamaroCard notional machine.
            You can still use them, but only to reason about the pure and immutable parts of the code.
          </Typography>

          <Typography variant="h4" marginY={3}>
            Natural Languages
          </Typography>
          <Typography marginY={3}>
            The
            {' '}
            <Link href="https://pytamaro.readthedocs.io/en/stable/">PyTamaro API</Link>
            {' '}
            currently exists in four different natural languages:
            English, German, Italian, and French.
            Each TamaroCard shows its function or constant name
            in three of these supported languages (English, German, and Italian).
            This is ideal for multi-lingual environments.
            A future version may include the French names as well.
          </Typography>

          <Typography variant="h4" marginY={3}>
            Prior Version of TamaroCards
          </Typography>
          <Typography>
            You can find the prior version of TamaroCards here:
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <ArticleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText secondary="August 2023">
                <Link component={NextLink} href="tamarocards/v1">Version 1</Link>
              </ListItemText>
            </ListItem>
          </List>
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...await translationProps(),
    },
  };
}
