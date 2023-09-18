import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import NavigationBar from '../../../components/NavigationBar';
import MarketingImage from '../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay.jpg';

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
            Hour of Code with PyTamaro
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            Congratulations!
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
            <NextLink href="/curricula/luce-hoc/hoc23" passHref>
              <Button
                variant="contained"
                size="large"
              >
                Get Your Certificate!
              </Button>
            </NextLink>
          </Typography>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Learn more about Python Programming
          </Typography>
          <Typography marginY={3} align="center">
            You just completed one hour of code.
            This PyTamaro web site includes free curricula and activities
            to learn more about Python programming.
          </Typography>

          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            Learn more about Medieval European History
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

        </Container>
      </Box>
    </div>
  );
}
