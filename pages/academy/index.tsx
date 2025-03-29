import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  GridLegacy as Grid,
  Link,
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
import Carousel from '../../components/Carousel';
import NavigationBar from '../../components/NavigationBar';
import Art from '../../public/alp-ancel-WKQt_X-SKFI-unsplash.jpg';
import Theory from '../../public/artturi-jalli-gYrYa37fAKI-unsplash.jpg';
import Summer2023CardImage from '../../public/events/2023-SA-CardImage.jpg';
import Summer2024CardImage from '../../public/events/2024-SA-CardImage.jpg';
import ZCU2024CardImage from '../../public/events/2024-ZCU-CardImage.jpg';
import HeroImage from '../../public/events/HeroUniversity.jpg';
import PanoramaAlpeFoppa from '../../public/PanoramaAlpeFoppa.jpg';
import PanoramaBottaChurch from '../../public/PanoramaBottaChurch.jpg';
import PanoramaCampusEst from '../../public/PanoramaCampusEst.jpg';
import PanoramaLuganoStazione from '../../public/PanoramaLuganoStazione.jpg';
import PanoramaMonteBoglia from '../../public/PanoramaMonteBoglia.jpg';
import PanoramaParcoCiani from '../../public/PanoramaParcoCiani.jpg';
import PanoramaPedalo from '../../public/PanoramaPedalo.jpg';
import PanoramaSanBernardino from '../../public/PanoramaSanBernardino.jpg';
import PanoramaSanSalvatore from '../../public/PanoramaSanSalvatore.jpg';
import PanoramaTamaroLemaDry from '../../public/PanoramaTamaroLemaDry.jpg';
import PanoramaTamaroLemaLugano from '../../public/PanoramaTamaroLemaLugano.jpg';
import PanoramaUSI from '../../public/PanoramaUSI.jpg';
import PyTamaroLogo from '../../public/PyTamaroLogo.png';
import { translationProps } from '../../src/serverSideTranslationProps';

