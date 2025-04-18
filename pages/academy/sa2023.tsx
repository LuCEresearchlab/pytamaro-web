import LandscapeIcon from '@mui/icons-material/Landscape';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  Container,
  GridLegacy as Grid,
  Link,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../components/navbar/NavigationBar';
import SILogo from '../../components/SILogo';
import SA23_ColorImage from '../../public/events/2023-SA-Colors.jpg';
import SA23_FoppaImage from '../../public/events/2023-SA-Foppa.jpg';
import HeroImage from '../../public/events/2023-SA-HeroImage.jpg';
import SA23_TableImage from '../../public/events/2023-SA-Table.jpg';
import SA23_TableImage2 from '../../public/events/2023-SA-Table2.jpg';
import { translationProps } from '../../src/serverSideTranslationProps';

export default function Academy() {
  return (
    <div>
      <Head>
        <title>PyTamaro Summer Academy 2023</title>
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

        <Container maxWidth='lg'>
          <Breadcrumbs
            separator='›'
            aria-label='breadcrumb'
            sx={{ marginY: 6 }}
          >
            <Link component={NextLink} href='/academy'>
              PyTamaro Academy
            </Link>
            <Typography sx={{ color: 'text.primary' }}>Summer 2023</Typography>
          </Breadcrumbs>
          <Typography variant='h4' align='center' marginY={3}>
            Five-Day Summer Academy at the Software Institute at USI in Lugano
          </Typography>
          <Typography variant='h5' align='center' marginY={3}>
            Monday, August 14 to Friday, August 18, 2023
          </Typography>
          <Typography variant='h6' align='center' marginY={3}>
            Daily Schedule: 9:00 to 17:00
          </Typography>
        </Container>

        <Container maxWidth='lg' component='main'>
          <Grid container spacing={5} alignItems='flex-end'>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <LanguageIcon color='primary' sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title='Multilingual'
                  subheader='Deutsch ∙ Italiano ∙ English'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    The PyTamaro library currently supports German, Italian, and
                    English. In this summer academy we spoke them all.
                    Participants learned to program in their native language!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolIcon color='primary' sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title='Teachers &amp; Students'
                  subheader='Learn Together'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    Programming is a collaborative activity. Teachers and
                    students teamed up to solve a challenges and learn with and
                    from each other. From 12 to 60 years, we had it all!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <LandscapeIcon color='primary' sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title='Learning and Fun'
                  subheader='Minds that Match our Mountains'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    The summer academy took place at USI in Lugano, but we also
                    explored the beautiful surroundings. Yes, we discovered
                    PyTamaro. But also Monte Tamaro!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        <Container maxWidth='lg'>
          <Typography
            variant='h5'
            align='center'
            marginTop={4}
            marginBottom={3}
            sx={{ fontWeight: 'bold' }}
          >
            The PyTamaro Summer Academy 2023 is History!
          </Typography>
          <Grid container spacing={1} alignItems='flex-end'>
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
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
            variant='h5'
            align='center'
            marginTop={3}
            marginBottom={6}
            sx={{ fontWeight: 'bold' }}
          >
            We had a wonderful time working with fantastic students and
            teachers!
          </Typography>
        </Container>

        <Container maxWidth='lg' component='main'>
          <Typography
            variant='h4'
            align='center'
            marginTop={6}
            marginBottom={3}
          >
            Organizers
          </Typography>
        </Container>
        <Container maxWidth='lg'>
          <Typography align='center' marginY={3}>
            The 2023 PyTamaro Summer Academy was organized by the{' '}
            <a href='https://luce.si.usi.ch/'>
              Lugano Computing Education Research Lab
            </a>{' '}
            at the <a href='https://si.usi.ch/'>Software Institute</a> of{' '}
            <a href='https://www.usi.ch/'>USI</a>.
          </Typography>
        </Container>

        <Container maxWidth='lg' component='main'>
          <Grid container spacing={5} alignItems='flex-end'>
            <Grid item xs={12} sm={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src='../people/AgneseZamboni.jpg'
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title='Agnese Zamboni'
                  subheader='Student of Informatics'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    Agnese is studying informatics at USI, and she is
                    contributing to PyTamaro funded by an USI Didactics
                    Innovation grant.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src='../people/LucaChiodini.jpg'
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title='Luca Chiodini'
                  subheader='PhD Student of Informatics'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    Luca is leading the PyTamaro effort with the goal of making
                    programming education interesting and effective at the same
                    time.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src='../people/MatthiasHauswirth.jpg'
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title='Matthias Hauswirth'
                  subheader='Professor of Informatics'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    Matthias has been teaching programming, at university and
                    for teacher training, for a quarter of a century, and he
                    still loves it.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src='../people/CostanzaRodriguezGavazzi.jpg'
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title='Costanza Rodriguez Gavazzi'
                  subheader='Student of Informatics'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    Costanza is studying informatics at USI, and she is
                    assisting in the PyTamaro Summer Academy to help you learn
                    programming.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <Avatar
                    src='../people/DavideFrova.jpg'
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title='Davide Frova'
                  subheader='Student of Informatics'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    Davide is studying informatics at USI. He is passionate
                    about robotics, where code meets the real world, &amp;
                    having fun together.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <SILogo height={80} />
                </Box>
                <CardHeader
                  title='Software Institute'
                  subheader='Award-Winning Teaching &amp; Research'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    At the Software Institute at USI we discover, design, and
                    develop new ideas that ease the conception of modern
                    software systems.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        <Container maxWidth='lg'>
          <Typography align='center' marginY={3}>
            For more information contact&nbsp;
            <a href='mailto:Matthias.Hauswirth@usi.ch'>
              Matthias.Hauswirth@usi.ch
            </a>
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
