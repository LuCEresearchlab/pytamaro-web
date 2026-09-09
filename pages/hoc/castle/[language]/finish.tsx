import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { Trans } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Carousel from '../../../../components/Carousel';
import HourOfCodeCastle from '../../../../components/HourOfCodeCastle';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';
import NavigationBar from '../../../../components/navbar/NavigationBar';
import DarkCastleImage from '../../../../public/hoc/castle/DarkCastle.jpg';
import FortezzaBellinzonaImage from '../../../../public/hoc/fortezza-bellinzona-castello3.png';
import CertificateImage from '../../../../public/hoc/hour_of_code_certificate.jpg';
import { readActivity } from '../../../../src/fs-content/activities';
import useLocalTranslation from '../../../../src/localStorage/useLocalTranslation';
import { Activity } from '../../../../src/schemas/activitySchema';
import { translationProps } from '../../../../src/serverSideTranslationProps';
import {
  activitiesByAuthorPathname,
  activityAssetPathname,
  curriculumPathname,
} from '../../../../src/urlUtils';

export default function FinishHocCastlePage({
  finalActivity,
}: {
  finalActivity: Activity;
}) {
  const router = useRouter();
  const language = router.query.language as string;
  const { i18n } = useLocalTranslation(['hourofcode']);
  const t = i18n.getFixedT(language, 'hourofcode');
  return (
    <div>
      <Head>
        <title>{t('finish.title')}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            paragraph
            sx={{
              marginTop: 5,
            }}
          >
            {t('hourOfCodeWithPyTamaro')}
          </Typography>
          <Typography
            sx={{ mt: 2 }}
            variant='h3'
            align='center'
            color='textPrimary'
            gutterBottom
          >
            {t('finish.missionAccomplished')}
          </Typography>
          <Typography
            variant='h6'
            color='textSecondary'
            sx={{
              marginY: 3,
            }}
          >
            {t('finish.castleHelp')}
          </Typography>
          <Image
            src={DarkCastleImage}
            alt='Photo of Castle'
            width='1261'
            height='831'
            sizes='100vw'
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('finish.despiteThat')}
          </Typography>
          <Grid container spacing={2} sx={{ marginY: 3 }}>
            <Grid
              size={{
                xs: 12,
                sm: 8,
              }}
            >
              <Typography
                variant='h5'
                color='textSecondary'
                paragraph
                sx={{
                  marginTop: 0,
                }}
              >
                {t('finish.leonardo')}
              </Typography>
              <Typography
                sx={{
                  marginY: 3,
                }}
              >
                <Trans
                  t={t}
                  i18nKey='finish.tsunamiWave'
                  components={{ strong: <strong /> }}
                />
              </Typography>
              <Typography
                sx={{
                  marginY: 3,
                }}
              >
                <Trans
                  t={t}
                  i18nKey='finish.buzzaBiasca'
                  components={{
                    a: (
                      <Link href='https://hls-dhs-dss.ch/de/articles/028662/2004-11-04/' />
                    ),
                  }}
                />
              </Typography>
              <Typography
                sx={{
                  marginY: 3,
                }}
              >
                <Trans
                  t={t}
                  i18nKey='finish.sketch'
                  components={{
                    strong: <strong />,
                    a: (
                      <Link href='https://insubricahistorica.ch/blog/2021/09/22/la-buzza-di-biasca-del-1515/' />
                    ),
                  }}
                />
              </Typography>
              <Typography>{t('finish.amazing')}</Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Card>
                <CardContent>
                  <Typography gutterBottom variant='h5'>
                    {t('finish.claimYourCertificate')}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {t('finish.claimYourCertificateDesc')}
                  </Typography>
                </CardContent>
                <CardMedia>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Image
                      src={CertificateImage}
                      alt='Certificate'
                      sizes='100vw'
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                </CardMedia>
                <CardContent>
                  <Typography
                    align='center'
                    sx={{
                      marginY: 0,
                    }}
                  >
                    <Link href='https://code.org/api/hour/finish' passHref>
                      <Button variant='contained' size='large' color='success'>
                        <Trans
                          t={t}
                          i18nKey='finish.completeButton'
                          components={{ br: <br /> }}
                        />
                      </Button>
                    </Link>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    variant='h5'
                    paragraph
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    <Trans
                      t={t}
                      i18nKey='finish.keepCastle'
                      components={{ br: <br /> }}
                    />
                  </Typography>

                  <Typography
                    variant='body2'
                    paragraph
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {t('finish.keepCastleDesc1')}
                  </Typography>
                  <HourOfCodeCastle
                    language='en'
                    extraPythonFiles={finalActivity.extraPythonFiles}
                  />
                  <Typography
                    variant='body2'
                    paragraph
                    sx={{
                      color: 'text.secondary',
                      mt: 2,
                    }}
                  >
                    {t('finish.keepCastleDesc2')}
                  </Typography>
                  <Typography
                    variant='body2'
                    gutterBottom
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {t('finish.keepCastleDesc3')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    variant='h5'
                    paragraph
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    <Trans
                      t={t}
                      i18nKey='finish.learnPython'
                      components={{ br: <br /> }}
                    />
                  </Typography>
                  <Typography
                    variant='body2'
                    paragraph
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {t('finish.learnPythonDesc1')}
                  </Typography>

                  <Carousel interval={4000} sx={{ marginBottom: '20px' }}>
                    {[
                      {
                        author: 'luce',
                        activity: 'pacman-maze',
                        image: 'pacman-maze.svg',
                        background: 'black',
                      },
                      {
                        author: 'luce',
                        activity: 'chessboard',
                        image: 'chessboard.svg',
                        background: '#503a2f',
                      },
                      {
                        author: 'luce',
                        activity: 'swiss-hiking-signposts',
                        image: 'mountain-trail-signpost.svg',
                        background: '#4bac23',
                      },
                      {
                        author: 'luce',
                        activity: 'warming-stripes',
                        image: 'stripes.png',
                        background: 'white',
                      },
                      {
                        author: 'luce',
                        activity: 'isometric-bars',
                        image: 'isometric-bars.svg',
                        background: 'white',
                      },
                      {
                        author: 'luce',
                        activity: 'simple-box-plot',
                        image: 'simple-box-plot.svg',
                        background: 'white',
                      },
                    ].map((activity) => (
                      <CardMedia
                        key={`${activity.author}-${activity.activity}`}
                        component='img'
                        height={200}
                        image={activityAssetPathname(
                          activity.author,
                          activity.activity,
                          activity.image,
                        )}
                        sx={{
                          padding: 0.3,
                          objectFit: 'contain',
                          backgroundColor: activity.background,
                        }}
                      />
                    ))}
                  </Carousel>

                  <Typography
                    variant='body2'
                    paragraph
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {t('finish.learnPythonDesc2')}
                  </Typography>

                  <Typography
                    variant='body2'
                    paragraph
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    <Trans
                      t={t}
                      i18nKey='finish.learnPythonDesc3'
                      components={{
                        a: (
                          <Link href={curriculumPathname('luce', 'welcome')} />
                        ),
                      }}
                    />
                  </Typography>
                  <Typography
                    variant='body2'
                    gutterBottom
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    <Trans
                      t={t}
                      i18nKey='finish.learnPythonDesc4'
                      components={{
                        a: <Link href={activitiesByAuthorPathname('luce')} />,
                      }}
                    />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Card>
                <CardContent>
                  <Typography variant='h5' color='textSecondary' paragraph>
                    <Trans
                      t={t}
                      i18nKey='finish.visitFortezza'
                      components={{ br: <br /> }}
                    />
                  </Typography>
                  <Typography
                    variant='body2'
                    gutterBottom
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    <Trans
                      t={t}
                      i18nKey='finish.visitFortezzaDesc1'
                      components={{
                        a: <Link href='https://fortezzabellinzona.ch/en/' />,
                      }}
                    />
                  </Typography>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '20px',
                      marginBottom: '17px',
                    }}
                  >
                    <Image
                      src={FortezzaBellinzonaImage}
                      alt='Fortezza Bellinzona'
                      sizes='100vw'
                      style={{
                        width: '90%',
                        height: 'auto',
                      }}
                    />
                  </div>
                  <Typography
                    variant='body2'
                    gutterBottom
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {t('finish.visitFortezzaDesc2')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('finish.finish')}
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      finalActivity: await readActivity('luce-hoc', 'build-your-castle'),
      ...(await translationProps(['hourofcode', 'activityfooter'])),
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: ['en', 'it', 'de'].map((locale) => ({
      params: { language: locale },
    })),
    fallback: false,
  };
}
