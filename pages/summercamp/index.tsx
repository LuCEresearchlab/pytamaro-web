import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Container, Grid, Typography,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';
import LandscapeIcon from '@mui/icons-material/Landscape';
import Image from 'next/image';
import Head from 'next/head';
import NavigationBar from '../../components/NavigationBar';
import AlpeFoppa from '../../public/AlpeFoppa.jpg';
import Art from '../../public/alp-ancel-WKQt_X-SKFI-unsplash.jpg';
import Theory from 'public/artturi-jalli-gYrYa37fAKI-unsplash.jpg';

export default function Install() {
  return (
    <div>
      <Head>
        <title>PyTamaro Summer Camp</title>
      </Head>
      <Box>
        <NavigationBar title="PyTamaro Summer Camp" />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Image
            src={AlpeFoppa}
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
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" marginY={3}>An Extraordinary Way to Learn Programming</Typography>
          <Typography variant="h4" align="center" marginY={3}>Five-Day Summer Camp in Lugano, with a Trip to Monte Tamaro</Typography>
          <Typography variant="h5" align="center" marginY={3}>
            In this summer camp you learn programming by decomposing graphical compositions
            and reconstructing them in code.
            You will experience the sound theoretical foundations of programming
            combined with the unbounded creativity and playfulness of computer graphics.
            We will use the most prevalent programming language, Python,
            and the (we think) greatest Python graphics library, PyTamaro.
          </Typography>
        </Container>
        <Container maxWidth="lg" component="main">
          <Grid container spacing={5} alignItems="flex-end">
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <LanguageIcon color="primary" sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title="Multilingual"
                  subheader="Deutsch ∙ Italiano ∙ English"
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
                    The PyTamaro library currently supports German, Italian, and English.
                    In this summer camp we will speak them all.
                    Join us, and learn to program in your native language!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolIcon color="primary" sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title="Teachers &amp; Students"
                  subheader="Learn Together"
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
                    Programming is a collaborative activity.
                    To participate in this summer camp,
                    you need to come as a team:
                    each teacher brings along 1-3 students.
                    Or we team you up.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <LandscapeIcon color="primary" sx={{ fontSize: 80 }} />
                </Box>
                <CardHeader
                  title="Learning and Fun"
                  subheader="Minds that Match our Mountains"
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
                    The summer camp will take place at USI in Lugano,
                    but we will explore the beautiful surroundings.
                    Yes, we will discover PyTamaro. But also Monte Tamaro!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Container>

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
                    The contents is informed by concepts from algebra you might know from middle school,
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



        <Container maxWidth="lg">
          <Typography align="center" marginY={3}>For more information, contact Matthias.Hauswirth@usi.ch</Typography>
        </Container>
      </Box>
    </div>
  );
}
