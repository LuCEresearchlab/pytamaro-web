import {
  Card, Typography, Container, Button, CardContent, CardActions, Paper, Box,
} from '@mui/material';
import Image from 'next/image';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import TypeIt from 'typeit-react';
import { useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TerminalIcon from '@mui/icons-material/Terminal';

const InfoCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const CenteredCardAction = styled(CardActions)(() => ({
  justifyContent: 'center',
}));

export default function Home() {
  const [demoOutputVisible, setDemoOutputVisible] = useState(false);

  return (
    <Container maxWidth="lg">
      <Image src="/PyTamaro-horizontal.png" alt="PyTamaro logo" width="945" height="284" />
      <Paper elevation={2} sx={{ bgcolor: '#222222', marginBottom: 4 }}>
        <Typography variant="h4" align="center" sx={{ fontFamily: 'monospace', color: 'white' }}>
          pip install pytamaro
        </Typography>
      </Paper>
      <Grid container spacing={4}>
        <Grid xs={12}>
          <InfoCard>
            <CardContent>
              <Typography variant="h5">
                Learn programming
                and practice problem decomposition skills with our learning modules
              </Typography>
            </CardContent>
            <CenteredCardAction>
              <Button startIcon={<SchoolIcon />} variant="contained" href="/modules">Learning modules</Button>
            </CenteredCardAction>
          </InfoCard>
        </Grid>
        <Grid xs={12}>
          <InfoCard>
            <CardContent>
              <Typography variant="h5">
                Read the documentation of every function available in PyTamaro
              </Typography>
            </CardContent>
            <CenteredCardAction>
              <Button startIcon={<MenuBookIcon />} variant="contained" href="https://pytamaro.readthedocs.org">Browse documentation</Button>
            </CenteredCardAction>
          </InfoCard>
        </Grid>
        <Grid xs={12}>
          <InfoCard>
            <CardContent>
              <Typography variant="h5">
                Play with the library directly in the browser!
                <Paper
                  elevation={3}
                  sx={{
                    bgcolor: '#222222', margin: 2, padding: 1, paddingBottom: 12,
                  }}
                >
                  <Typography textAlign="left" fontFamily="monospace" color="white">
                    <TypeIt
                      options={{
                        strings: ['from pytamaro import *', 'red_square = rectangle(100, 100, red)', 'show_graphic(red_square)'],
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
                    sx={{
                      float: 'left', width: '100px', height: '100px', border: 'none', backgroundColor: 'red', visibility: demoOutputVisible ? 'visible' : 'hidden',
                    }}
                  />
                  ;
                </Paper>
              </Typography>
            </CardContent>
            <CenteredCardAction>
              <Button startIcon={<TerminalIcon />} variant="contained" href="/playground">Start programming</Button>
            </CenteredCardAction>
          </InfoCard>
        </Grid>
      </Grid>
    </Container>
  );
}
