import { Schema } from '@mui/icons-material';
import AccountBalance from '@mui/icons-material/AccountBalance';
import Hiking from '@mui/icons-material/Hiking';
import Print from '@mui/icons-material/Print';
import School from '@mui/icons-material/School';
import Translate from '@mui/icons-material/Translate';
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
import NavigationBar from '../components/navbar/NavigationBar';
import NewsletterForm from '../components/NewsletterForm';
import PageTitle from '../components/PageTitle';
import { translationProps } from '../src/serverSideTranslationProps';
import {
  mathematicalFoundationsActivityVariant,
  multipleLanguagesActivityVariant,
  printableGraphicActivityVariant,
} from '../src/specialActivities';
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
        <Container maxWidth='lg'>
          <PageTitle>Resources for Teachers</PageTitle>
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '1.2rem',
              mb: 6,
            }}
          >
            This page contains assorted resources to help you teach Python
            programming with PyTamaro.
          </Typography>
          <Image
            src='/pencils.png'
            alt='pencil'
            width='1280'
            height='285'
            sizes='100vw'
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '1.2rem',
              mt: 2,
            }}
          >
            Stay informed about new resources and updates?
          </Typography>
          <Card elevation={4} sx={{ mt: 2, mb: 10 }}>
            <NewsletterForm />
          </Card>
          <Stack spacing={4}>
            <Card elevation={4}>
              <CardActionArea href='/tamarocards'>
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      md: 7,
                    }}
                  >
                    <CardHeader
                      avatar={<School color='primary' />}
                      title='Unplugged Programming With TamaroCards!'
                      sx={{ pb: 0 }}
                      slotProps={{
                        title: {
                          variant: 'h5',
                          color: 'primary',
                          sx: {
                            fontWeight: 'bold',
                          },
                        },
                      }}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        Use our simple paper cards to teach programming with
                        PyTamaro.
                      </Typography>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        Let students compose PyTamaro code by arranging and
                        connecting cards, and let them interpret other
                        students&apos; card compositions.
                      </Typography>
                    </CardContent>
                  </Grid>
                  <Grid
                    sx={{ background: '#B6A99B' }}
                    size={{
                      xs: 12,
                      md: 5,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                      }}
                    >
                      <Image
                        src='/TamaroCardsUse.jpg'
                        alt='Use of Tamaro Cards'
                        fill
                        style={{
                          objectFit: 'cover',
                          padding: theme.spacing(1),
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardActionArea>
            </Card>
            <Card elevation={4}>
              <CardActionArea href='/tide'>
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      md: 7,
                    }}
                  >
                    <CardHeader
                      avatar={<Schema color='primary' />}
                      title='From Unplugged to Plugged TamaroCards With TIDE'
                      sx={{ pb: 0 }}
                      slotProps={{
                        title: {
                          variant: 'h5',
                          color: 'primary',
                          sx: {
                            fontWeight: 'bold',
                          },
                        },
                      }}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        TIDE is a web-based interactive environment for
                        TamaroCards with live evaluation of graphics and colors.
                      </Typography>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        A teaching sequence can start unplugged, with
                        paper-based cards that students manually evaluate, and
                        then transition to TIDE, where students can use the same
                        notation with live execution.
                      </Typography>
                    </CardContent>
                  </Grid>
                  <Grid
                    sx={{ background: theme.palette.grey[100] }}
                    size={{
                      xs: 12,
                      md: 5,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                      }}
                    >
                      <Image
                        src='/tide.png'
                        alt='A screenshot of TIDE'
                        fill
                        style={{
                          objectFit: 'cover',
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
                  mathematicalFoundationsActivityVariant,
                )}
              >
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      md: 7,
                    }}
                  >
                    <CardHeader
                      avatar={<AccountBalance color='primary' />}
                      title='Explore the Mathematical Foundations of PyTamaro'
                      sx={{ pb: 0 }}
                      slotProps={{
                        title: {
                          variant: 'h5',
                          color: 'primary',
                          sx: {
                            fontWeight: 'bold',
                          },
                        },
                      }}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        Are you a mathematician? Then check this out!
                      </Typography>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        PyTamaro is based on a principled foundation: algebra.
                        The reasoning about PyTamaro graphics corresponds to the
                        reasoning about algebraic expressions.
                      </Typography>
                    </CardContent>
                  </Grid>
                  <Grid
                    sx={{ background: '#E1F6FF' }}
                    size={{
                      xs: 12,
                      md: 5,
                    }}
                  >
                    <Box
                      sx={{
                        padding: 2,
                        position: 'relative',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                      }}
                    >
                      <Image
                        src='/mathematical-foundations.png'
                        alt='Table of Algebraic Concepts'
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
                href={activityVariantPathname(multipleLanguagesActivityVariant)}
              >
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      md: 7,
                    }}
                  >
                    <CardHeader
                      avatar={<Translate color='primary' />}
                      title='Find Out About Support for Multiple Languages'
                      sx={{ pb: 0 }}
                      slotProps={{
                        title: {
                          variant: 'h5',
                          color: 'primary',
                          sx: {
                            fontWeight: 'bold',
                          },
                        },
                      }}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        Unlike most libraries, PyTamaro is available in several
                        natural languages.
                      </Typography>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        Language choice is not just about the PyTamaro library,
                        but also about the PyTamaro Web platform, and the
                        available activities. Find out more!
                      </Typography>
                    </CardContent>
                  </Grid>
                  <Grid
                    sx={{ background: '#5C2382' }}
                    size={{
                      xs: 12,
                      md: 5,
                    }}
                  >
                    <Box
                      sx={{
                        padding: 2,
                        position: 'relative',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                      }}
                    >
                      <Image
                        src='/multiple-languages.svg'
                        alt='Table of Algebraic Concepts'
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
                href={activityVariantPathname(printableGraphicActivityVariant)}
              >
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      md: 7,
                    }}
                  >
                    <CardHeader
                      avatar={<Print color='primary' />}
                      title='Print Ready-To-Cut Pieces From Your Own Graphic!'
                      sx={{ pb: 0 }}
                      slotProps={{
                        title: {
                          variant: 'h5',
                          color: 'primary',
                          sx: {
                            fontWeight: 'bold',
                          },
                        },
                      }}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        Do you want students to compose a graphic starting from
                        basic pieces?
                      </Typography>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        We offer a fully automated service that you can use to
                        quickly produce pages ready to print and easy to cut,
                        with all the pieces needed by students.
                      </Typography>
                    </CardContent>
                  </Grid>
                  <Grid
                    sx={{ background: '#FDFBDE' }}
                    size={{
                      xs: 12,
                      md: 5,
                    }}
                  >
                    <Box
                      sx={{
                        padding: 2,
                        position: 'relative',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                      }}
                    >
                      <Image
                        src='/paper-cutouts-transparent.png'
                        alt='Print and cut out Monkey'
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
              <CardActionArea href='/summeracademy'>
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      md: 7,
                    }}
                  >
                    <CardHeader
                      avatar={<Hiking color='primary' />}
                      title='Ready for an Adventure?'
                      sx={{ pb: 0 }}
                      slotProps={{
                        title: {
                          variant: 'h5',
                          color: 'primary',
                          sx: {
                            fontWeight: 'bold',
                          },
                        },
                      }}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        Become a part of our community of practice by spending a
                        few days in Lugano.
                      </Typography>
                      <Typography
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          marginBottom: '16px',
                        }}
                      >
                        Learn new teaching approaches, exchange successes and
                        failures, and have fun!
                      </Typography>
                    </CardContent>
                  </Grid>
                  <Grid
                    sx={{ background: '#81B4E9' }}
                    size={{
                      xs: 12,
                      md: 5,
                    }}
                  >
                    <Box
                      sx={{
                        padding: 2,
                        position: 'relative',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                      }}
                    >
                      <Image
                        src='/PyTamaroAcademy-Banner.jpg'
                        alt='Alpe Foppa panorama'
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
