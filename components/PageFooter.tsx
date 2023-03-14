import Image from 'next/image';
import { Container, Link, Typography } from '@mui/material';
import PyTamaroLogo from '../public/PyTamaroLogo.png';

export default function PageFooter() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 2 }}>
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
    </Container>
  );
}
