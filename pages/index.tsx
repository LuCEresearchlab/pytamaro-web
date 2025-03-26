/* eslint-disable @next/next/no-img-element */
import { useMonaco } from '@monaco-editor/react';
import {
  Download,
  PlayCircle, Route, School, Science, TipsAndUpdates,
} from '@mui/icons-material';
import {
  Badge,
  BadgeProps,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Container,
  Link,
  styled,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { shuffle } from 'lodash';
import { useEffect } from 'react';
import anime from 'animejs';
import Head from 'next/head';
import Image from 'next/image';
import Carousel from 'react-material-ui-carousel';
import ActivityCardMedia from '../components/ActivityCardMedia';
import NavigationBar from '../components/NavigationBar';
import ExecutionOutputArea from '../components/OutputArea';
import { registerCustomPythonLanguage, STRICT_PYTHON3_LANG_ID } from '../components/editor/strictPython3';
import { COLORIZE_CLASSNAME, colorizeElements, configureEditor } from '../components/editor/utils';
import { basicActivities, listVisibleActivities } from '../src/fs-content/activities';
import { BasicActivity } from '../src/schemas/activitySchema';
import { translationProps } from '../src/serverSideTranslationProps';
import { joinLines } from '../src/sourceUtils';
import theme from '../src/theme';
import {
  aboutPathname,
  activitiesByAuthorPathname,
  curriculaPathname,
  playgroundPathname,
  teachingResourcesPathname,
} from '../src/urlUtils';
import PanoramaAlpeFoppa from '../public/AlpeFoppa.jpg';

configureEditor();

const PythonBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1.8rem',
    top: '1rem',
    minWidth: '2rem',
  },
  width: '100%',
}));

function PythonCodeCard({
  lines,
  preludeLines = [],
  stdout,
  pytamaro = false,
} : {
  lines: string[],
  preludeLines?: string[],
  stdout: string,
  pytamaro?: boolean,
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <PythonBadge
        badgeContent={(
          // eslint-disable-next-line @next/next/no-img-element
          <div>
            <img
              src="/python-logo.svg"
              style={{
                height: '2em', width: 'auto', transform: pytamaro ? 'none' : 'translateX(1em)',
              }}
              alt="Python logo"
            />
            {pytamaro && (
              <img
                src="/favicon.ico"
                style={{
                  height: '2em', width: 'auto', transform: 'translateY(-0.2em)',
                }}
                alt="PyTamaro logo"
              />
            )}
          </div>
        )}
      >
        <CardContent sx={{ overflowX: 'auto' }}>
          <Box
            className={COLORIZE_CLASSNAME}
            data-lang={STRICT_PYTHON3_LANG_ID}
            sx={{
              fontFamily: theme.pytamaro.monospaceFontFamily, whiteSpace: 'pre', fontVariantLigatures: 'none',
            }}
          >
            {joinLines(lines)}
          </Box>
          {pytamaro && (
            <Button
              variant="outlined"
              size="small"
              href={playgroundPathname(joinLines([...preludeLines, ...lines]))}
              sx={{ position: 'absolute', bottom: '.5rem', right: '.5rem' }}
              endIcon={<PlayCircle />}
            >
              Try it!
            </Button>
          )}
        </CardContent>
      </PythonBadge>
      <ExecutionOutputArea
        executionError={false}
        executionResponse={{
          stdout,
          stderr: '',
          type: 'success',
        }}
        sx={{ border: 0, height: '100%' }}
      />
    </Card>
  );
}

