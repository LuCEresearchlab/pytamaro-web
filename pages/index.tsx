/* eslint-disable @next/next/no-img-element */
import { MenuBookOutlined } from '@mui/icons-material';
import Download from '@mui/icons-material/Download';
import PlayCircle from '@mui/icons-material/PlayCircle';
import Route from '@mui/icons-material/Route';
import School from '@mui/icons-material/School';
import Science from '@mui/icons-material/Science';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Container,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import anime from 'animejs';
import { shuffle } from 'lodash';
import Head from 'next/head';
import { useEffect } from 'react';
import ActivityCardMedia from '../components/ActivityCardMedia';
import Carousel from '../components/Carousel';
import DocElement from '../components/documentation/DocElement';
import { STRICT_PYTHON3_LANG_ID } from '../components/editor/strictPython3';
import NavigationBar from '../components/navbar/NavigationBar';
import ExecutionOutputArea from '../components/OutputArea';
import { useDocumentationElements } from '../src/documentation';
import {
  basicActivities,
  listVisibleActivities,
} from '../src/fs-content/activities';
import useMonacoColorizer, { COLORIZE_CLASSNAME } from '../src/monacoColorizer';
import { playgroundActivityVariant } from '../src/playground';
import { PythonName } from '../src/python-analyzer/python_analyzer';
import { BasicActivity } from '../src/schemas/activitySchema';
import { translationProps } from '../src/serverSideTranslationProps';
import theme from '../src/theme';
import {
  aboutPathname,
  activitiesByAuthorPathname,
  curriculaPathname,
  playgroundPathname,
  teachingResourcesPathname,
} from '../src/urlUtils';

function AnnotationTooltip({
  children,
  title,
  placement,
  type = 'programming',
}: {
  children: React.ReactElement;
  title: string;
  placement: 'left' | 'right' | 'top' | 'bottom';
  type?: 'programming' | 'graphics' | 'other';
}) {
  const color =
    type === 'graphics'
      ? theme.pytamaro.palette.red
      : type === 'programming'
        ? theme.palette.primary.main
        : theme.palette.text.primary;
  return (
    <Tooltip
      open={true}
      placement={placement}
      arrow
      title={title}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: color,
            fontSize: '1rem',
            paddingY: 0.25,
            display: {
              xs: 'none',
              sm: 'block',
            },
          },
        },
        arrow: { sx: { color: color } },
        popper: { sx: { zIndex: 300 } },
      }}
    >
      <span>{children}</span>
    </Tooltip>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <span className={COLORIZE_CLASSNAME} data-lang={STRICT_PYTHON3_LANG_ID}>
      {children}
    </span>
  );
}

const FULL_EXAMPLE_CODE = `
from pytamaro import (rectangle, empty_graphic, beside, above, rotate,
                      show_graphic, black, white)

block_size = 25
num_blocks = 16

line = empty_graphic()
for col in range(num_blocks):
    if col % 2 == 0:
        color = black
    else:
        color = white
    block = rectangle(block_size, block_size, color)
    line = beside(line, block)
second_line = rotate(180, line)
finish_line = above(line, second_line)

show_graphic(finish_line)`;

const EXAMPLE_STDOUT =
  '@@@PYTAMARO_DATA_URI_BEGIN@@@data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAAyCAYAAAByHI2dAAAA+ElEQVR4nO3XwYkEMAwEQWu5/FP2piAafI+lKgExr0ZzzrnnsXufnzgz8/yGHXt27NmxZ8fef+z4PL8AwE8SEAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQAJK/e+/zIzPz/IYde3bs2bFnx96v7PCBAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAMkX+JkxYgh26wcAAAAASUVORK5CYII=@@@PYTAMARO_DATA_URI_END@@@';
