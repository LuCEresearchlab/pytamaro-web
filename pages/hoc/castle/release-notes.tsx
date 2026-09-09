import FeedbackIcon from '@mui/icons-material/Feedback';
import { Box, Button, Container, Typography } from '@mui/material';
import Head from 'next/head';
import NextLink from 'next/link';
import HourOfCodeFooter from '../../../components/HourOfCodeFooter';
import NavigationBar from '../../../components/navbar/NavigationBar';
import { translationProps } from '../../../src/serverSideTranslationProps';

export default function ReleaseNotesPage() {
  return (
    <div>
      <Head>
        <title>Hour of Code: Program Your Own Castle: Release Notes</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            paragraph
            sx={{
              marginTop: 5,
            }}
          >
            Hour of Code ® with PyTamaro
          </Typography>
          <Typography
            sx={{ mt: 2 }}
            variant='h4'
            align='center'
            color='textPrimary'
            gutterBottom
          >
            Program Your Own Castle
          </Typography>
          <Typography
            align='center'
            sx={{
              marginY: 3,
            }}
          >
            Created by students at USI, the Università della Svizzera italiana
          </Typography>

          <Typography
            align='center'
            sx={{
              marginY: 3,
            }}
          >
            <NextLink href='/hoc/castle' passHref>
              <Button variant='contained'>Landing Page</Button>
            </NextLink>{' '}
            <NextLink href='/hoc/castle/teacher-notes' passHref>
              <Button variant='contained'>Teacher Notes Page</Button>
            </NextLink>
          </Typography>

          <Typography variant='h2' color='textPrimary'>
            Release Notes
          </Typography>
          <Typography
            variant='h6'
            color='textSecondary'
            sx={{
              marginY: 3,
            }}
          >
            Our tutorial should be fully functional in English, Italian, and
            German. We are working on a French translation.
          </Typography>

          <Typography
            variant='h4'
            color='textSecondary'
            sx={{
              marginTop: 5,
            }}
          >
            Release 2023-11-06
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            Completed German translation. Improvements based on user observation
            session.
          </Typography>

          <Typography
            variant='h4'
            color='textSecondary'
            sx={{
              marginTop: 5,
            }}
          >
            Release 2023-10-15
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            Significantly expanded Teacher Notes (English version).
          </Typography>

          <Typography
            variant='h4'
            color='textSecondary'
            sx={{
              marginTop: 5,
            }}
          >
            Release 2023-09-30
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            Completed English and Italian versions. German version only
            partially translated.
          </Typography>

          <Typography
            variant='h6'
            color='textSecondary'
            sx={{
              marginY: 3,
            }}
          >
            If you find any problems or bugs, we would greatly appreciate if you
            could report them to us (e.g., by using the <FeedbackIcon /> button
            at the top right of the page).
          </Typography>

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
