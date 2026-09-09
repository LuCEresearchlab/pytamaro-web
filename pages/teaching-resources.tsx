/* eslint-disable react/no-unescaped-entities */
import { Schema } from '@mui/icons-material';
import AccountBalance from '@mui/icons-material/AccountBalance';
import Hiking from '@mui/icons-material/Hiking';
import Print from '@mui/icons-material/Print';
import School from '@mui/icons-material/School';
import Translate from '@mui/icons-material/Translate';
import {
  Box,
  Button,
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
          <Typography textAlign='center' fontSize='1.2rem' sx={{ mb: 4 }}>
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
            textAlign='center'
            fontSize='1.2rem'
            sx={{ mb: 2, mt: 4 }}
          >
            Stay informed about new resources and updates?
          </Typography>
          <Typography textAlign='center' sx={{ mb: 2 }}>
            <Button
              variant='contained'
              size='large'
              href='mailto:matthias.hauswirth@usi.ch?subject=Sign%20me%20up%20for%20the%20PyTamaro%20Newsletter&body=Dear%20Matthias,%0D%0A%0D%0AMy%20name%20is%20xxxxx.%0D%0A%0D%0AI%20am%20teaching%20xxxxx%20at%20xxxxx.%0D%0A%0D%0AI%20would%20like%20to%20subscribe%20to%20the%20Luce%20PyTamaro%20newsletter.%0D%0A%0D%0AThanks!'
            >
              Sign up for our newsletter
            </Button>
          </Typography>
          <Typography textAlign='center' fontSize='0.8rem' sx={{ mb: 4 }}>
            This button is just a mailto link. It will open your email client so
            you can send us an email. This way we don't have to handle
            personally identifiable information on this web site.
          </Typography>
          <Stack spacing={4}>
            <Card elevation={4}>
              <CardActionArea href='/tamarocards'>
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      md: 7
                    }}>
                    <CardHeader
                      avatar={<School color='primary' />}
                      title='Unplugged Programming With TamaroCards!'
                      titleTypographyProps={{
                        variant: 'h5',
                        color: 'primary',
                        fontWeight: 'bold',
                      }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
                        Use our simple paper cards to teach programming with
                        PyTamaro.
                      </Typography>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
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
                      md: 5
                    }}>
                    <Box
                      position='relative'
                      height='100%'
                      alignItems='center'
                      justifyContent='center'
                      display='flex'
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
                      md: 7
                    }}>
                    <CardHeader
                      avatar={<Schema color='primary' />}
                      title='From Unplugged to Plugged TamaroCards With TIDE'
                      titleTypographyProps={{
                        variant: 'h5',
                        color: 'primary',
                        fontWeight: 'bold',
                      }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
                        TIDE is a web-based interactive environment for
                        TamaroCards with live evaluation of graphics and colors.
                      </Typography>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
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
                      md: 5
                    }}>
                    <Box
                      position='relative'
                      height='100%'
                      alignItems='center'
                      justifyContent='center'
                      display='flex'
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
                      md: 7
                    }}>
                    <CardHeader
                      avatar={<AccountBalance color='primary' />}
                      title='Explore the Mathematical Foundations of PyTamaro'
                      titleTypographyProps={{
                        variant: 'h5',
                        color: 'primary',
                        fontWeight: 'bold',
                      }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
                        Are you a mathematician? Then check this out!
                      </Typography>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
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
                      md: 5
                    }}>
                    <Box
                      padding={2}
                      position='relative'
                      height='100%'
                      alignItems='center'
                      justifyContent='center'
                      display='flex'
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
                      md: 7
                    }}>
                    <CardHeader
                      avatar={<Translate color='primary' />}
                      title='Find Out About Support for Multiple Languages'
                      titleTypographyProps={{
                        variant: 'h5',
                        color: 'primary',
                        fontWeight: 'bold',
                      }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
                        Unlike most libraries, PyTamaro is available in several
                        natural languages.
                      </Typography>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
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
                      md: 5
                    }}>
                    <Box
                      padding={2}
                      position='relative'
                      height='100%'
                      alignItems='center'
                      justifyContent='center'
                      display='flex'
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
                      md: 7
                    }}>
                    <CardHeader
                      avatar={<Print color='primary' />}
                      title='Print Ready-To-Cut Pieces From Your Own Graphic!'
                      titleTypographyProps={{
                        variant: 'h5',
                        color: 'primary',
                        fontWeight: 'bold',
                      }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
                        Do you want students to compose a graphic starting from
                        basic pieces?
                      </Typography>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
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
                      md: 5
                    }}>
                    <Box
                      padding={2}
                      position='relative'
                      height='100%'
                      alignItems='center'
                      justifyContent='center'
                      display='flex'
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
                      md: 7
                    }}>
                    <CardHeader
                      avatar={<Hiking color='primary' />}
                      title='Ready for an Adventure?'
                      titleTypographyProps={{
                        variant: 'h5',
                        color: 'primary',
                        fontWeight: 'bold',
                      }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
                        Become a part of our community of practice by spending a
                        few days in Lugano.
                      </Typography>
                      <Typography fontSize='1.1rem' paragraph gutterBottom>
                        Learn new teaching approaches, exchange successes and
                        failures, and have fun!
                      </Typography>
                    </CardContent>
                  </Grid>
                  <Grid
                    sx={{ background: '#81B4E9' }}
                    size={{
                      xs: 12,
                      md: 5
                    }}>
                    <Box
                      padding={2}
                      position='relative'
                      height='100%'
                      alignItems='center'
                      justifyContent='center'
                      display='flex'
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