function PythonCodeCard() {
  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <Documentation />
      <CardContent sx={{ overflowX: 'auto' }}>
        <Box
          sx={{
            fontFamily: theme.pytamaro.monospaceFontFamily,
            whiteSpace: 'pre',
            fontVariantLigatures: 'none',
          }}
        >
          <div>
            <Code>block_size = 25</Code>
          </div>
          <div>
            <Code>num_blocks = 16</Code>
          </div>
          <div>
            <AnnotationTooltip title='Variable' placement='left'>
              <Code>line = empty_graphic()</Code>
            </AnnotationTooltip>
          </div>
          <div>
            <AnnotationTooltip title='Loop' placement='right'>
              <Code>for col in range(num_blocks):</Code>
            </AnnotationTooltip>
          </div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <AnnotationTooltip title='Condition' placement='left'>
              <Code>if col % 2 == 0:</Code>
            </AnnotationTooltip>
          </div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Code>color = black</Code>
          </div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;else:</div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Code>color = white</Code>
          </div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <AnnotationTooltip
              title='Primitive Graphics'
              placement='right'
              type='graphics'
            >
              <Code>block = rectangle(block_size, block_size, color)</Code>
            </AnnotationTooltip>
          </div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <AnnotationTooltip
              title='Graphics Composition'
              placement='right'
              type='graphics'
            >
              <Code>line = beside(line, block)</Code>
            </AnnotationTooltip>
          </div>
          <div>
            <Code>second_line = rotate(180, line)</Code>
          </div>
          <div>
            <Code>finish_line = above(line, second_line)</Code>
          </div>
          <div>
            <AnnotationTooltip title='Output' placement='left'>
              <Code>show_graphic(finish_line)</Code>
            </AnnotationTooltip>
          </div>
        </Box>
        <Button
          variant='outlined'
          size='small'
          href={playgroundPathname(FULL_EXAMPLE_CODE.trim())}
          sx={{
            position: {
              xs: 'static',
              sm: 'absolute',
            },
            top: {
              xs: 'auto',
              sm: '7rem',
            },
            right: {
              xs: 'auto',
              sm: '1rem',
            },
            marginTop: {
              xs: 2,
            },
          }}
          endIcon={<PlayCircle />}
        >
          <div style={{ textAlign: 'center' }}>
            <Typography fontWeight='bold' component={'span'}>
              Try it Now!
            </Typography>{' '}
            <br />
            Directly in Your Browser
          </div>
        </Button>
      </CardContent>
      <ExecutionOutputArea
        executionError={false}
        executionResponse={{
          stdout: EXAMPLE_STDOUT,
          stderr: '',
          type: 'success',
        }}
        sx={{
          border: 0,
          height: '100%',
          backgroundColor: theme.palette.grey[300],
        }}
      />
    </Card>
  );
}

