import { PlayArrow } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import HOCTrackingPixel from '../../../../components/HOCTrackingPixel';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';
import NavigationBar from '../../../../components/NavigationBar';
import Valleys from '../../../../public/hoc/castle/BellinzonaAndValleysMap1862-sepia.gif';
import MarketingImage from '../../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay-transparent.png';

export default function HocCastlePage() {
  return (
    <div>
      <Head>
        <title>Hour of Code: Program Your Own Castle</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Hour of Code ® with PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Program Your Own Castle
          </Typography>
          <Typography marginY={3} variant="h6" color="textSecondary">
            Welcome to the year 1430. You are the chief architect of the Duke of Milan.
            The Duke needs to protect his lands from the Swiss,
            who like to attack from the mountainous north.
          </Typography>

          <Image
            src={Valleys}
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
            The Duke asks you to
            {' '}
            <strong>build a fortification</strong>
            {' '}
            that spans across the entire valley.
            He chose the city of Bellinzona as the perfect location,
            so he can control access to several mountain passes at a single point.
          </Typography>

          <Typography marginY={3}>
            The Duke is a modern ruler: he likes to use the latest technology.
            He has heard about a new technology called
            {' '}
            <strong>programming</strong>
            .
            He wants you to write a Python program to design the fortification.
            The Duke likes castles composed from independent pieces.
            In Python you can do that
            by calling pure functions to produce and compose pieces.
          </Typography>

          <Image
            priority
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

          <Typography marginY={3}>
            <strong>If you succeed</strong>
            ,
            the Milanese will be able to hold on to Bellinzona until the end of the century,
            when the French take over the city with its three castles and ramparts
            and ultimately leave it to the Swiss in 1503.
          </Typography>

          <Typography marginY={3}>
            <strong>If you fail</strong>
            ,
            we will have to rewrite history.
            And we&apos;d rather not do that!
          </Typography>

          <Typography marginY={3} align="center">
            <NextLink href="/curricula/luce-hoc/castle" passHref>
              <Button
                startIcon={<PlayArrow />}
                variant="contained"
                size="large"
              >
                Start Building!
              </Button>
            </NextLink>
          </Typography>

          <Typography marginY={3} align="center">
            Good Luck!
          </Typography>
          <Typography marginY={3} align="center">
            By the way: The real
            {' '}
            <a href="https://fortezzabellinzona.ch/en/">Fortezza Bellinzona</a>
            {' '}
            is a UNESCO World Heritage Site.
            So you have a lot to live up to!
          </Typography>
          <HOCTrackingPixel />
          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}
