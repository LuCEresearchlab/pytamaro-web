import {
  Avatar,
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../components/NavigationBar';
import HeroImage from '../../public/events/HeroUniversity.jpg';
import Collage from '../../public/events/2024-ZCU-Collage.jpg';
import { translationProps } from '../../src/serverSideTranslationProps';

export default function Academy() {
  return (
    <div>
      <Head>
        <title>PyTamaro Academy for ZCU 2024</title>
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
            alt="Photo of USI"
            width="1280"
            height="285"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </div>
        <Container maxWidth="lg">
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ marginY: 6 }}>
            <Link component={NextLink} href="/academy">PyTamaro Academy</Link>
            <Typography sx={{ color: 'text.primary' }}>ZCU 2024</Typography>
          </Breadcrumbs>
          <Typography variant="h4" align="center" marginY={3}>One-Day PyTamaro Academy at the Software Institute at USI in Lugano</Typography>
          <Typography variant="h5" align="center" marginY={3}>With the Faculty of Education of the University of West Bohemia</Typography>
          <Typography variant="h6" align="center" marginY={3}>Friday, October 4, 2024</Typography>
          <Typography marginY={3}>
            On their study trip to Switzerland,
            the 16 pre-service and in-serivce informatics teachers
            and faculty of education from the
            {' '}
            <a href="https://www.fpe.zcu.cz/en/">University of West Bohemia</a>
            {' '}
            stopped at USI to learn more about programming education.
            Our PyTamaro workshop included
            activities with
            {' '}
            <Link component={NextLink} href="/tamarocards">Tamaro Cards</Link>
            {' '}
            and a short
            {' '}
            <Link component={NextLink} href="/curricula/luce/zcu24">
              PyTamaro Web curriculum
            </Link>
            {' '}
            targeted at novice programmers.
            The highlight of the day was a visit to a local middle school,
            where an enthusiastic mathematics teacher explained
            how she is using PyTamaro in a programming course she designed for her students.
          </Typography>
          <Image
            src={Collage}
            alt="Photo Collage"
            width="4096"
            height="768"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography variant="h5" align="center" marginY={3} sx={{ fontWeight: 'bold' }}>
            We had a great time working with this wonderful group of educators!
          </Typography>
        </Container>

        <Container maxWidth="lg" component="main">
          <Typography variant="h4" align="center" marginTop={6} marginBottom={3}>Organizers</Typography>
        </Container>
        <Container maxWidth="lg">
          <Typography align="center" marginY={3}>
            This PyTamaro Academy workshop was brought to you by the
            {' '}
            <a href="https://luce.si.usi.ch/">Lugano Computing Education Research Lab</a>
            {' '}
            at the
            {' '}
            <a href="https://si.usi.ch/">Software Institute</a>
            {' '}
            of
            {' '}
            <a href="https://www.usi.ch/">USI</a>
            .
          </Typography>
        </Container>

        <Container maxWidth="lg" component="main">
          <Grid container spacing={5} alignItems="flex-end">

            <Grid
              item
              xs={12}
              sm={4}
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
                    src="../people/LucaChiodini.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title="Luca Chiodini"
                  subheader="PhD Student of Informatics"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Luca is leading the PyTamaro effort
                    with the goal of making programming education
                    interesting and effective at the same time.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={4}
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
                    src="../people/JoeyBevilacqua.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title="Joey Bevilacqua"
                  subheader="PhD Student of Informatics"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Joey is interested in software engineering
                    and is studying the use of notional machines
                    for introductory programming.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={4}
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
                    src="../people/MatthiasHauswirth.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>
                <CardHeader
                  title="Matthias Hauswirth"
                  subheader="Professor of Informatics"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography
                    component="p"
                    variant="subtitle1"
                  >
                    Matthias has been teaching programming,
                    at university and for teacher training,
                    for a quarter of a century, and he still loves it.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Container>

        <Container maxWidth="lg">
          <Typography align="center" marginY={3}>
            For more information contact&nbsp;
            <a href="mailto:Matthias.Hauswirth@usi.ch">Matthias.Hauswirth@usi.ch</a>
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
      ...await translationProps(),
    },
  };
}