function Documentation() {
  const namesToDocElement = useDocumentationElements(
    [
      new PythonName('pytamaro', 'rectangle'),
      new PythonName('pytamaro', 'beside'),
      new PythonName('pytamaro', 'above'),
      new PythonName('pytamaro', 'rotate'),
      new PythonName('pytamaro', 'empty_graphic'),
      new PythonName('pytamaro', 'show_graphic'),
      new PythonName('pytamaro', 'black'),
      new PythonName('pytamaro', 'white'),
      new PythonName('builtins', 'range'),
    ],
    [],
    [],
  );
  return (
    <Box bgcolor={theme.pytamaro.palette.background.light}>
      <Stack
        direction='row'
        columnGap={0.7}
        alignItems='baseline'
        useFlexGap
        marginX={0.5}
      >
        <MenuBookOutlined
          sx={{
            fontSize: '1em',
            transform: 'translateY(0.15em)',
            marginX: theme.spacing(0.5),
          }}
          color='primary'
        />
        <Stack
          direction='row'
          rowGap={0.1}
          columnGap={1}
          alignItems='baseline'
          useFlexGap
          flexWrap='wrap'
          overflow='hidden'
        >
          {namesToDocElement.map(({ module, element }) =>
            module === 'builtins' && element?.name === 'range' ? (
              <AnnotationTooltip
                key={`${module}-${element?.name}`}
                title={'Documentation'}
                placement='bottom'
                type='other'
              >
                <DocElement
                  module={module}
                  element={element}
                  smallerFont
                  activityVariant={playgroundActivityVariant}
                />
              </AnnotationTooltip>
            ) : (
              <DocElement
                key={`${module}-${element?.name}`}
                module={module}
                element={element}
                smallerFont
                activityVariant={playgroundActivityVariant}
              />
            ),
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export default function Home({ activities }: { activities: BasicActivity[] }) {
  const featuredActivities = shuffle(
    activities.filter((activity) => activity.visibility === 'featured'),
  );

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
    tl.add(
      {
        targets: '#pytamaro-logo-symbol',
        translateX: '-6rem',
      },
      '-=750',
    );
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

  useMonacoColorizer();

  return (
    <div>
      <Head>
        <title>PyTamaro</title>
        <meta
          name='description'
          content='PyTamaro: Learn programming in Python with graphics. Explore activities connected to data science, colors, animations, and more. Completely free, in your browser!'
        />
      </Head>
      <NavigationBar home>
        <Button
          variant='contained'
          href={playgroundPathname()}
          endIcon={<PlayCircle />}
        >
          Playground
        </Button>
      </NavigationBar>
      <Container maxWidth='xl'>
        <Box display='flex' justifyContent='center' marginY={10}>
          <Box sx={{ width: { xs: '35vw', md: '25vw', xl: '15vw' } }}>
            <svg viewBox='0 0 600 108' display='block' overflow='visible'>
              <g id='pytamaro-logo-text'>
                <path
                  transform='translate(175.814 86.6026)'
                  d='M18.3105 -60.9863L33.8867 -60.9863Q38.2812 -61.084 41.6016 -58.9844Q43.7988 -57.7148 45.0195 -55.5176Q46.1914 -53.0762 46.1914 -49.5117Q46.1914 -45.2148 43.3105 -41.6992Q40.2832 -38.0859 34.2773 -37.9883L18.3105 -37.9883L18.3105 -60.9863ZM7.51953 0L18.3105 0L18.3105 -27.7832L34.7168 -27.7832Q45.7031 -27.9785 51.416 -34.8145Q56.9824 -41.3086 56.9824 -49.2188Q56.9824 -55.0781 54.7852 -59.375Q52.6855 -63.8184 49.3164 -66.2109Q45.3125 -69.3848 41.4062 -70.4102Q37.5 -71.1914 33.3008 -71.1914L7.51953 -71.1914L7.51953 0ZM76.7578 -2.00195L73.9746 6.49414Q73.291 8.69141 71.582 9.81445Q69.873 10.8887 67.8711 10.8887L64.8926 10.8887L64.8926 20.5078L68.2617 20.5078Q72.998 20.5078 76.7578 18.4082Q80.4688 16.2109 82.5684 10.498L104.395 -50.6836L93.5547 -50.6836L81.5918 -15.1855L81.3965 -15.1855L69.3848 -50.6836L58.5938 -50.6836L76.7578 -2.00195ZM123.242 0L134.082 0L134.082 -61.5723L153.564 -61.5723L153.564 -71.1914L103.76 -71.1914L103.76 -61.5723L123.242 -61.5723L123.242 0ZM186.865 0L197.07 0L197.07 -34.6191Q196.973 -43.8965 191.26 -47.7051Q185.547 -51.416 175.977 -51.3184Q164.648 -51.5137 158.838 -43.8965L166.846 -37.793Q168.164 -39.9902 170.459 -40.918Q172.656 -41.6992 176.465 -41.6992Q186.963 -41.8945 186.865 -35.2051L186.865 -29.8828L172.754 -29.8828Q164.648 -29.7852 160.449 -25.4883Q156.25 -21.2891 156.25 -14.8926Q156.25 -8.20312 161.084 -3.90625Q165.674 0.488281 174.17 0.585938Q179.346 0.585938 182.275 -0.683594Q185.254 -1.9043 186.67 -4.49219L186.865 -4.49219L186.865 0ZM186.865 -17.8223Q186.865 -12.1094 184.473 -10.498Q181.836 -8.88672 175.439 -8.98438Q170.361 -8.98438 168.164 -10.9863Q165.869 -12.793 165.869 -15.3809Q165.771 -21.2891 174.658 -21.4844L186.865 -21.4844L186.865 -17.8223ZM210.84 0L221.045 0L221.045 -30.1758Q221.045 -35.498 223.975 -38.2812Q226.758 -41.1133 231.152 -41.1133Q235.547 -41.1133 238.379 -38.2812Q241.162 -35.498 241.162 -30.1758L241.162 0L251.367 0L251.367 -30.1758Q251.367 -35.498 254.248 -38.2812Q257.08 -41.1133 261.475 -41.1133Q265.869 -41.1133 268.652 -38.2812Q271.436 -35.498 271.436 -30.1758L271.436 0L281.641 0L281.641 -33.6914Q281.445 -42.3828 276.27 -46.875Q271.045 -51.3184 264.746 -51.3184Q254.736 -51.416 248.779 -44.6777Q246.143 -47.6074 242.969 -49.5117Q239.746 -51.2207 234.473 -51.3184Q226.27 -51.3184 221.24 -45.3125L221.045 -45.3125L221.045 -50.6836L210.84 -50.6836L210.84 0ZM322.07 0L332.275 0L332.275 -34.6191Q332.178 -43.8965 326.465 -47.7051Q320.752 -51.416 311.182 -51.3184Q299.854 -51.5137 294.043 -43.8965L302.051 -37.793Q303.369 -39.9902 305.664 -40.918Q307.861 -41.6992 311.67 -41.6992Q322.168 -41.8945 322.07 -35.2051L322.07 -29.8828L307.959 -29.8828Q299.854 -29.7852 295.654 -25.4883Q291.455 -21.2891 291.455 -14.8926Q291.455 -8.20312 296.289 -3.90625Q300.879 0.488281 309.375 0.585938Q314.551 0.585938 317.48 -0.683594Q320.459 -1.9043 321.875 -4.49219L322.07 -4.49219L322.07 0ZM322.07 -17.8223Q322.07 -12.1094 319.678 -10.498Q317.041 -8.88672 310.645 -8.98438Q305.566 -8.98438 303.369 -10.9863Q301.074 -12.793 301.074 -15.3809Q300.977 -21.2891 309.863 -21.4844L322.07 -21.4844L322.07 -17.8223ZM345.459 0L355.664 0L355.664 -30.5176Q355.762 -36.084 358.887 -38.5742Q361.67 -41.1133 365.576 -41.1133Q369.043 -41.1133 372.266 -38.5742L379.688 -47.4121Q375.146 -51.2207 369.043 -51.3184Q360.889 -51.3184 355.859 -45.3125L355.664 -45.3125L355.664 -50.6836L345.459 -50.6836L345.459 0ZM381.885 -25.3906Q381.885 -17.3828 383.203 -13.1836Q384.57 -8.98438 387.402 -5.9082Q389.502 -3.51562 393.262 -1.61133Q396.973 0.488281 402.783 0.585938Q408.789 0.488281 412.5 -1.61133Q414.502 -2.49023 415.771 -3.71094Q417.188 -4.78516 418.164 -5.9082Q421.191 -8.98438 422.461 -13.1836Q423.682 -17.3828 423.682 -25.3906Q423.682 -33.3984 422.461 -37.6953Q421.191 -41.8945 418.164 -44.7754Q416.162 -47.3145 412.5 -49.3164Q408.789 -51.2207 402.783 -51.3184Q396.973 -51.2207 393.262 -49.3164Q389.502 -47.3145 387.402 -44.7754Q384.57 -41.8945 383.203 -37.6953Q381.885 -33.3984 381.885 -25.3906ZM413.477 -25.293Q413.477 -20.1172 412.988 -17.6758Q412.5 -15.1855 410.986 -13.2812Q409.863 -11.8164 407.666 -10.6934Q405.566 -9.61914 402.783 -9.61914Q400.195 -9.61914 397.998 -10.6934Q395.898 -11.8164 394.58 -13.2812Q393.262 -15.1855 392.676 -17.6758Q392.09 -20.1172 392.09 -25.3906Q392.09 -30.7129 392.676 -33.2031Q393.262 -35.5957 394.58 -37.4023Q395.898 -39.1113 397.998 -40.0879Q400.195 -41.1133 402.783 -41.1133Q405.566 -41.1133 407.666 -40.0879Q409.863 -39.1113 410.986 -37.4023Q412.5 -35.5957 412.988 -33.2031Q413.477 -30.7129 413.477 -25.293Z'
                />
              </g>
              <g id='pytamaro-logo-symbol'>
                {/* Center offset +(25, 21.6507) */}
                <g id='pytamaro-logo-right-lake' transform-origin='125 64.9521'>
                  <path
                    fill='#008BCB'
                    transform='matrix(-1 0 0 -1 150 43.3013)'
                    d='M0 0L50 0L25 -43.3013L0 0Z'
                  />
                </g>
                <g id='pytamaro-logo-mountain'>
                  <path
                    fill='#D2071D'
                    transform='translate(25 86.6026)'
                    d='M0 0L100 0L50 -86.6025L0 0Z'
                  />
                </g>
                <g id='pytamaro-logo-left-lake' transform-origin='25 64.9521'>
                  <path
                    fill='#008BCB'
                    transform='matrix(-1 0 0 -1 50 43.3013)'
                    d='M0 0L50 0L25 -43.3013L0 0Z'
                  />
                </g>
              </g>
            </svg>
          </Box>
        </Box>
        <Typography
          variant='h3'
          fontWeight='bold'
          textAlign='center'
          marginY={10}
          sx={{ textWrap: 'balance' }}
        >
          Learn{' '}
          <Typography
            variant='h3'
            fontWeight='bold'
            component='span'
            color='primary'
          >
            Programming
          </Typography>{' '}
          in Python with{' '}
          <Typography
            variant='h3'
            fontWeight='bold'
            component='span'
            color={theme.pytamaro.palette.red}
          >
            Graphics
          </Typography>
        </Typography>
        <Box maxWidth={'md'} marginX={'auto'} marginY={10}>
          <PythonCodeCard />
        </Box>
        <Typography variant='h4' mt={14} mb={2} fontWeight='bold'>
          Learn with PyTamaro
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                href={activitiesByAuthorPathname('luce')}
                sx={{ height: '100%' }}
              >
                <CardHeader
                  title='Learning Activities For All Tastes'
                  titleTypographyProps={{
                    variant: 'h5',
                    color: 'primary',
                    fontWeight: 'bold',
                  }}
                  sx={{ pb: 0 }}
                  avatar={<TipsAndUpdates color='primary' />}
                />
                <CardContent sx={{ pY: 1 }}>
                  <Typography
                    variant='body1'
                    color='textSecondary'
                    fontSize='1.1rem'
                  >
                    Learn programming in connection to art, data science,
                    colors, animations, and more.
                  </Typography>
                </CardContent>
                <Box padding={2}>
                  <Carousel interval={2000}>
                    {featuredActivities
                      .filter((activity) => activity.slug !== 'swiss-flag')
                      .map((activity) => (
                        <ActivityCardMedia
                          key={activity.slug}
                          activity={activity}
                          variant={activity.variants[0]}
                          height='250rem'
                        />
                      ))}
                  </Carousel>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                href={curriculaPathname()}
                sx={{ height: '100%' }}
              >
                <CardHeader
                  title='Guided Curricula Designed By Teachers'
                  titleTypographyProps={{
                    variant: 'h5',
                    color: 'primary',
                    fontWeight: 'bold',
                  }}
                  sx={{ pb: 0 }}
                  avatar={<Route color='primary' />}
                />
                <CardContent sx={{ pY: 1 }}>
                  <Typography
                    variant='body1'
                    color='textSecondary'
                    fontSize='1.1rem'
                  >
                    Choose a beginner or advanced curriculum that guides you
                    through the activities.
                  </Typography>
                </CardContent>
                <Box
                  padding={2}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  <img src='Curriculum.png' alt='Curriculum' height='250rem' />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
        <Typography variant='h4' mt={8} mb={2} fontWeight='bold'>
          Teach with PyTamaro
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                href={teachingResourcesPathname()}
                sx={{ height: '100%' }}
              >
                <CardHeader
                  title='Free Teaching Resources'
                  titleTypographyProps={{
                    variant: 'h5',
                    color: 'primary',
                    fontWeight: 'bold',
                  }}
                  avatar={<School color='primary' />}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography
                    variant='body1'
                    color='textSecondary'
                    fontSize='1.1rem'
                  >
                    Start teaching programming with <strong>unplugged</strong>{' '}
                    activities, and check out other resources for teachers.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea href='/research' sx={{ height: '100%' }}>
                <CardHeader
                  title='Based on Research'
                  titleTypographyProps={{
                    variant: 'h5',
                    color: 'primary',
                    fontWeight: 'bold',
                  }}
                  avatar={<Science color='primary' />}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography
                    variant='body1'
                    color='textSecondary'
                    fontSize='1.1rem'
                  >
                    Read our <strong>research papers</strong> to learn about the
                    design of PyTamaro and this web platform.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea href='/install' sx={{ height: '100%' }}>
                <CardHeader
                  title='Install for Offline Use'
                  titleTypographyProps={{
                    variant: 'h5',
                    color: 'primary',
                    fontWeight: 'bold',
                  }}
                  avatar={<Download color='primary' />}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography
                    variant='body1'
                    color='textSecondary'
                    fontSize='1.1rem'
                  >
                    Installation instructions if you prefer to use PyTamaro{' '}
                    <strong>offline</strong> in your favorite IDE.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Typography
        variant='h6'
        align='center'
        mt={8}
        sx={{ fontWeight: 'normal', textWrap: 'balance' }}
        gutterBottom
      >
        PyTamaro is a synergistic collaboration between{' '}
        <Link
          href={`${aboutPathname()}#who`}
          style={{ textDecoration: 'none' }}
        >
          university and school teachers
        </Link>
      </Typography>
      <Typography
        variant='h6'
        align='center'
        sx={{ fontWeight: 'normal' }}
        gutterBottom
      >
        The library is an open-source project hosted on{' '}
        <Link
          href='https://github.com/LuCEresearchlab/pytamaro'
          style={{ textDecoration: 'none' }}
        >
          GitHub
        </Link>
      </Typography>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      activities: basicActivities(await listVisibleActivities('luce')),
      ...(await translationProps([])),
    },
  };
}
