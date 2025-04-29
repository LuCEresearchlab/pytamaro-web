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
import Collage from '../../public/events/2024-SA-Collage.jpg';
import HeroImage from '../../public/events/2024-SA-HeroImage.jpg';
import { translationProps } from '../../src/serverSideTranslationProps';

export default function Academy() {
  return (
    <div>
      <Head>
        <title>PyTamaro Summer Academy 2024</title>
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
            key={10}
            src={HeroImage}
            alt='Photo of USI'
            width='1280'
            height='285'
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
            <Typography sx={{ color: 'text.primary' }}>Summer 2024</Typography>
          </Breadcrumbs>
          <Typography variant='h4' align='center' marginY={3}>
            Five-Day Summer Academy at the Software Institute at USI in Lugano
          </Typography>
          <Typography variant='h5' align='center' marginY={3}>
            Monday, July 22 to Friday, July 26, 2024
          </Typography>
          <Typography variant='h6' align='center' marginY={3}>
            Daily Schedule: 9:00 to 17:00
          </Typography>
          <Typography marginY={3}>
            This was a week-long summer course for teachers. It included
            activities with{' '}
            <Link component={NextLink} href='/tamarocards'>
              Tamaro Cards
            </Link>{' '}
            and a{' '}
            <Link component={NextLink} href='/curricula/luce/sa24'>
              PyTamaro Web curriculum
            </Link>{' '}
            targeted at novice programmers. This was complemented by a special
            session on{' '}
            <Link component={NextLink} href='/curricula/luce/language-model'>
              building your own language model
            </Link>
            , and with insightful presentations from two high school teachers on
            their experiences of using PyTamaro in their informatics courses.
          </Typography>
          <Image
            src={Collage}
            alt='Photo Collage'
            width='4096'
            height='768'
            sizes='100vw'
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography
            variant='h5'
            align='center'
            marginY={3}
            sx={{ fontWeight: 'bold' }}
          >
            We had a great time with wonderful teachers! Thank you for the
            PAC-MAN game-in-a-tin!
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
            The 2024 PyTamaro Summer Academy was organized by the{' '}
            <Link href='https://luce.si.usi.ch/'>
              Lugano Computing Education Research Lab
            </Link>{' '}
            at the <Link href='https://si.usi.ch/'>Software Institute</Link> of{' '}
            <Link href='https://www.usi.ch/'>USI</Link>.
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
                    src='../people/JoeyBevilacqua.jpg'
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title='Joey Bevilacqua'
                  subheader='PhD Student of Informatics'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    Joey is interested in software engineering and is studying
                    the use of notional machines for introductory programming.
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
