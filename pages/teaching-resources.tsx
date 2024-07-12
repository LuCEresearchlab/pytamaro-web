import { Hiking, Print, School } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import { translationProps } from '../src/serverSideTranslationProps';
import { printableGraphicActivityVariant } from '../src/specialActivities';
import theme from '../src/theme';
import { activityVariantPathname } from '../src/urlUtils';

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
          <Typography textAlign="center" fontSize="1.2rem" sx={{ mb: 4 }}>
            This page contains assorted resources to help you teach programming with PyTamaro.
            More is coming soon!
          </Typography>
          <Stack spacing={4}>
            <Card elevation={4}>
              <CardActionArea href="/tamarocards">
                <Grid container>
                  <Grid xs={12} md={7}>
                    <CardHeader
                      avatar={<School color="primary" />}
                      title="Unplugged programming with TamaroCards!"
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
            <Card elevation={4}>
              <CardActionArea
                href={activityVariantPathname(
                  printableGraphicActivityVariant,
                )}
              >
                <Grid container>
                  <Grid xs={12} md={7}>
                    <CardHeader
                      avatar={<Print color="primary" />}
                      title="Print ready-to-cut pieces from your own graphic!"
                      titleTypographyProps={{
                        variant: 'h5',
                        color: 'primary',
                        fontWeight: 'bold',
                      }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography fontSize="1.1rem" paragraph gutterBottom>
                        Do you want students to compose a graphic starting from basic pieces?
                      </Typography>
                      <Typography fontSize="1.1rem" paragraph gutterBottom>
                        We offer a fully automated service that you can use to
                        quickly produce pages ready to print and easy to cut,
                        with all the pieces needed by students.
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
            <Card elevation={4}>
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
