import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../../../components/NavigationBar';
import DarkCastleImage from '../../../../public/hoc/castle/DarkCastle.jpg';
import CertificateImage from '../../../../public/hoc/hour_of_code_certificate.jpg';
import FortezzaBellinzonaImage from '../../../../public/hoc/fortezza-bellinzona-castello3.png';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';
import { activityAssetPathname } from '../../../../src/urlUtils';

export default function FinishHocCastlePage() {
  return (
    <div>
      <Head>
        <title>Hour of Code: Program Your Own Castle: Finished!</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Hour of Code ® with PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Mission (Almost) Accomplished!
          </Typography>
          <Typography marginY={3} variant="h6" color="textSecondary">
            Your castle should help the Milanese to hold on to Bellinzona
            until the end of the century.
          </Typography>
          <Image
            src={DarkCastleImage}
            alt="Photo of Castle"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography marginY={3}>
            Despite your great construction,
            the French eventually will take over the city and its fortification,
            and they will ultimately leave it to the Swiss in 1503.
          </Typography>

          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              xs={12}
              sm={8}
            >
              <Typography marginTop={0} variant="h5" color="textSecondary" paragraph>
                Leonardo da Vinci: &ldquo;Tsunami Hit Your Castle!&rdquo;
              </Typography>
              <Typography marginY={3}>
                Unfortunately for the Swiss, on May 20, 1515,
                {' '}
                <strong>your castle will be hit by a tsunami wave</strong>
                {' '}
                that will destroy a big chunk of the walls!
                Sounds unbelievable? Well, read on!
              </Typography>
              <Typography marginY={3}>
                On September 30, 1513, in the so-called
                {' '}
                <a href="https://hls-dhs-dss.ch/de/articles/028662/2004-11-04/">Buzza di Biasca</a>
                ,
                a rock slide of about 500 million tons
                created a 60 meter high dam blocking the river
                in a valley above Bellinzona.
                Over time, this dam formed a lake
                that was 5 km long, 1.2 km wide, and 10 to 12 meters deep,
                and contained about 200 million cubic meters of water.
                On May 20, 1515, the dam broke,
                leading to a wave of water about 10 meters high
                coming down the valley.
                It hit the Bellinzona fortification walls with a speed of 40-60 km/h.
                While a large part of the fortification survived,
                this tsunami wave was massive enough flush away big chunks.
              </Typography>
              <Typography marginY={3}>
                This cataclysmic event made the news around Europe.
                Around that time, the famous
                {' '}
                <strong>Leonardo da Vinci</strong>
                {' '}
                drew
                {' '}
                <a href="https://insubricahistorica.ch/blog/2021/09/22/la-buzza-di-biasca-del-1515/">a sketch</a>
                {' '}
                that quite probably depicts the destruction of the Bellinzona fortification.
              </Typography>
              <Typography marginY={3}>
                Isn&apos;t it amazing that&mdash;over 500 years later&mdash;we
                know the exact dates of these events,
                and we can tell the volumes of rock slides
                and the heights and speeds of this &ldquo;Alpine tsunami wave&rdquo;?
                History can be fascinating!
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={4}
            >
              <Card>
                <CardContent>
                  <Typography gutterBottom variant="h5">
                    Claim Your Certificate!
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    To complete your Hour of Code,
                    please claim your certificate!
                  </Typography>
                </CardContent>
                <CardMedia>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={CertificateImage}
                      alt="Certificate"
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                </CardMedia>
                <CardContent>
                  <Typography marginY={0} align="center">
                    <NextLink href="https://code.org/api/hour/finish" passHref>
                      <Button
                        variant="contained"
                        size="large"
                      >
                        Complete Your Hour of Code and Get Your Certificate
                      </Button>
                    </NextLink>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>

          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              xs={12}
              sm={4}
            >
              <Card>
                <CardContent>
                  <Typography variant="h5" color="text.secondary" paragraph>
                    Keep
                    <br />
                    Your Castle
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You just composed your own castle.
                    Would you like to keep it?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    If you want to keep your castle,
                    navigate back to the last activity
                    and copy and paste the graphic or download it as an image.
                    You can even download the Python code you wrote,
                    so you can run it on your own computer later.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Your code is stored in your web browser,
                    so as long as you have access to your browser,
                    and nobody deletes your browser&apos;s local storage,
                    you can return to this web site and modify your castle.
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
                <CardContent>
                  <Typography variant="h5" color="text.secondary" paragraph>
                    Learn
                    <br />
                    Python Programming
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You just completed one hour of code.
                    We have much more!
                  </Typography>

                  <Carousel
                    interval={4000}
                    indicators={false}
                    sx={{ marginBottom: '20px' }}
                  >
                    {
                      [
                        {
                          author: 'luce',
                          activity: 'pacman-maze',
                          image: 'pacman-maze.svg',
                          background: 'black',
                        },
                        {
                          author: 'luce',
                          activity: 'chessboard',
                          image: 'chessboard.svg',
                          background: '#503a2f',
                        },
                        {
                          author: 'luce',
                          activity: 'swiss-hiking-signposts',
                          image: 'mountain-trail-signpost.svg',
                          background: '#4bac23',
                        },
                        {
                          author: 'luce',
                          activity: 'warming-stripes',
                          image: 'stripes.png',
                          background: 'white',
                        },
                        {
                          author: 'luce',
                          activity: 'isometric-bars',
                          image: 'isometric-bars.svg',
                          background: 'white',
                        },
                        {
                          author: 'luce',
                          activity: 'simple-box-plot',
                          image: 'simple-box-plot.svg',
                          background: 'white',
                        },
                      ].map((activity) => (
                        <CardMedia
                          key={`${activity.author}-${activity.activity}`}
                          component="img"
                          height={200}
                          image={activityAssetPathname(
                            activity.author,
                            activity.activity,
                            activity.image,
                          )}
                          sx={{ padding: 0.3, objectFit: 'contain', backgroundColor: activity.background }}
                        />
                      ))
                    }
                  </Carousel>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    This web site includes many graphics programming activities.
                    Some of them are used in informatics courses in Swiss high schools.
                    All of them are free and accessible without creating an account!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    If you want to learn Python from the ground up,
                    we recommend you start with our
                    {' '}
                    <Link href="/curricula/luce/welcome" component={NextLink}>
                      Welcome Curriculum
                    </Link>
                    .
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    If you want to explore the over 100 graphics programming activities,
                    check out the
                    {' '}
                    <Link href="/activities/luce/" component={NextLink}>
                      Activity Gallery
                    </Link>
                    .
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
                <CardContent>
                  <Typography variant="h5" color="textSecondary" paragraph>
                    Visit
                    <br />
                    Fortezza Bellinzona
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Learn more on the official
                    {' '}
                    <a href="https://fortezzabellinzona.ch/en/">Fortezza Bellinzona web site</a>
                    .
                  </Typography>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '20px',
                    marginBottom: '17px',
                  }}
                  >
                    <Image
                      src={FortezzaBellinzonaImage}
                      alt="Fortezza Bellinzona"
                      sizes="100vw"
                      style={{
                        width: '90%',
                        height: 'auto',
                      }}
                    />
                  </div>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    If you have a chance to visit Bellinzona,
                    in the Swiss canton of Ticino,
                    just south of the Alps,
                    visit this medieval fortress in person.
                    It is a UNESCO World Heritage Site
                    and it consists of three separate castles!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography marginY={3}>
            To finish your Hour of Code,
            please use the blue button above.
            It takes you to the Hour of Code web site,
            where you can claim your official certficiate.
            You can come back here by navigating back with your browser.
            Or you can bookmark this page.
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}
