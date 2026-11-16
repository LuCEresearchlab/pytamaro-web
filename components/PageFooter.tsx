import { Container, Link, Typography } from '@mui/material';
import { Trans } from 'next-i18next';
import Image from 'next/image';
import NextLink from 'next/link';
import PyTamaroLogo from '../public/PyTamaroLogo.png';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

export default function PageFooter() {
  const { i18n, t } = useLocalTranslation(['common']);
  const buildTimestamp =
    process.env.BUILD_TIMESTAMP !== undefined
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: 'long',
          timeStyle: 'long',
          timeZone: 'UTC',
        }).format(new Date(parseInt(process.env.BUILD_TIMESTAMP, 10)))
      : undefined;

  return (
    <Container maxWidth='lg' sx={{ mt: 'auto', mb: 2 }}>
      <Typography
        variant='body2'
        align='center'
        sx={{
          mt: 6,
        }}
      >
        <Image
          src={PyTamaroLogo}
          alt={t('footer.logoAlt')}
          sizes='100vw'
          style={{
            width: '2.25rem',
            height: 'auto',
          }}
        />
      </Typography>
      <Typography variant='body2' align='center' color='textSecondary'>
        <Trans
          i18nKey='footer.projectDescription'
          components={{
            lab: <Link href='https://luce.si.usi.ch/' />,
            institute: <Link href='https://si.usi.ch/' />,
            university: <Link href='https://www.usi.ch/' />,
          }}
        />
      </Typography>
      <Typography
        variant='body2'
        align='center'
        color='textSecondary'
        sx={{
          mt: 1,
        }}
      >
        <Link component={NextLink} href='/privacy'>
          {t('footer.privacyPolicy')}
        </Link>
        {' • '}
        {`${t('footer.platformVersion', {
          version: process.env.PLATFORM_VERSION,
        })}${buildTimestamp !== undefined ? ` (${buildTimestamp})` : ''}`}
      </Typography>
    </Container>
  );
}
