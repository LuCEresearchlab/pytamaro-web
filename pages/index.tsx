import {
  Typography, Container, Button, Paper, Box, Stack, Card, CardContent, CardActions,
} from '@mui/material';
import TypeIt from 'typeit-react';
import { useEffect, useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TerminalIcon from '@mui/icons-material/Terminal';
import anime from 'animejs';
import InstallDesktop from '@mui/icons-material/InstallDesktop';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Home() {
  const [demoOutputVisible, setDemoOutputVisible] = useState(false);

  useEffect(() => {
    const tl = anime.timeline({
      easing: 'easeOutCirc',
      duration: 750,
      loop: true,
      direction: 'alternate',
    });
    tl.add({
      targets: '#pytamaro-logo-text',
      translateX: '15vw',
      delay: 1000,
    });
    tl.add({
      targets: '#pytamaro-logo-symbol',
      translateX: '-6vw',
    }, '-=750');
    tl.add({
      targets: '#pytamaro-logo-right-lake',
      translateX: '9vw',
    });
    tl.add({
      targets: '#pytamaro-logo-left-lake',
      translateX: '-9vw',
    });
    tl.add({
      targets: '#pytamaro-logo-right-lake',
      rotate: 180,
    });
    tl.add({
      targets: '#pytamaro-logo-left-lake',
      rotate: -180,
      endDelay: 1500,
    });
  }, []);

  return (
    <Container maxWidth="lg">
      <Box height="100vh">
        <Box
          display="flex"
          justifyContent="center"
          paddingTop="30vh"
          paddingBottom="10vh"
        >
          <svg viewBox="0 0 600 108" display="block" width="40vw" overflow="visible">
            <g id="pytamaro-logo-text">
              <path transform="translate(175.814 86.6026)" d="M18.3105 -60.9863L33.8867 -60.9863Q38.2812 -61.084 41.6016 -58.9844Q43.7988 -57.7148 45.0195 -55.5176Q46.1914 -53.0762 46.1914 -49.5117Q46.1914 -45.2148 43.3105 -41.6992Q40.2832 -38.0859 34.2773 -37.9883L18.3105 -37.9883L18.3105 -60.9863ZM7.51953 0L18.3105 0L18.3105 -27.7832L34.7168 -27.7832Q45.7031 -27.9785 51.416 -34.8145Q56.9824 -41.3086 56.9824 -49.2188Q56.9824 -55.0781 54.7852 -59.375Q52.6855 -63.8184 49.3164 -66.2109Q45.3125 -69.3848 41.4062 -70.4102Q37.5 -71.1914 33.3008 -71.1914L7.51953 -71.1914L7.51953 0ZM76.7578 -2.00195L73.9746 6.49414Q73.291 8.69141 71.582 9.81445Q69.873 10.8887 67.8711 10.8887L64.8926 10.8887L64.8926 20.5078L68.2617 20.5078Q72.998 20.5078 76.7578 18.4082Q80.4688 16.2109 82.5684 10.498L104.395 -50.6836L93.5547 -50.6836L81.5918 -15.1855L81.3965 -15.1855L69.3848 -50.6836L58.5938 -50.6836L76.7578 -2.00195ZM123.242 0L134.082 0L134.082 -61.5723L153.564 -61.5723L153.564 -71.1914L103.76 -71.1914L103.76 -61.5723L123.242 -61.5723L123.242 0ZM186.865 0L197.07 0L197.07 -34.6191Q196.973 -43.8965 191.26 -47.7051Q185.547 -51.416 175.977 -51.3184Q164.648 -51.5137 158.838 -43.8965L166.846 -37.793Q168.164 -39.9902 170.459 -40.918Q172.656 -41.6992 176.465 -41.6992Q186.963 -41.8945 186.865 -35.2051L186.865 -29.8828L172.754 -29.8828Q164.648 -29.7852 160.449 -25.4883Q156.25 -21.2891 156.25 -14.8926Q156.25 -8.20312 161.084 -3.90625Q165.674 0.488281 174.17 0.585938Q179.346 0.585938 182.275 -0.683594Q185.254 -1.9043 186.67 -4.49219L186.865 -4.49219L186.865 0ZM186.865 -17.8223Q186.865 -12.1094 184.473 -10.498Q181.836 -8.88672 175.439 -8.98438Q170.361 -8.98438 168.164 -10.9863Q165.869 -12.793 165.869 -15.3809Q165.771 -21.2891 174.658 -21.4844L186.865 -21.4844L186.865 -17.8223ZM210.84 0L221.045 0L221.045 -30.1758Q221.045 -35.498 223.975 -38.2812Q226.758 -41.1133 231.152 -41.1133Q235.547 -41.1133 238.379 -38.2812Q241.162 -35.498 241.162 -30.1758L241.162 0L251.367 0L251.367 -30.1758Q251.367 -35.498 254.248 -38.2812Q257.08 -41.1133 261.475 -41.1133Q265.869 -41.1133 268.652 -38.2812Q271.436 -35.498 271.436 -30.1758L271.436 0L281.641 0L281.641 -33.6914Q281.445 -42.3828 276.27 -46.875Q271.045 -51.3184 264.746 -51.3184Q254.736 -51.416 248.779 -44.6777Q246.143 -47.6074 242.969 -49.5117Q239.746 -51.2207 234.473 -51.3184Q226.27 -51.3184 221.24 -45.3125L221.045 -45.3125L221.045 -50.6836L210.84 -50.6836L210.84 0ZM322.07 0L332.275 0L332.275 -34.6191Q332.178 -43.8965 326.465 -47.7051Q320.752 -51.416 311.182 -51.3184Q299.854 -51.5137 294.043 -43.8965L302.051 -37.793Q303.369 -39.9902 305.664 -40.918Q307.861 -41.6992 311.67 -41.6992Q322.168 -41.8945 322.07 -35.2051L322.07 -29.8828L307.959 -29.8828Q299.854 -29.7852 295.654 -25.4883Q291.455 -21.2891 291.455 -14.8926Q291.455 -8.20312 296.289 -3.90625Q300.879 0.488281 309.375 0.585938Q314.551 0.585938 317.48 -0.683594Q320.459 -1.9043 321.875 -4.49219L322.07 -4.49219L322.07 0ZM322.07 -17.8223Q322.07 -12.1094 319.678 -10.498Q317.041 -8.88672 310.645 -8.98438Q305.566 -8.98438 303.369 -10.9863Q301.074 -12.793 301.074 -15.3809Q300.977 -21.2891 309.863 -21.4844L322.07 -21.4844L322.07 -17.8223ZM345.459 0L355.664 0L355.664 -30.5176Q355.762 -36.084 358.887 -38.5742Q361.67 -41.1133 365.576 -41.1133Q369.043 -41.1133 372.266 -38.5742L379.688 -47.4121Q375.146 -51.2207 369.043 -51.3184Q360.889 -51.3184 355.859 -45.3125L355.664 -45.3125L355.664 -50.6836L345.459 -50.6836L345.459 0ZM381.885 -25.3906Q381.885 -17.3828 383.203 -13.1836Q384.57 -8.98438 387.402 -5.9082Q389.502 -3.51562 393.262 -1.61133Q396.973 0.488281 402.783 0.585938Q408.789 0.488281 412.5 -1.61133Q414.502 -2.49023 415.771 -3.71094Q417.188 -4.78516 418.164 -5.9082Q421.191 -8.98438 422.461 -13.1836Q423.682 -17.3828 423.682 -25.3906Q423.682 -33.3984 422.461 -37.6953Q421.191 -41.8945 418.164 -44.7754Q416.162 -47.3145 412.5 -49.3164Q408.789 -51.2207 402.783 -51.3184Q396.973 -51.2207 393.262 -49.3164Q389.502 -47.3145 387.402 -44.7754Q384.57 -41.8945 383.203 -37.6953Q381.885 -33.3984 381.885 -25.3906ZM413.477 -25.293Q413.477 -20.1172 412.988 -17.6758Q412.5 -15.1855 410.986 -13.2812Q409.863 -11.8164 407.666 -10.6934Q405.566 -9.61914 402.783 -9.61914Q400.195 -9.61914 397.998 -10.6934Q395.898 -11.8164 394.58 -13.2812Q393.262 -15.1855 392.676 -17.6758Q392.09 -20.1172 392.09 -25.3906Q392.09 -30.7129 392.676 -33.2031Q393.262 -35.5957 394.58 -37.4023Q395.898 -39.1113 397.998 -40.0879Q400.195 -41.1133 402.783 -41.1133Q405.566 -41.1133 407.666 -40.0879Q409.863 -39.1113 410.986 -37.4023Q412.5 -35.5957 412.988 -33.2031Q413.477 -30.7129 413.477 -25.293Z" />
            </g>
            <g id="pytamaro-logo-symbol">
              {/* Center offset +(25, 21.6507) */}
              <g id="pytamaro-logo-right-lake" transform-origin="125 64.9521">
                <path fill="#008BCB" transform="matrix(-1 0 0 -1 150 43.3013)" d="M0 0L50 0L25 -43.3013L0 0Z" />
              </g>
              <g id="pytamaro-logo-mountain">
                <path fill="#D2071D" transform="translate(25 86.6026)" d="M0 0L100 0L50 -86.6025L0 0Z" />
              </g>
              <g id="pytamaro-logo-left-lake" transform-origin="25 64.9521">
                <path fill="#008BCB" transform="matrix(-1 0 0 -1 50 43.3013)" d="M0 0L50 0L25 -43.3013L0 0Z" />
              </g>
            </g>
          </svg>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={{ xs: 4, md: 8 }} sx={{ my: 4 }}>
          <Button startIcon={<SchoolIcon />} variant="outlined" size="large" href="/modules">Learning Activities</Button>
          <Button startIcon={<MenuBookIcon />} variant="outlined" size="large" href="https://pytamaro.readthedocs.org">Documentation</Button>
          <Button startIcon={<InstallDesktop />} variant="outlined" size="large" href="/install">How to Install & FAQ</Button>
          <Button startIcon={<TerminalIcon />} variant="outlined" size="large" href="/playground">Try in the browser</Button>
        </Stack>
        <ExpandMoreIcon
          fontSize="large"
          color="primary"
          sx={{
            position: 'absolute', bottom: '1vh', left: 0, right: 0, margin: 'auto',
          }}
        />
      </Box>
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">
                Program with graphics, requiring very little
              </Typography>
              <Typography variant="body1">
                We minimize the number of required Python language features,
                so that you can focus on the essential!
              </Typography>
              <Paper
                elevation={3}
                sx={{
                  bgcolor: '#222222', margin: 2, padding: 1, paddingBottom: 12, borderRadius: 4,
                }}
              >
                <Typography textAlign="left" fontFamily="Monaco" color="white" minHeight={90}>
                  <TypeIt
                    options={{
                      strings: ['from pytamaro import *', 'target = rectangle(200, 100, red)', 'show_graphic(target)'],
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
                    float: 'left', width: '10vw', height: '5vw', border: 'none', backgroundColor: 'red', visibility: demoOutputVisible ? 'visible' : 'hidden',
                  }}
                />
                ;
              </Paper>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h5">
                Discover our Summer Academy
              </Typography>
              <Typography variant="body1">
                Join us for five days of learning and fun!
              </Typography>
              <CardActions>
                <Button variant="outlined" href="/summeracademy">Learn more</Button>

              </CardActions>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Container>
  );
}
