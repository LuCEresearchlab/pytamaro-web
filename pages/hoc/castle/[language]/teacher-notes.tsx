import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import { Trans } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import ActivitiesCompetenciesMatrix from '../../../../components/ActivitiesCompetenciesMatrix';
import HourOfCodeFooter from '../../../../components/HourOfCodeFooter';
import NavigationBar from '../../../../components/navbar/NavigationBar';
import BattlementImage from '../../../../public/hoc/castle/Battlement.jpg';
import CastleListImage from '../../../../public/hoc/castle/CastleList.png';
import CurtainWallImage from '../../../../public/hoc/castle/CurtainWall.jpg';
import DrawbridgeImage from '../../../../public/hoc/castle/Drawbridge.jpg';
import FortezzaBellinzonaHistory from '../../../../public/hoc/castle/FortezzaBellinzonaHistory.png';
import MarketingImage from '../../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay.jpg';
import MerlonImage from '../../../../public/hoc/castle/Merlon.jpg';
import ProblemSolutionImage from '../../../../public/hoc/castle/ProblemSolution.png';
import PureFunctionImage from '../../../../public/hoc/castle/PureFunction.png';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import useLocalTranslation from '../../../../src/localStorage/useLocalTranslation';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { translationProps } from '../../../../src/serverSideTranslationProps';
import { curriculumInfoPathname } from '../../../../src/urlUtils';

function ContributorCard({
  firstName,
  lastName,
  contribution,
  imageName,
}: {
  firstName: string;
  lastName: string;
  contribution: string;
  imageName: string;
}) {
  return (
    <Grid
      size={{
        xs: 12,
        sm: 3,
      }}
    >
      <Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '1rem 0',
          }}
        >
          <Avatar
            src={`../../../people/${imageName}`}
            sx={{ width: 80, height: 80 }}
          />
        </Box>
        <CardHeader
          title={
            <>
              {firstName}
              <br />
              {lastName}
            </>
          }
          subheader={contribution}
          slotProps={{
            title: { align: 'center' },

            subheader: {
              align: 'center',
            },
          }}
        />
      </Card>
    </Grid>
  );
}

