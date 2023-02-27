import {
  Typography, Container, Button, Paper, Box, Stack,
} from '@mui/material';
import Image from 'next/image';
import TypeIt from 'typeit-react';
import { useEffect, useRef, useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TerminalIcon from '@mui/icons-material/Terminal';
import anime from 'animejs';
import { InstallDesktop } from '@mui/icons-material';

export default function Home() {
  const [demoOutputVisible, setDemoOutputVisible] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    if (demoOutputVisible) {
      const middle = animRef.current.offsetWidth / 2;
      const tl = anime.timeline({
        easing: 'easeOutQuad',
        duration: 750,
        loop: true,
      });
      tl.add({
        targets: '.harm',
        opacity: 1,
        easing: 'linear',
        delay: 2000,
      });
      tl.add({
        targets: '.harm',
        translateX: middle - 100,
      });
      tl.add({
        targets: '.varm',
        opacity: 1,
        easing: 'linear',
      });
      tl.add({
        targets: '.varm',
        rotate: 90,
      });
      tl.add({
        targets: '.varm',
        translateY: -(middle - 30 - 70),
      });
      tl.add({
        targets: '.swiss-flag-background',
        opacity: 1,
        easing: 'linear',
      });
      tl.add({
        targets: '.swiss-flag-background',
        translateX: middle - 160,
        endDelay: 1500,
      });
    }
  }, [animRef, demoOutputVisible]);

  return (
    <Container maxWidth="lg">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Image src="/PyTamaro-horizontal.png" alt="PyTamaro logo" width="472" height="142" />
      </div>
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#222222', margin: 2, padding: 1, paddingBottom: 12, borderRadius: 4,
          }}
        >
          <Typography textAlign="left" fontFamily="Monaco" color="white" minHeight={90}>
            <TypeIt
              options={{
                strings: ['from pytamaro import *', 'target = ellipse(100, 100, yellow)', 'show_graphic(target)'],
                speed: 20,
                waitUntilVisible: true,
                afterComplete: () => {
                  setTimeout(() => setDemoOutputVisible(true), 200);
                },
              }}
            />
          </Typography>
          <Box
            marginTop={1}
            marginLeft={4}
            sx={{
              float: 'left', width: '100px', height: '100px', border: 'none', borderRadius: '50%', backgroundColor: 'yellow', visibility: demoOutputVisible ? 'visible' : 'hidden',
            }}
          />
          ;
        </Paper>
      </Container>
      <Stack direction="row" justifyContent="space-between" spacing={8} sx={{ my: 4 }}>
        <Button startIcon={<SchoolIcon />} variant="outlined" size="large" href="/modules">Learning Activities</Button>
        <Button startIcon={<MenuBookIcon />} variant="outlined" size="large" href="https://pytamaro.readthedocs.org">Documentation</Button>
        <Button startIcon={<InstallDesktop />} variant="outlined" size="large" href="/install">Installation Guide</Button>
        <Button startIcon={<TerminalIcon />} variant="outlined" size="large" href="/playground">Try in the browser</Button>
      </Stack>
      <Box
        ref={animRef}
        sx={{
          minHeight: '400px', display: 'grid', margin: 2, alignItems: 'center',
        }}
      >
        <div
          className="harm swiss-flag-arm swiss-flag-animation"
          style={{ zIndex: 2 }}
        />
        <div
          className="varm swiss-flag-arm swiss-flag-animation"
          style={{ zIndex: 1 }}
        />
        <div
          className="swiss-flag-background swiss-flag-animation"
          style={{ zIndex: 0 }}
        />
      </Box>
    </Container>
  );
}
