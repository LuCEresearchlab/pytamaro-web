import {
  Card, Typography, Container, Button, CardContent, CardActions, Paper,
} from '@mui/material';
import Image from 'next/image';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

const InfoCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const CenteredCardAction = styled(CardActions)(() => ({
  justifyContent: 'center',
}));

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Image src="/PyTamaro-horizontal.png" alt="PyTamaro logo" width="945" height="284" />
      <Paper elevation={3} sx={{ bgcolor: '#222222', marginBottom: 4 }}>
        <Typography variant="h4" align="center" sx={{ fontFamily: 'monospace', color: 'white' }}>
          pip install pytamaro
        </Typography>
      </Paper>
      <Grid container spacing={4}>
        <Grid xs={6}>
          <InfoCard>
            <CardContent>
              <Typography variant="h5">
                Learn programming
                and practice problem decomposition skills with our learning modules
              </Typography>
            </CardContent>
            <CenteredCardAction>
              <Button variant="contained" href="/modules">Browse modules</Button>
            </CenteredCardAction>
          </InfoCard>
        </Grid>
        <Grid xs={6}>
          <InfoCard>
            <CardContent>
              <Typography variant="h5">
                Read the documentation of every function available in PyTamaro
              </Typography>
            </CardContent>
            <CenteredCardAction>
              <Button variant="contained" href="https://pytamaro.readthedocs.org">Browse documentation</Button>
            </CenteredCardAction>
          </InfoCard>
        </Grid>
      </Grid>
    </Container>
  );
}
