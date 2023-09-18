import {
  Box,
  Button,
  Container,
  Link,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../../components/NavigationBar';
import MarketingImage from '../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay.jpg';
import HourOfCodeFooter from '../../../components/HourOfCodeFooter';

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
          <Typography marginY={3}>
            Despite your great construction,
            the French eventually will take over the city and its fortification,
            and they will ultimately leave it to the Swiss in 1503.
          </Typography>

          <Image
            src={MarketingImage}
            alt="Photo of Castle"
            width="1261"
            height="831"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />

          <Typography marginY={3} align="center">
            If you want to keep your castle,
            navigate back to the last activity
            and copy and paste the graphic or download it as an image.
            You can even download the Python code you wrote,
            so you can run it on your own computer later.
          </Typography>
          <Typography marginY={3} align="center">
            Your code is stored in your web browser,
            so as long as you have access to your browser,
            and nobody deletes your browser&apos;s local storage,
            you can return to this web site and modify your castle.
          </Typography>
          <Typography marginY={3} align="center">
            <NextLink href="https://code.org/api/hour/finish" passHref>
              <Button
                variant="contained"
                size="large"
              >
                Complete Your Hour of Code and Get Your Certificate
              </Button>
            </NextLink>
          </Typography>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Learn more about Python Programming
          </Typography>
          <Typography marginY={3} align="center">
            You just completed one hour of code.
            This web site includes many more activities.
            Some of them are used in informatics courses in Swiss high schools.
            All of them are free and accessible without creating an account!
          </Typography>
          <Typography marginY={3} align="center">
            If you want to learn Python from the ground up,
            we recommend you start with our
            {' '}
            <Link href="/curricula/luce/welcome" component={NextLink}>
              Welcome Curriculum
            </Link>
            .
          </Typography>
          <Typography marginY={3} align="center">
            If you want to explore the over 100 graphics programming activities,
            check out the
            {' '}
            <Link href="/activities/luce/" component={NextLink}>
              Activity Gallery
            </Link>
            .
          </Typography>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Learn more about the Medieval Fortezza Bellinzona
          </Typography>
          <Typography marginY={3} align="center">
            You can learn more on the official
            {' '}
            <a href="https://fortezzabellinzona.ch/en/">Fortezza Bellinzona web site</a>
            .
            Or if you have a chance to visit Bellinzona,
            in the Swiss canton of Ticino,
            just south of the Alps,
            you could visit this medieval fortress in person.
            It is a UNESCO World Heritage Site
            and it consists of three separate castles!
          </Typography>
          <Typography marginY={3} align="center">
            The fortification used to stretch across the entire valley,
            until it was hit by a sequence of natural disasters.
            On September 30, 1513, in the so-called Buzza di Biasca,
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
          <Typography marginY={3} align="center">
            Isn&apos;t it amazing that&mdash;over 500 years later&mdash;
            we know the exact dates of these events,
            and we can tell the volumes of rock slides
            and the heights and speeds of this &ldquo;Alpine tsunami wave&rdquo;?
            History can be fascinating!
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}