export default function FinishHocCastlePage({
  curriculum,
}: {
  curriculum: Curriculum;
}) {
  const router = useRouter();
  const language = router.query.language as string;
  const { i18n } = useLocalTranslation(['hourofcode']);
  const t = i18n.getFixedT(language, 'hourofcode');
  return (
    <div>
      <Head>
        <title>{t('notes.title')}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
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
            {t('start.programYourOwnCastle')}
            <br />
            {t('notes.teacherNotes')}
          </Typography>
          <Typography
            variant='h6'
            align='center'
            color='textSecondary'
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.intro')}
          </Typography>

          <Image
            src={MarketingImage}
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
            variant='h4'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.guidance')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.guidanceDesc')}
          </Typography>

          <Typography
            variant='h4'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.students')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.studentsDesc')}
          </Typography>
          <Grid
            container
            spacing={5}
            sx={{
              alignItems: 'flex-end',
            }}
          >
            <ContributorCard
              firstName='Agnese'
              lastName='Zamboni'
              contribution='Lead Developer'
              imageName='AgneseZamboni.jpg'
            />
            <ContributorCard
              firstName='Davide'
              lastName='Frova'
              contribution='Developer'
              imageName='DavideFrova.jpg'
            />
            <ContributorCard
              firstName='Giorgia'
              lastName='Lillo'
              contribution='Developer'
              imageName='GiorgiaLillo.jpg'
            />
            <ContributorCard
              firstName='Jamila'
              lastName='Oubenali'
              contribution='Developer'
              imageName='JamilaOubenali.jpg'
            />
          </Grid>

          <Typography
            sx={{
              marginY: 3,
            }}
          >
            <Trans
              t={t}
              i18nKey='notes.usi'
              components={{ a: <Link href='https://www.usi.ch' /> }}
            />
          </Typography>
          <Grid
            container
            spacing={5}
            sx={{
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <ContributorCard
              firstName='Luca'
              lastName='Chiodini'
              contribution='Platform'
              imageName='LucaChiodini.jpg'
            />
            <ContributorCard
              firstName='Igor'
              lastName='Moreno'
              contribution='PL Advice'
              imageName='IgorMoreno.jpg'
            />
            <ContributorCard
              firstName='Joey'
              lastName='Bevilacqua'
              contribution='Engineering'
              imageName='JoeyBevilacqua.jpg'
            />
            <ContributorCard
              firstName='Matthias'
              lastName='Hauswirth'
              contribution='Organization'
              imageName='MatthiasHauswirth.jpg'
            />
          </Grid>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            <Trans
              t={t}
              i18nKey='notes.luce'
              components={{ a: <Link href='https://luce.si.usi.ch' /> }}
            />
          </Typography>

          <Typography
            variant='h4'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.pedagogy')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.pedagogyIntro')}
          </Typography>
          <List sx={{ width: '100%' }}>
            {[
              {
                title: t('notes.pairProgramming.title'),
                description: t('notes.pairProgramming.desc'),
              },
              {
                title: t('notes.platforms.title'),
                description: t('notes.platforms.desc'),
              },
              {
                title: t('notes.competencies.title'),
                description: t('notes.competencies.desc'),
              },
              {
                title: t('notes.misconceptions.title'),
                description: (
                  <Trans
                    t={t}
                    i18nKey='notes.misconceptions.desc'
                    components={{
                      selfCheck: (
                        <Link href='https://progmiscon.org/selfCheck?pl=Python' />
                      ),
                      progmiscon: <Link href='https://progmiscon.org' />,
                      assignCompares: (
                        <Link href='https://progmiscon.org/misconceptions/Python/AssignCompares' />
                      ),
                      outsideInFunctionNesting: (
                        <Link href='https://progmiscon.org/misconceptions/Python/OutsideInFunctionNesting' />
                      ),
                    }}
                  />
                ),
              },
              {
                title: t('notes.tasks.title'),
                description: t('notes.tasks.desc'),
              },
              {
                title: t('notes.placeholders.title'),
                description: (
                  <Trans
                    t={t}
                    i18nKey='notes.placeholders.desc'
                    components={{
                      code: <code />,
                    }}
                  />
                ),
              },
              {
                title: t('notes.errors.title'),
                description: t('notes.errors.desc'),
              },
              {
                title: t('notes.stuck.title'),
                description: t('notes.stuck.desc'),
              },
              {
                title: t('notes.typeError.title'),
                description: t('notes.typeError.desc'),
              },
              {
                title: t('notes.nameError.title'),
                description: t('notes.nameError.desc'),
              },
              {
                title: t('notes.syntaxError.title'),
                description: t('notes.syntaxError.desc'),
              },
              {
                title: t('notes.importError.title'),
                description: t('notes.importError.desc'),
              },
            ].map(({ title, description }) => (
              <ListItem key={title}>
                <ListItemAvatar>
                  <Avatar sx={{ backgroundColor: '#00000000' }}>💡</Avatar>
                </ListItemAvatar>
                <ListItemText primary={title} secondary={description} />
              </ListItem>
            ))}
          </List>

          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.beyond')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            <Trans
              t={t}
              i18nKey='notes.beyondDesc'
              components={{ cards: <Link href='/tamarocards' /> }}
            />
          </Typography>

          <Typography
            variant='h4'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.contentProgramming')}
          </Typography>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.compositionCastle')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.compositionCastleDesc')}
          </Typography>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src={CastleListImage}
              alt='Photo of Castle'
              width='1261'
              height='831'
              sizes='100vw'
              style={{
                width: '60%',
                height: 'auto',
              }}
            />
          </div>

          <Typography
            sx={{
              marginY: 3,
            }}
          >
            <Trans
              t={t}
              i18nKey='notes.function'
              components={{ strong: <strong /> }}
            />
          </Typography>
          <Grid
            container
            direction='row'
            spacing={2}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Grid size={12}>
              <div
                style={{
                  color: '#E50201',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {t('notes.noInput')}
              </div>
            </Grid>
            <Grid size={4}>
              <div style={{ display: 'flex', justifyContent: 'right' }}>
                {t('notes.arguments')}
              </div>
            </Grid>
            <Grid size={4}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={PureFunctionImage}
                  alt={t('notes.altPure')}
                  width='800'
                  height='588'
                  sizes='100vw'
                  style={{
                    width: '50%',
                    height: 'auto',
                  }}
                />
              </div>
            </Grid>
            <Grid size={4}>
              <div style={{ display: 'flex', justifyContent: 'left' }}>
                {t('notes.returnValue')}
              </div>
            </Grid>
            <Grid size={12}>
              <div
                style={{
                  color: '#E50201',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {t('notes.noOutput')}
              </div>
            </Grid>
          </Grid>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            <Trans
              t={t}
              i18nKey='notes.pureFunction'
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
              i18nKey='notes.problemDecomposition'
              components={{ strong: <strong /> }}
            />
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src={ProblemSolutionImage}
              alt={t('notes.altProblemDecomposition')}
              width='1280'
              height='831'
              sizes='100vw'
              style={{
                width: '50%',
                height: 'auto',
              }}
            />
          </div>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.independentSubproblems')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.pytamaroPure')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            <Trans
              t={t}
              i18nKey='notes.playWithGraphics'
              components={{ strong: <strong /> }}
            />
          </Typography>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.truthPieces')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.truthPiecesDesc')}
          </Typography>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.learningObjectives')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.matrixIntro', { curriculumTitle: curriculum.title })}
          </Typography>
          <ActivitiesCompetenciesMatrix curriculum={curriculum} />
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            <Trans
              t={t}
              i18nKey='notes.matrixMore'
              components={{
                a: (
                  <a
                    href={curriculumInfoPathname(
                      curriculum.authorSlug,
                      curriculum.slug,
                    )}
                  />
                ),
              }}
            />
          </Typography>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.moreActivities')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.moreActivitiesDesc')}
          </Typography>
          <Typography
            align='center'
            sx={{
              marginY: 3,
            }}
          >
            <NextLink href='/curricula/luce/welcome' passHref>
              <Button variant='contained'>
                {t('notes.welcomeCurriculum')}
              </Button>
            </NextLink>{' '}
            <NextLink href='/activities/luce' passHref>
              <Button variant='contained'>{t('notes.activityGallery')}</Button>
            </NextLink>
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.hearFromYou')}
          </Typography>

          <Typography
            variant='h4'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.contentHistory')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            {t('notes.medievalCastles')}
          </Typography>

          <Image
            src={FortezzaBellinzonaHistory}
            alt={t('notes.timelineAlt')}
            width='3070'
            height='2125'
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
            <Trans
              t={t}
              i18nKey='notes.learnMoreFortezza'
              components={{ a: <Link href={t('start.fortezzaURL')} /> }}
            />
          </Typography>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.glossaryCastle')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            <Trans
              t={t}
              i18nKey='notes.glossaryCastleDesc'
              components={{ a: <Link href={t('start.fortezzaURL')} /> }}
            />
          </Typography>
          <Grid container spacing={2}>
            {[
              {
                term: t('notes.battlement'),
                image: BattlementImage,
                definition: t('notes.battlementDesc'),
              },
              {
                term: t('notes.curtainWall'),
                image: CurtainWallImage,
                definition: t('notes.curtainWallDesc'),
              },
              {
                term: t('notes.drawbridge'),
                image: DrawbridgeImage,
                definition: t('notes.drawbridgeDesc'),
              },
              {
                term: t('notes.merlon'),
                image: MerlonImage,
                definition: t('notes.merlonDesc'),
              },
            ].map(({ term, image, definition }) => (
              <Grid
                key={term}
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <CardMedia>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <Image
                        src={image}
                        alt={t('notes.photoOf', { term })}
                        sizes='100vw'
                        style={{
                          width: '100%',
                          height: 'auto',
                        }}
                      />
                    </div>
                  </CardMedia>
                  <CardContent>
                    <Typography gutterBottom variant='h5' component='div'>
                      {term}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {definition}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            sx={{
              marginTop: 5,
              marginBottom: '16px',
            }}
          >
            {t('notes.literatureCastles')}
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            J. E. Kaufmann &amp; H. W. Kaufmann; Robert M. Jurga (Illustrator).{' '}
            <Link href='https://www.dacapopress.com/titles/j-e-kaufmann/the-medieval-fortress/9780306813580/'>
              The Medieval Fortress: Castles, Forts, And Walled Cities Of The
              Middle Ages
            </Link>
            . Da Capo Press, 2004. ISBN 978-0-306-81358-0.
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            David Macaulay.{' '}
            <Link href='https://www.harpercollins.com/products/castle-david-macaulay'>
              Castle
            </Link>
            . Clarion Books, 2013. ISBN 978-0-544-10226-2.
          </Typography>
          <Typography
            sx={{
              marginY: 3,
            }}
          >
            Horst Wolfgang Böhme, Reinhard Friedrich, Barbara Schock-Werner
            (Hrsg.){' '}
            <Link href='https://books.ub.uni-heidelberg.de/arthistoricum/catalog/book/535'>
              Wörterbuch der Burgen, Schlösser und Festungen
            </Link>
            . Heidelberg: arthistoricum.net-ART-Books, 2020.
          </Typography>

          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps({
  params,
}: {
  params: { language: string };
}) {
  const authorSlug = 'luce-hoc';
  const language = params.language as 'en' | 'it' | 'de';
  const curriculumByLanguage = {
    en: 'castle',
    it: 'castello',
    de: 'burg',
  };
  const curriculum = await getCurriculum(
    authorSlug,
    curriculumByLanguage[language],
  );
  return {
    props: {
      curriculum,
      ...(await translationProps(['hourofcode'])),
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
