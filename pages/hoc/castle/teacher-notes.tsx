import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import HourOfCodeFooter from '../../../components/HourOfCodeFooter';
import NavigationBar from '../../../components/navbar/NavigationBar';
import MarketingImage from '../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay-transparent.png';
import { translationProps } from '../../../src/serverSideTranslationProps';

type LangRes = {
  code: string;
  locale: {
    flag: string;
    name: string;
  };
  intro: {
    hoc: string;
    goal: string;
    notes: string;
  };
};

const RESOURCES: LangRes[] = [
  {
    code: 'en',
    locale: {
      flag: '🇺🇸',
      name: 'English',
    },
    intro: {
      hoc: 'Hour of Code',
      goal: 'Program Your Own Castle',
      notes: 'Teacher Notes',
    },
  },
  {
    code: 'it',
    locale: {
      flag: '🇮🇹',
      name: 'Italiano',
    },
    intro: {
      hoc: 'Ora del Codice',
      goal: 'Programma il tuo Castello',
      notes: 'Appunti per insegnanti',
    },
  },
  {
    code: 'de',
    locale: {
      flag: '🇩🇪',
      name: 'Deutsch',
    },
    intro: {
      hoc: 'Stunde des Codes',
      goal: 'Programmiere Deine Burg',
      notes: 'Informationen für Lehrpersonen',
    },
  },
];

export default function HocCastlePage() {
  return (
    <div>
      <Head>
        <title>Hour of Code: Teacher Notes</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <Image
            src={MarketingImage}
            alt='Photo of Castle'
            style={{
              display: 'block',
              margin: 'auto',
              width: '100%',
              height: 'auto',
            }}
          />

          <Grid container justifyContent='center' spacing={2}>
            {RESOURCES.map((lang) => (
              <Grid key={`lang_selector_${lang.code}`} size={4}>
                <Card elevation={1}>
                  <CardActionArea
                    href={`/hoc/castle/${lang.code}/teacher-notes`}
                  >
                    <CardContent>
                      <Typography
                        sx={{ fontSize: '2rem' }}
                        color='text.secondary'
                        gutterBottom
                      >
                        {lang.locale.flag}
                      </Typography>
                      <Typography variant='h5' component='div'>
                        {lang.locale.name}
                      </Typography>
                      <Typography variant='body1'>
                        {lang.intro.notes}
                      </Typography>
                      <Typography variant='caption'>
                        {lang.intro.hoc}
                      </Typography>
                      <Typography variant='body2'>{lang.intro.goal}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <HourOfCodeFooter />
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