export default function Home({ activities }:
  { activities: BasicActivity[] }) {
  const featuredActivities = shuffle(activities.filter((activity) => activity.visibility === 'featured'));

  useEffect(() => {
    const tl = anime.timeline({
      easing: 'easeOutCirc',
      duration: 750,
      loop: true,
      direction: 'alternate',
    });
    tl.add({
      targets: '#pytamaro-logo-text',
      translateX: '15rem',
      delay: 1000,
    });
    tl.add({
      targets: '#pytamaro-logo-symbol',
      translateX: '-6rem',
    }, '-=750');
    tl.add({
      targets: '#pytamaro-logo-right-lake',
      translateX: '9rem',
    });
    tl.add({
      targets: '#pytamaro-logo-left-lake',
      translateX: '-9rem',
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

  const monaco = useMonaco();

  useEffect(() => {
    registerCustomPythonLanguage(monaco);
    colorizeElements(monaco);
  }, [monaco]);

  return (
    <div>
      <Head>
        <title>PyTamaro</title>
        <meta name="description" content="PyTamaro: Learn programming in Python with graphics. Explore activities connected to data science, colors, animations, and more. Completely free, in your browser!" />
      </Head>
      <NavigationBar home>
        <Button
          variant="contained"
          href={playgroundPathname()}
          endIcon={<PlayCircle />}>
          Playground
        </Button>
      </NavigationBar>
      <Image
        src={PanoramaAlpeFoppa}
        alt="Photo of Alpe Foppa"
        width="2048"
        height="576"
        sizes="100vw"
        style={{
          width: "100%",
          height: "auto",
          minHeight: "15vh",
          maxHeight: "min(20vh, 576px)",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <Container maxWidth="xl">
        {/* Image spacing */}
        <div style={{ height: "16vh" }} />

        <Box
          display="flex"
          justifyContent="center"
          paddingY={3}
        >
          <Box sx={{ width: { xs: '35vw', md: '25vw', xl: '15vw' } }}>
            <svg viewBox="0 0 600 108" display="block" overflow="visible">
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
        </Box>
        <Typography variant="h3" fontWeight="bold" textAlign="center" mb={8} sx={{ textWrap: 'balance' }}>
          Learn
          {' '}
          <Typography variant="h3" fontWeight="bold" component="span" color="primary">Programming</Typography>
          {' '}
          in Python with
          {' '}
          <Typography variant="h3" fontWeight="bold" component="span" color={theme.pytamaro.redColor}>Graphics</Typography>
        </Typography>
        <Typography variant="h5" align="center" marginY={2} fontWeight="bold">Start Simple By Calling Functions</Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <PythonCodeCard
              lines={[
                'root = sqrt(2)',
                'print(root)',
              ]}
              stdout="1.4142135623730951"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <PythonCodeCard
              pytamaro
              lines={[
                'field = rectangle(100, 60, green)',
                'show_graphic(field)',
              ]}
              preludeLines={['from pytamaro import rectangle, green, show_graphic', '']}
              stdout="@@@PYTAMARO_DATA_URI_BEGIN@@@data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAA8CAYAAACQPx/OAAAApklEQVR4nO3RQQ0AIBDAsAP/nuGNAvZoFSzZmjNnyNi/A3gZEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIzAWnWQJ2gmwaEgAAAABJRU5ErkJggg==@@@PYTAMARO_DATA_URI_END@@@"
            />
          </Grid>
        </Grid>
        <Typography variant="h5" align="center" marginY={2} fontWeight="bold">Define Functions</Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <PythonCodeCard
              lines={[
                'def add(a, b):',
                '    return a + b',
                'print(add(2, 3))',
              ]}
              stdout="5"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <PythonCodeCard
              pytamaro
              lines={[
                'def circle(diameter, color):',
                '    return ellipse(diameter, diameter, color)',
                'show_graphic(circle(75, red))',
              ]}
              preludeLines={['from pytamaro import ellipse, red, show_graphic', '']}
              stdout="@@@PYTAMARO_DATA_URI_BEGIN@@@data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAEL0lEQVR4nO2czW8UZRzHP88QEA/FeFALQltjfDkYDyVAUg8tLyEYjamJF4nGgwc4wn9Qb6AXuHHwwAESiJf1JdHEEwkEgsb3pGCiVIpS0kbrDUvxy+HZLbPT2d0Zdmee51nmk/yS2d1J+30+eWbnZZ/nMThA8DiwDdgMPA1sSqm/YvVnbPsG8I2Bf8rObcr4J4IIGAX2Aa8CO4A1XfzJu8Al4CvgS+A7A+o2p1ME+wWnBfMCFVg3BScF+123OReCSPCeYKZgQa3qmuDdem/2F8Ebgp8dSUrWT4LXXTtZhWBccNEDQWl1XjDm2hGCNYKjHgjJUkdU0gktTdSA4GsPJOSpmmCgbFHDgmkPGv8gNS0YLkvUbsGCB43uphYEu4sWdUCw7EFje1HLggNFiTroQQOLqIO9FrVXsORBw4qoJdnbsI50PJUKngO+BTZ0K91j/gW2G/i13U5tbwlkT7Nf0N+iAB4DPlOHdraUJdvrPgGe73EwX3kBOKMHuXCVveJ1/X3ioo60cpJqUfAy8GNuw/2BgFEDPyQ/aHUYflhoHL8xwFSmPQUTHhwKrut/wXjSTVrPyma1vzHAB8k3m2QJJkgx+pAyXvexQrJnTZUWJQym4i9WZMle8le9qpmm3hXvWROrdq2A2H1jXNZk+TmCYLKxYQAELwLTrtIEwDMGZho9a9JlkgDYB/cPw0zPcx5iJgGM7GOYBWCd0zh+swQ8EQFbqUR1Yh0wGgEjjoOEwkgEDLpOEQiDlazsDFaHYXZGKlnZqQ7DHAwawW3gEddJAuC/CFh0nSIQFiNgznWKQJirZGVnppKVnapn5aCSlYO5CJhxnSIQ5oxgI3YikZthz2EgYGNk4CZw2XUaz7ls4FbjsXLNZZIAqMH9Z/A1ZzHCoAZ1WQauAFddpvGYq3U/TT+y1txk8Z5aY6OS1ZlaY2NFlrHTaM+5SOMx5+pegMS1leAV4HzpkfxlzMDFxoum8VkGLgCflh7JT87GRUHKVbvgJexI3W5mx4fOXeBZA3/E31w1ptTAL8CpslJ5ysdJUdB6HPwIdgjS+oJD+chtYMjAfPKD1HHwxj6JOFxwKF85nCaqI7ILS7gek15mnWjno+1jGcGj2EuJ0dymw+N77DS65VY7ZJlvuAU73/DJHgbzjXnsfJ0b7XbquASJgVngLeBOj4L5xh3gzU6iciE45MF3ShHV2znSMWH9Nvv+/UJExYT1y7oOOwsVFRM2rHBXDLkiGCpFVEzYgOzaLq4bn6c+V9lr0cSEGYUzl/oj+fBzn2BMdp0q10LSyo/1s5IIXpNdEc21IMnXldniyK75947s2nsuJF1TCGv+JZFdTfKMYLFgQYuCs4K3Xbe5awRrBbsExwS/9UjQ74Ljgj2CtWW0w8nZQXYF3KFYbUm8fgq4BVyv12xs+zowa+DvsnPfA6NNTnNzpdkuAAAAAElFTkSuQmCC@@@PYTAMARO_DATA_URI_END@@@"
            />
          </Grid>
        </Grid>
        <Typography variant="h5" align="center" marginY={2} fontWeight="bold">Use Selection and Repetition</Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <PythonCodeCard
              lines={[
                'numbers = [52, -4, 17, 34, 50, 24, -17, 60, 47]',
                'total_even = 0',
                'for number in numbers:',
                '    if number % 2 == 0:',
                '        total_even = total_even + number',
                'print(total_even / len(numbers))',
              ]}
              stdout="24.0"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <PythonCodeCard
              pytamaro
              lines={[
                'diameters = [52, -4, 17, 34, 50, 24, -17, 60, 47]',
                'bubbles = empty_graphic()',
                'for diameter in diameters:',
                '    if diameter >= 0:',
                '        bubbles = beside(bubbles, circle(diameter, blue))',
                'show_graphic(bubbles)',
              ]}
              preludeLines={[
                'from pytamaro import beside, blue, ellipse, empty_graphic, show_graphic',
                '',
                'def circle(diameter, color):',
                '    return ellipse(diameter, diameter, color)',
                '',
              ]}
              stdout="@@@PYTAMARO_DATA_URI_BEGIN@@@data:image/png;base64,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@@@PYTAMARO_DATA_URI_END@@@"
            />
          </Grid>
        </Grid>
        <Typography variant="h5" align="center" marginY={2} fontWeight="bold">And Much, Much More!</Typography>
        <Typography variant="h4" mt={8} mb={2} fontWeight="bold">Learn with PyTamaro</Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea href={activitiesByAuthorPathname('luce')} sx={{ height: '100%' }}>
                <CardHeader
                  title="Learning Activities For All Tastes"
                  titleTypographyProps={{ variant: 'h5', color: 'primary', fontWeight: 'bold' }}
                  sx={{ pb: 0 }}
                  avatar={<TipsAndUpdates color="primary" />}
                />
                <CardContent sx={{ pY: 1 }}>
                  <Typography variant="body1" color="textSecondary" fontSize="1.1rem">
                    Learn programming in connection to art, data science, colors, animations,
                    {' '}
                    and more.
                  </Typography>
                </CardContent>
                <Box padding={2}>
                  <Carousel
                    interval={2000}
                    indicators={false}
                    navButtonsAlwaysInvisible
                  >
                    {featuredActivities.filter((activity) => activity.slug !== 'swiss-flag').map((activity) => (
                      <ActivityCardMedia
                        key={activity.slug}
                        activity={activity}
                        variant={activity.variants[0]}
                        height="250rem"
                      />
                    ))}
                  </Carousel>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea href={curriculaPathname()} sx={{ height: '100%' }}>
                <CardHeader
                  title="Guided Curricula Designed By Teachers"
                  titleTypographyProps={{ variant: 'h5', color: 'primary', fontWeight: 'bold' }}
                  sx={{ pb: 0 }}
                  avatar={<Route color="primary" />}
                />
                <CardContent sx={{ pY: 1 }}>
                  <Typography variant="body1" color="textSecondary" fontSize="1.1rem">
                    Choose a beginner or advanced curriculum that guides you through the activities.
                  </Typography>
                </CardContent>
                <Box padding={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src="Curriculum.png"
                    alt="Curriculum"
                    height="250rem"
                  />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
        <Typography variant="h4" mt={8} mb={2} fontWeight="bold">Teach with PyTamaro</Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea href={teachingResourcesPathname()} sx={{ height: '100%' }}>
                <CardHeader
                  title="Free Teaching Resources"
                  titleTypographyProps={{ variant: 'h5', color: 'primary', fontWeight: 'bold' }}
                  avatar={<School color="primary" />}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="body1" color="textSecondary" fontSize="1.1rem">
                    Start teaching programming with
                    {' '}
                    <strong>unplugged</strong>
                    {' '}
                    activities, and check out other resources for teachers.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea href="/research" sx={{ height: '100%' }}>
                <CardHeader
                  title="Based on Research"
                  titleTypographyProps={{ variant: 'h5', color: 'primary', fontWeight: 'bold' }}
                  avatar={<Science color="primary" />}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="body1" color="textSecondary" fontSize="1.1rem">
                    Read our
                    {' '}
                    <strong>research papers</strong>
                    {' '}
                    to learn about the design of PyTamaro and this web platform.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea href="/install" sx={{ height: '100%' }}>
                <CardHeader
                  title="Install for Offline Use"
                  titleTypographyProps={{ variant: 'h5', color: 'primary', fontWeight: 'bold' }}
                  avatar={<Download color="primary" />}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="body1" color="textSecondary" fontSize="1.1rem">
                    Installation instructions if you prefer to use PyTamaro
                    {' '}
                    <strong>offline</strong>
                    {' '}
                    in your favorite IDE.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Typography variant="h6" align="center" mt={8} sx={{ fontWeight: 'normal', textWrap: 'balance' }} gutterBottom>
        PyTamaro is a synergistic collaboration between
        {' '}
        <Link href={`${aboutPathname()}#who`} style={{ textDecoration: 'none' }}>university and school teachers</Link>
      </Typography>
      <Typography variant="h6" align="center" sx={{ fontWeight: 'normal' }} gutterBottom>
        The library is an open-source project hosted on
        {' '}
        <Link href="https://github.com/LuCEresearchlab/pytamaro" style={{ textDecoration: 'none' }}>GitHub</Link>
      </Typography>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      activities: basicActivities(await listVisibleActivities('luce')),
      ...await translationProps(['curriculum']),
    },
  };
}
