import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Head from 'next/head';
import { School, Print, Hiking } from '@mui/icons-material';
import PageTitle from '../../components/PageTitle';
import NavigationBar from '../../components/NavigationBar';
import { translationProps } from '../../src/serverSideTranslationProps';
import theme from '../../src/theme';
import { activityVariantPathname } from '../../src/urlUtils';
import { printableGraphicActivityVariant } from '../../src/specialActivities';

export default function Teaching() {
  return (
    <div>
      <Head>
        <title>Resources for Teachers</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="lg">
          <PageTitle>Resources for Teachers</PageTitle>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Welcome to the teaching material page. Here you will find resources
            to help you teach programming with PyTamaro.
          </Typography>
          <Stack spacing={4}>
            <Paper elevation={4}>
              <Card>
                <CardActionArea href="/tamarocards">
                  <Grid container>
                    <Grid xs={12} md={7}>
                      <CardHeader
                        avatar={<School color="primary" />}
                        title="Get your TamaroCards!"
                        titleTypographyProps={{
                          variant: 'h5',
                          color: 'primary',
                          fontWeight: 'bold',
                        }}
                        sx={{ pb: 0 }}
                      />
                      <CardContent>
                        <Typography fontSize="1.1rem" paragraph gutterBottom>
                          Use our simple paper cards to teach programming with
                          PyTamaro.
                        </Typography>
                        <Typography fontSize="1.1rem" paragraph gutterBottom>
                          Let students compose PyTamaro code by arranging and
                          connecting cards, and let them interpret other
                          students&apos; card compositions.
                        </Typography>
                      </CardContent>
                    </Grid>
                    <Grid xs={12} md={5}>
                      <Box
                        padding={2}
                        position="relative"
                        height="12rem"
                        alignItems="center"
                        justifyContent="center"
                        display="flex"
                      >
                        <Image
                          src="/SA-2023-Table3.jpg"
                          alt="Alpe Foppa panorama"
                          fill
                          style={{
                            objectFit: 'contain',
                            padding: theme.spacing(1),
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardActionArea>
              </Card>
            </Paper>
            <Paper elevation={4}>
              <Card>
                <CardActionArea
                  href={activityVariantPathname(
                    printableGraphicActivityVariant,
                  )}
                >
                  <Grid container>
                    <Grid xs={12} md={7}>
                      <CardHeader
                        avatar={<Print color="primary" />}
                        title="Print and cut out your own Graphic!"
                        titleTypographyProps={{
                          variant: 'h5',
                          color: 'primary',
                          fontWeight: 'bold',
                        }}
                        sx={{ pb: 0 }}
                      />
                      <CardContent>
                        <Typography fontSize="1.1rem" paragraph gutterBottom>
                          Print and cut out your own PyTamaro graphic.
                        </Typography>
                      </CardContent>
                    </Grid>
                    <Grid xs={12} md={5}>
                      <Box
                        padding={2}
                        position="relative"
                        height="12rem"
                        alignItems="center"
                        justifyContent="center"
                        display="flex"
                      >
                        <Image
                          src="/printable-monkey.png"
                          alt="Print and cut out Monkey"
                          fill
                          style={{
                            objectFit: 'contain',
                            padding: theme.spacing(1),
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardActionArea>
              </Card>
            </Paper>
            <Paper elevation={4}>
              <Card>
                <CardActionArea href="/summeracademy">
                  <Grid container>
                    <Grid xs={12} md={7}>
                      <CardHeader
                        avatar={<Hiking color="primary" />}
                        title="Ready for an Adventure?"
                        titleTypographyProps={{
                          variant: 'h5',
                          color: 'primary',
                          fontWeight: 'bold',
                        }}
                        sx={{ pb: 0 }}
                      />
                      <CardContent>
                        <Typography fontSize="1.1rem" paragraph gutterBottom>
                          Sign up for the PyTamaro Summer Academy.
                        </Typography>
                        <Typography fontSize="1.1rem" paragraph gutterBottom>
                          A unique chance to combine learning with PyTamaro and
                          a hike on Monte Tamaro!
                        </Typography>
                      </CardContent>
                    </Grid>
                    <Grid xs={12} md={5}>
                      <Box
                        padding={2}
                        position="relative"
                        height="12rem"
                        alignItems="center"
                        justifyContent="center"
                        display="flex"
                      >
                        <Image
                          src="/AlpeFoppa.jpg"
                          alt="Alpe Foppa panorama"
                          fill
                          style={{
                            objectFit: 'contain',
                            padding: theme.spacing(1),
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardActionArea>
              </Card>
            </Paper>
          </Stack>
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
