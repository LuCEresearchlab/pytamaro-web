/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
import { PlayArrow } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import { Trans } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import HOCTrackingPixel from '../../../../components/HOCTrackingPixel';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';
import NavigationBar from '../../../../components/NavigationBar';
import Valleys from '../../../../public/hoc/castle/BellinzonaAndValleysMap1862-sepia.gif';
import MarketingImage from '../../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay-transparent.png';
import useLocalTranslation from '../../../../src/localStorage/useLocalTranslation';
import { locales, translationProps } from '../../../../src/serverSideTranslationProps';

export default function HocCastlePage() {
  const router = useRouter();
  const language = router.query.language as string;
  const { i18n } = useLocalTranslation(['hourofcode']);
  const t = i18n.getFixedT(language, 'hourofcode');
  return (
    <div>
      <Head>
        <title>{t('start.title')}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography marginTop={5} variant="h5" align="center" color="textSecondary" paragraph>
            {t('hourOfCodeWithPyTamaro')}
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            {t('start.programYourOwnCastle')}
          </Typography>
          <Typography marginY={3} variant="h6" color="textSecondary">
            {t('start.welcome')}
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
            <Trans t={t} i18nKey="start.build" components={{ strong: <strong /> }} />
          </Typography>

          <Typography marginY={3}>
            <Trans t={t} i18nKey="start.technology" components={{ strong: <strong /> }} />
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
            <Trans t={t} i18nKey="start.succeed" components={{ strong: <strong /> }} />
          </Typography>

          <Typography marginY={3}>
            <Trans t={t} i18nKey="start.fail" components={{ strong: <strong /> }} />
          </Typography>

          <Typography marginY={3} align="center">
            <NextLink href="/curricula/luce-hoc/castle" passHref>
              <Button
                startIcon={<PlayArrow />}
                variant="contained"
                size="large"
              >
                {t('start.startBuilding')}
              </Button>
            </NextLink>
          </Typography>

          <Typography marginY={3} align="center">
            {t('start.goodLuck')}
          </Typography>
          <Typography marginY={3} align="center">
            <Trans t={t} i18nKey="start.unesco" components={{ a: <a href={t('start.fortezzaURL')} /> }} />
          </Typography>
          <HOCTrackingPixel />
          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...await translationProps(['hourofcode']),
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: locales.map((locale) => ({ params: { language: locale } })),
    fallback: false,
  };
}
