import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import anime from 'animejs';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import { useEffect } from 'react';
import NavigationBar from '../../components/NavigationBar';
import PanoramaUSI from '../../public/PanoramaUSI.jpg';
import PyTamaroLogo from '../../public/PyTamaroLogo.png';
import HeroImage from '../../public/SA.jpg';
import Art from '../../public/alp-ancel-WKQt_X-SKFI-unsplash.jpg';
import Theory from '../../public/artturi-jalli-gYrYa37fAKI-unsplash.jpg';
import { translationProps } from '../../src/serverSideTranslationProps';

export default function SummerAcademy() {
  useEffect(() => {
    const tl = anime.timeline({
      easing: 'easeOutQuad',
      duration: 750,
      direction: 'alternate',
      loop: true,
    });
    tl.add({
      targets: '.eye-top',
      translateX: '15vw',
      translateY: '2vw',
      delay: 1000,
    });
    tl.add({
      targets: '.eye-bottom',
      translateX: '-15vw',
      translateY: '-2vw',
      endDelay: 1000,
    });
    tl.add({
      targets: '.dot-top',
      translateX: '20vw',
    });
    tl.add({
      targets: '.dot-bottom',
      translateX: '-20vw',
      endDelay: 1000,
    });
    tl.add({
      targets: '.semicircle-right',
      translateX: '5vw',
    });
    tl.add({
      targets: '.semicircle-left',
      translateX: '-5vw',
      endDelay: 1000,
    }, '-=750');
    tl.add({
      targets: '.semicircle-right',
      rotate: -90,
    });
    tl.add({
      targets: '.semicircle-left',
      rotate: 90,
      endDelay: 1000,
    });
  }, []);
  return (
    <div>
      <Head>
        <title>PyTamaro Summer Academy</title>
      </Head>
      <Box>
        <NavigationBar>
          <Typography variant="h6">PyTamaro Summer Academy</Typography>
        </NavigationBar>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Image
            src={HeroImage}
            alt="Photo of Alpe Foppa"
            width="2048"
            height="576"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </div>
        <Box
          sx={{
            minHeight: '8vw',
            position: 'relative',
            my: 2,
          }}
        >
          <div
            className="yin-yang-animation semicircle-left"
            style={{
              height: '8vw', width: '4vw', backgroundColor: 'white', left: 'calc(50% - 4vw)', zIndex: 2, borderRadius: '4vw 0 0 4vw',
            }}
          />
          <div
            className="yin-yang-animation semicircle-right"
            style={{
              height: '8vw', width: '4vw', backgroundColor: 'black', left: 'calc(50%)', zIndex: 2, borderRadius: '0 4vw 4vw 0',
            }}
          />
          <div
            className="yin-yang-animation eye-top"
            style={{
              height: '4vw', width: '4vw', backgroundColor: 'white', left: 'calc(50% - 2vw)', zIndex: 3, borderRadius: '50%',
            }}
          />
          <div
            className="yin-yang-animation eye-bottom"
            style={{
              height: '4vw', width: '4vw', backgroundColor: 'black', left: 'calc(50% - 2vw)', top: '4vw', zIndex: 3, borderRadius: '50%',
            }}
          />
          <div
            className="yin-yang-animation eye-top dot-top"
            style={{
              height: '1vw', width: '1vw', backgroundColor: 'black', left: 'calc(50% - .5vw)', top: '1.5vw', zIndex: 4, borderRadius: '50%',
            }}
          />
          <div
            className="yin-yang-animation eye-bottom dot-bottom"
            style={{
              height: '1vw', width: '1vw', backgroundColor: 'white', left: 'calc(50% - .5vw)', top: '5.5vw', zIndex: 4, borderRadius: '50%',
            }}
          />
        </Box>
        <Container maxWidth="lg">
          <Card>
            <CardMedia>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  key={10}
                  src={PanoramaUSI}
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
            </CardMedia>
            <Container maxWidth="lg">
              <Typography variant="h4" align="center" marginY={3}>PyTamaro Summer Academy at the Software Institute at USI in Lugano</Typography>
              <Typography align="center" marginY={3}>The first PyTamaro Summer Academy took place in 2023, and we plan to continue organizing summer academies at USI in the coming years.</Typography>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '2rem 0',
                }}
              />
              <Grid container spacing={5} alignItems="flex-end">
                {
                  [2024, 2023].map((year) => (
                    <Grid
                      key={year}
                      item
                      xs={12}
                      md={6}
                    >
                      <Card sx={{ backgroundColor: 'rgb(224, 246, 255)' }}>
                        <CardActionArea LinkComponent={NextLink} href={`summeracademy/${year}`}>
                          <CardHeader
                            title="PyTamaro Summer Academy"
                            titleTypographyProps={{ align: 'center' }}
                            subheaderTypographyProps={{
                              align: 'center',
                            }}
                          />
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="h2" sx={{ fontWeight: 'bold', color: (year > 2023 ? '#008dca' : '#707070') }}>
                              {year}
                            </Typography>
                          </Box>
                          <Typography sx={{ marginBottom: 1, textAlign: 'center' }}>
                            {year > 2023 ? <>Learn more...</> : <>Learn what happened...</>}
                          </Typography>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))
                }
              </Grid>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '2rem 0',
                }}
              />
            </Container>
          </Card>
        </Container>
        <Container maxWidth="lg" sx={{ marginTop: '25px' }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <AccountTreeIcon fontSize="large" color="primary" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary="Problem Solving"
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary="Learn programming by decomposing graphics and recomposing them as programs."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TipsAndUpdatesIcon fontSize="large" color="primary" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary="Theory & Creativity"
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary="Experience the sound theoretical foundations of programming combined with the unbounded creativity and playfulness of computer graphics."
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Image width="32" alt="PyTamaro Logo" src={PyTamaroLogo} />
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary="Python & PyTamaro"
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary="Use the most prevalent programming language, Python, and the greatest (we think) educational graphics library, PyTamaro."
              />
            </ListItem>
          </List>
        </Container>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '2rem 0',
          }}
        />

        <Container maxWidth="lg" component="main">
          <Typography variant="h4" align="center" marginY={3}>Programming: Deep like Mathematics, Creative like Art</Typography>
        </Container>

        <Container maxWidth="lg" component="main">
          <Grid container spacing={5} alignItems="flex-end">
            <Grid
              item
              xs={12}
              sm={6}
            >
              <Card>
                <CardMedia>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={Theory}
                      alt="Photo by Artturi Jalli on Unsplash"
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                </CardMedia>
                <CardHeader
                  title="Theoretical Foundations"
                  subheader="Connect to Algebra and Logic"
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
                    The contents is informed by concepts from algebra
                    you might know from middle school,
                    all the way to abstract algebra and logic one would learn at university.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
            >
              <Card>
                <CardMedia>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={Art}
                      alt="Photo by Alp Ancel on Unsplash"
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                </CardMedia>
                <CardHeader
                  title="Creativity &amp; Playfulness"
                  subheader="(De)Compose Art, Design, and Games"
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
                    Starting with the composition of simple geometric shapes,
                    we will end up composing graphics inspired by contemporary art,
                    design, and game design.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '1rem 0',
          }}
        />

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
