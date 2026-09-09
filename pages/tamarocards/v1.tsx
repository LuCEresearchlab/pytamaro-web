import FolderZipIcon from '@mui/icons-material/FolderZip';
import {
  Alert,
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
import NavigationBar from '../../components/navbar/NavigationBar';
import SA23_TableImage from '../../public/events/2023-SA-Table.jpg';
import SA23_TableImage2 from '../../public/events/2023-SA-Table2.jpg';
import SA23_TableImage3 from '../../public/events/2023-SA-Table3.jpg';
import TamaroCardAPIColors from '../../public/tamarocards/v1/api/PyTamaro-Cards-API-Colors.png';
import TamaroCardAPICombinators from '../../public/tamarocards/v1/api/PyTamaro-Cards-API-Combinators.png';
import TamaroCardAPIPinning from '../../public/tamarocards/v1/api/PyTamaro-Cards-API-Pinning.png';
import TamaroCardAPIPrimitives from '../../public/tamarocards/v1/api/PyTamaro-Cards-API-Primitives.png';
import TamaroCardSheetsConstants from '../../public/tamarocards/v1/sheets/PyTamaro-Cards-Constants.png';
import TamaroCardSheetsFunctionsCommon from '../../public/tamarocards/v1/sheets/PyTamaro-Cards-Functions-Common.png';
import TamaroCardSheetsFunctions from '../../public/tamarocards/v1/sheets/PyTamaro-Cards-Functions.png';
import TamaroCardSheetsNames from '../../public/tamarocards/v1/sheets/PyTamaro-Cards-Names.png';
import { translationProps } from '../../src/serverSideTranslationProps';

export default function TamaroCardsPage() {
  const api = [
    {
      name: 'Colors',
      desc: 'Color constants, functions for RGB and HSV color spaces',
      img: TamaroCardAPIColors,
    },
    {
      name: 'Primitives',
      desc: 'Functions to create primitive graphics',
      img: TamaroCardAPIPrimitives,
    },
    {
      name: 'Combinators',
      desc: 'Functions to compose graphics',
      img: TamaroCardAPICombinators,
    },
    {
      name: 'Pinning',
      desc: 'Functions for general composition using pinning',
      img: TamaroCardAPIPinning,
    },
  ];

  const sheets = [
    {
      name: 'Constants',
      desc: 'Blue constant cards, and empty white cards for primitive literals',
      img: TamaroCardSheetsConstants,
    },
    {
      name: 'Functions-Common',
      desc: 'Common red function cards',
      img: TamaroCardSheetsFunctionsCommon,
    },
    {
      name: 'Functions',
      desc: 'Less common red function cards',
      img: TamaroCardSheetsFunctions,
    },
    {
      name: 'Names',
      desc: 'Cards for definition and use of own constants and functions',
      img: TamaroCardSheetsNames,
    },
  ];

  return (
    <div>
      <Head>
        <title>TamaroCards Version 1</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <Typography variant='h3' marginY={3}>
            TamaroCards - A Tangible Way to Compose Programs
          </Typography>
          <Typography variant='h4' marginY={3}>
            Version 1, August 2023
          </Typography>

          <Alert severity='warning'>
            This is an old version of TamaroCards. We recommend you use the{' '}
            <Link component={NextLink} href='/tamarocards'>
              current version
            </Link>
            .
          </Alert>

          <Typography marginY={3}>
            PyTamaro is often used to teach complete novices. For them, writing
            Python code on a computer can be challenging. To support novices in
            reasoning about a graphic and its composition, we developed
            TamaroCards. Each Python function or constant is represented by a
            card. Functions are red, constants are blue. The cards can be
            arranged on a table to compose a Python expression that corresponds
            to a graphic.
          </Typography>

          <Image
            src={SA23_TableImage}
            alt='Photo of Table'
            width='1261'
            height='831'
            sizes='100vw'
            style={{
              width: '33%',
              height: 'auto',
            }}
          />
          <Image
            src={SA23_TableImage3}
            alt='Photo of Table'
            width='1261'
            height='831'
            sizes='100vw'
            style={{
              width: '33%',
              height: 'auto',
            }}
          />
          <Image
            src={SA23_TableImage2}
            alt='Photo of Table'
            width='1261'
            height='831'
            sizes='100vw'
            style={{
              width: '33%',
              height: 'auto',
            }}
          />

          <Typography marginY={3}>
            The{' '}
            <Link href='https://pytamaro.readthedocs.io/en/stable/'>
              PyTamaro API
            </Link>{' '}
            currently exists in three different natural languages: English,
            German, and Italian. Correspondingly, each TamaroCard shows its
            function or constant name in all three supported languages. This is
            ideal for multi-lingual environments.
          </Typography>

          <Typography variant='h4' marginY={3}>
            API Documentation Pages
          </Typography>
          <Typography marginY={1}>
            When using the TamaroCards, we provide each student (or student
            team) with the &quot;API documentation&quot; in the form of a few
            printed pages. Each page shows part of the API.
          </Typography>
          <Typography>
            Each API documentation page shows the cards of a specific part of
            the API. These pages correspond to the API <b>documentation</b>:
            they explain what each function or constant does. The explanations
            are provided in a visual form: as annotations of parameters and
            return values of functions, and annotations of values of constants.
            This documentation should be sufficient to remember how to use the
            cards. No information about the implementation is needed; the visual
            annotations provide a complete description of each card&apos;s
            meaning.
          </Typography>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '1rem 0',
            }}
          />
          <Grid container spacing={5} alignItems='flex-end'>
            {api.map(({ name, desc, img }) => (
              <Grid
                key={name}
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Card key={name}>
                  <CardActionArea
                    LinkComponent={NextLink}
                    href={`tamarocards/v1/api/PyTamaro-Cards-API-${name}.pdf`}
                  >
                    <CardMedia>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Image
                          src={img}
                          alt={`API: ${name}`}
                          sizes='100vw'
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
            ))}
          </Grid>
          <Typography marginY={3}>
            The API documentation pages are not to be cut. They are to be kept
            whole and used as a reference by students when they try to
            understand the meaning of a specific card.
          </Typography>

          <Typography variant='h4' marginY={3}>
            Printable Card Sheets
          </Typography>
          <Typography>
            To express a computation students connect together individual cards.
            They can use the blue constant cards (colors and points for
            pinning), and they can use the red function cards.
          </Typography>
          <Typography marginY={1}>
            Expressions are tree structures composed of cards. The evaluation of
            the expression flows from left to right. Each constant or function
            emits a value on its right. Function parameters enter functions from
            the left. Students can place cards near each other, and they can
            draw lines with pencil to connect the cards. We recommend putting
            large sheets of paper on the table, so students can easily draw
            between cards.
          </Typography>
          <Typography marginY={1}>
            When composing or interpreting an expression, students can annotate
            the visual expression with the values emitted by the cards. Values
            of built-in types (int, float, str, bool) are written as normal
            Python literals. Values of PyTamaro types (Graphic, Color, Point)
            are drawn graphically; graphics can even be cut out from colored
            sheets of paper.
          </Typography>
          <Typography marginY={1}>
            The four sheets contain cards arranged in a way so they can be
            printed and easily cut out. The sheets contain more copies of more
            commonly needed cards.
          </Typography>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '1rem 0',
            }}
          />
          <Grid container spacing={5} alignItems='flex-end'>
            {sheets.map(({ name, desc, img }) => (
              <Grid
                key={name}
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Card key={name}>
                  <CardActionArea
                    LinkComponent={NextLink}
                    href={`tamarocards/v1/sheets/PyTamaro-Cards-${name}.pdf`}
                  >
                    <CardMedia>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Image
                          src={img}
                          alt={`API: ${name}`}
                          sizes='100vw'
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
            ))}
          </Grid>
          <Typography marginY={3}>
            Note that the individual cards, unlike the API documentation, do not
            contain any annotations on parameters, return values, or constant
            values. This is akin to code: when you call a function, you just
            write its name, and you provide arguments, but you don&apos;t write
            the names of the parameters.
          </Typography>

          <Typography variant='h4' marginY={3}>
            Individual Card PDFs
          </Typography>
          <Typography>
            We recommend printing the above sheets and cutting out the cards.
            However, if needed, one can download the ZIP file which contains an
            individual PDF for each card.
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <FolderZipIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText secondary='Packaged in a ZIP file'>
                <Link
                  component={NextLink}
                  href='tamarocards/v1/IndividualCardPDFs.zip'
                >
                  Individual Cards
                </Link>
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
      ...(await translationProps()),
    },
  };
}
