import { Container, Link, Typography } from '@mui/material';
import Image from 'next/image';
import NextLink from 'next/link';
import PyTamaroLogo from '../public/PyTamaroLogo.png';

export default function PageFooter() {
  return (
    <Container maxWidth="lg" sx={{ mt: 'auto', mb: 2 }}>
      <Typography variant="body2" align="center" mt={6}>
        <Image
          src={PyTamaroLogo}
          alt="Logo of PyTamaro"
          sizes="100vw"
          style={{
            width: '2.5rem',
            height: 'auto',
          }}
        />
      </Typography>
      <Typography variant="body2" align="center" color="grey">
        PyTamaro is a project created by
        the&nbsp;
        <Link href="https://luce.si.usi.ch/">Lugano Computing Education Research Lab</Link>
        &nbsp;at the&nbsp;
        <Link href="https://si.usi.ch/">Software Institute</Link>
        &nbsp;of&nbsp;
        <Link href="https://www.usi.ch/">USI</Link>
      </Typography>
      <Typography variant="body2" align="center" color="grey" sx={{ mt: '1rem' }}>
        <Link component={NextLink} href="/privacy">Privacy Policy</Link>
        {' • '}
        {`Platform Version ${process.env.PLATFORM_VERSION}`}
        {process.env.BUILD_TIMESTAMP && ` (${new Date(process.env.BUILD_TIMESTAMP).toLocaleString()})`}
      </Typography>
    </Container>
  );
}