export default function Academy() {
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
    tl.add(
      {
        targets: '.semicircle-left',
        translateX: '-5vw',
        endDelay: 1000,
      },
      '-=750',
    );
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
        <title>PyTamaro Academy</title>
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
          <Typography
            variant='h3'
            align='center'
            marginTop={6}
            marginBottom={3}
          >
            PyTamaro Academy @ USI in Lugano
          </Typography>
          <Typography align='center' marginY={3}>
            Workshops to support teachers who consider using PyTamaro in their
            classroom.
          </Typography>
          <Typography
            variant='h4'
            align='center'
            marginTop={6}
            marginBottom={3}
          >
            Upcoming Editions
          </Typography>
          <Typography align='center' marginY={3}>
            Are you interested in participating in one of our workshops to learn
            how to teach programming in an engaging but deep way? Would you like
            to bring along a group of fellow teachers? For a day? Or two? Or an
            entire week?{' '}
            <a href='mailto:Matthias.Hauswirth@usi.ch'>Contact us</a> to see
            whether we can organize a PyTamaro Academy workshop for you!
          </Typography>
          <Typography
            variant='h4'
            align='center'
            marginTop={6}
            marginBottom={3}
          >
            Prior Editions
          </Typography>
          <Grid container spacing={5} alignItems='flex-end'>
            {[
              {
                past: true,
                month: 'October',
                year: 2024,
                slug: 'zcu2024',
                title: 'PyTamaro Academy for ZCU',
                image: ZCU2024CardImage,
                description:
                  'A one-day workshop for 16 Czech pre-service and in-service teachers and teacher trainers.',
              },
              {
                past: true,
                month: 'July',
                year: 2024,
                slug: 'sa2024',
                title: 'PyTamaro Summer Academy',
                image: Summer2024CardImage,
                description:
                  'A week-long summer course for 6 Swiss high school and middle school teachers.',
              },
              {
                past: true,
                month: 'August',
                year: 2023,
                slug: 'sa2023',
                title: 'PyTamaro Summer Academy',
                image: Summer2023CardImage,
                description:
                  'A week-long summer course for 16 Swiss high & middle school teachers and students.',
              },
            ].map((instance) => (
              <Grid key={instance.slug} item xs={12} md={4}>
                <Card>
                  <CardActionArea
                    LinkComponent={NextLink}
                    href={`academy/${instance.slug}`}
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
                          src={instance.image}
                          alt='Photo by Artturi Jalli on Unsplash'
                          sizes='100vw'
                          style={{
                            width: '100%',
                            height: 'auto',
                          }}
                        />
                      </div>
                    </CardMedia>
                    <CardHeader
                      title={instance.title}
                      subheader={`${instance.month} ${instance.year}`}
                    />
                    <CardContent>
                      <Typography component='p' variant='body2'>
                        {instance.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size='small'>Learn More</Button>
                    </CardActions>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '2rem 0',
            }}
          />
        </Container>

        <Box
          sx={{
            minHeight: '8vw',
            position: 'relative',
            my: 2,
          }}
        >
          <div
            className='yin-yang-animation semicircle-left'
            style={{
              height: '8vw',
              width: '4vw',
              backgroundColor: 'white',
              left: 'calc(50% - 4vw)',
              zIndex: 2,
              borderRadius: '4vw 0 0 4vw',
            }}
          />
          <div
            className='yin-yang-animation semicircle-right'
            style={{
              height: '8vw',
              width: '4vw',
              backgroundColor: 'black',
              left: 'calc(50%)',
              zIndex: 2,
              borderRadius: '0 4vw 4vw 0',
            }}
          />
          <div
            className='yin-yang-animation eye-top'
            style={{
              height: '4vw',
              width: '4vw',
              backgroundColor: 'white',
              left: 'calc(50% - 2vw)',
              zIndex: 3,
              borderRadius: '50%',
            }}
          />
          <div
            className='yin-yang-animation eye-bottom'
            style={{
              height: '4vw',
              width: '4vw',
              backgroundColor: 'black',
              left: 'calc(50% - 2vw)',
              top: '4vw',
              zIndex: 3,
              borderRadius: '50%',
            }}
          />
          <div
            className='yin-yang-animation eye-top dot-top'
            style={{
              height: '1vw',
              width: '1vw',
              backgroundColor: 'black',
              left: 'calc(50% - .5vw)',
              top: '1.5vw',
              zIndex: 4,
              borderRadius: '50%',
            }}
          />
          <div
            className='yin-yang-animation eye-bottom dot-bottom'
            style={{
              height: '1vw',
              width: '1vw',
              backgroundColor: 'white',
              left: 'calc(50% - .5vw)',
              top: '5.5vw',
              zIndex: 4,
              borderRadius: '50%',
            }}
          />
        </Box>
        <Container maxWidth='lg' sx={{ marginTop: '25px' }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <AccountTreeIcon fontSize='large' color='primary' />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary='Problem Solving'
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary='Learn programming by decomposing graphics and recomposing them as programs.'
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TipsAndUpdatesIcon fontSize='large' color='primary' />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary='Theory & Creativity'
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary='Experience the sound theoretical foundations of programming combined with the unbounded creativity and playfulness of computer graphics.'
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Image width='32' alt='PyTamaro Logo' src={PyTamaroLogo} />
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: 24 } }}
                primary='Python & PyTamaro'
                secondaryTypographyProps={{ sx: { fontSize: 20 } }}
                secondary='Use the most prevalent programming language, Python, and the greatest (we think) educational graphics library, PyTamaro.'
              />
            </ListItem>
          </List>
        </Container>

        <Container maxWidth='lg' component='main'>
          <Typography
            variant='h4'
            align='center'
            marginTop={6}
            marginBottom={3}
          >
            Programming: Deep like Mathematics, Creative like Art
          </Typography>
        </Container>

        <Container maxWidth='lg' component='main'>
          <Grid container spacing={5} alignItems='flex-end'>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardMedia>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Image
                      src={Theory}
                      alt='Photo by Artturi Jalli on Unsplash'
                      sizes='100vw'
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                </CardMedia>
                <CardHeader
                  title='Theoretical Foundations'
                  subheader='Connect to Algebra and Logic'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    The contents is informed by concepts from algebra you might
                    know from middle school, all the way to abstract algebra and
                    logic one would learn at university.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card>
                <CardMedia>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Image
                      src={Art}
                      alt='Photo by Alp Ancel on Unsplash'
                      sizes='100vw'
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                </CardMedia>
                <CardHeader
                  title='Creativity &amp; Playfulness'
                  subheader='(De)Compose Art, Design, and Games'
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                />
                <CardContent>
                  <Typography component='p' variant='subtitle1'>
                    Starting with the composition of simple geometric shapes, we
                    will end up composing graphics inspired by contemporary art,
                    design, and game design.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        <Container maxWidth='lg' component='main'>
          <Typography
            variant='h4'
            align='center'
            marginTop={9}
            marginBottom={3}
          >
            Location
          </Typography>
        </Container>
        <Container maxWidth='lg'>
          <p>
            The PyTamaro Academy workshops take place at USI, the Università
            della Svizzera italiana, in beautiful Lugano. The USI Campus is
            within walking distance from the lake and the city center. There are
            trains, cable cars, and gondolas up many of the nearby mountains,
            several of them easily reachable on foot or by public
            transportation.
          </p>
          <Carousel>
            <Image
              key={0}
              src={PanoramaLuganoStazione}
              alt='Photo of Lugano Station'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={1}
              src={PanoramaAlpeFoppa}
              alt='Photo of Alpe Foppa'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={1.5}
              src={PanoramaCampusEst}
              alt='Photo of USI Campus Est'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={2}
              src={PanoramaBottaChurch}
              alt='Photo of Mario Botta Church'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={3}
              src={PanoramaMonteBoglia}
              alt='Photo of Monte Boglia'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={4}
              src={PanoramaParcoCiani}
              alt='Photo of Parco Ciani'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={5}
              src={PanoramaPedalo}
              alt='Photo of Lugano'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={6}
              src={PanoramaSanBernardino}
              alt='Photo of San Bernardino'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={7}
              src={PanoramaSanSalvatore}
              alt='Photo of San Salvatore'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={8}
              src={PanoramaTamaroLemaDry}
              alt='Photo of Tamaro-Lema Hike'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={9}
              src={PanoramaTamaroLemaLugano}
              alt='Photo of Tamaro-Lema Hike, View of Lugano'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Image
              key={10}
              src={PanoramaUSI}
              alt='Photo of USI'
              width='1280'
              height='285'
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
          </Carousel>
          <p>
            Lugano is full of hotels, many of them within walking distance from
            USI. Some examples are&nbsp;
            <a href='https://www.hotelcitylugano.ch/'>Hotel City</a>, right next
            to campus,&nbsp;
            <a href='https://www.hotellido-lugano.com/en/'>
              Hotel Lido Seegarten
            </a>
            , at the lake front, and&nbsp;
            <a href='https://www.hotelzurigo.ch/'>Hotel Zurigo Downtown</a>
            &nbsp;and&nbsp;
            <a href='https://www.pestalozzi-lugano.ch/en/'>Hotel Pestalozzi</a>,
            in the city center. And the&nbsp;
            <a href='https://www.youthhostel.ch/en/hostels/lugano'>
              Youth Hostel Lugano Savosa
            </a>
            &nbsp;has a swimming pool and palm trees, and includes breakfast!
            Like a hotel, but unlike AirBnBs, it also includes a&nbsp;
            <a href='https://www.ticino.ch/en/ticket.html'>Ticino Ticket</a>
            &nbsp;for free public transportation within Ticino.
          </p>
        </Container>

        <Container maxWidth='lg'>
          <Typography align='center' marginY={3}>
            The PyTamaro Academy is organized by the Lugano Computing Education
            Research Lab (<a href='https://luce.si.usi.ch/'>LuCE</a>) at the
            Software Institute of the Faculty of Informatics at USI.
          </Typography>
          <Typography align='center' marginY={3}>
            For more information contact&nbsp;
            <a href='mailto:Matthias.Hauswirth@usi.ch'>
              Matthias.Hauswirth@usi.ch
            </a>
            .
          </Typography>
        </Container>
        <Container maxWidth='lg' component='main'>
          <Typography
            variant='h4'
            align='center'
            marginTop={9}
            marginBottom={3}
          >
            Can&apos;t make it to Lugano?
          </Typography>
          <Typography align='center' marginY={3}>
            Check out the{' '}
            <Link component={NextLink} href='/teaching-resources'>
              teaching resources
            </Link>{' '}
            available on this site (and sign up for our newsletter).
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
