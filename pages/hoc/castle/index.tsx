/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  GridLegacy as Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import HourOfCodeFooter from '../../../components/HourOfCodeFooter';
import NavigationBar from '../../../components/navbar/NavigationBar';
import PyTamaroLogoImage from '../../../public/PyTamaro-horizontal.png';
import USIInfLogoImage from '../../../public/USI_logo-statico_info-eng.png';
import HourOfCodeLogoImage from '../../../public/hoc/HourOfCode_logo_RGB.png';
import MarketingImage from '../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay-transparent.png';
import useLocalProfile from '../../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import { translationProps } from '../../../src/serverSideTranslationProps';

const MIN_AGE_YEARS = 13;
const MIN_AGE_MONTHS_DATA_COLLECTION = MIN_AGE_YEARS * 12;

enum Steps {
  LANGUAGE,
  AGE,
  BEGIN_HOC,
}

export default function HocCastlePage() {
  const router = useRouter();
  // No need for age screening if 'usi' is in the query
  const skipAgeScreening = router.query.usi !== undefined;

  const [step, setStep] = useState(Steps.LANGUAGE);

  const today = new Date();
  const [yearOfBirth, setYearOfBirth] = useState('');
  const [monthOfBirth, setMonthOfBirth] = useState('');
  const [yobError, setYobError] = useState(false);
  const [mobError, setMobError] = useState(false);

  const [dataSharingAllowed, setDataSharingAllowed] = useState(false);
  const { setDataSharingPreference } = useLocalProfile();

  const [chosenLanguage, setChosenLanguage] = useState('en');

  const { i18n } = useLocalTranslation(['hourofcode']);
  const t = i18n.getFixedT(chosenLanguage, 'hourofcode');

  const onYearOfBirthChange = (e: { target: { value: string } }) => {
    setYearOfBirth(e.target.value);
    const newValue = parseInt(e.target.value, 10);
    setYobError(newValue < 1900 || newValue > today.getFullYear());
  };
  const onMonthOfBirthChange = (e: { target: { value: string } }) => {
    setMonthOfBirth(e.target.value);
    const newValue = parseInt(e.target.value, 10);
    setMobError(newValue < 1 || newValue > 12);
  };

  const handleLangSelection = (lang: string) => {
    setChosenLanguage(lang);
    setStep(skipAgeScreening ? Steps.BEGIN_HOC : Steps.AGE);
  };

  const handleAgeDialogClose = () => {
    if (!yearOfBirth || !monthOfBirth || yobError || mobError) {
      setStep(Steps.LANGUAGE);
    } else {
      // Explicitly disable for users that are not old enough
      if (!dataSharingAllowed) {
        setDataSharingPreference('no');
      }
      setStep(Steps.BEGIN_HOC);
    }
  };

  // Effects
  useEffect(() => {
    if (!yearOfBirth || !monthOfBirth) {
      return;
    }
    const now = new Date();
    const yearInt = parseInt(yearOfBirth, 10);
    const monthInt = parseInt(monthOfBirth, 10);
    const age =
      now.getFullYear() * 12 + (now.getMonth() + 1) - (yearInt * 12 + monthInt);
    setDataSharingAllowed(
      !(yobError || mobError) && age >= MIN_AGE_MONTHS_DATA_COLLECTION,
    );
  }, [yearOfBirth, monthOfBirth, yobError, mobError]);

  useEffect(() => {
    if (step === Steps.BEGIN_HOC) {
      // If the user is old enough, but they did not
      // give consent, still allow them to proceed.
      // The data sharing dialog will appear again
      // later as they perform the first activity.
      // The dialog will not appear again if the user
      // is not old enough, as we explicitly disable data
      // sharing in the handleAgeDialogClose function if
      // that's the case.
      window.open(`/hoc/castle/${chosenLanguage}`, '_self');
    }
  }, [step, chosenLanguage]);

  return (
    <div>
      <Head>
        <title>{t('intro.hoc')}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <Grid
            container
            justifyContent='center'
            spacing={2}
            sx={{ mt: '2rem', mb: '2rem' }}
          >
            <Grid xs={4} item>
              <Image
                src={PyTamaroLogoImage}
                alt='PyTamaro Logo'
                style={{
                  display: 'block',
                  margin: 'auto',
                  width: '90%',
                  height: 'auto',
                }}
              />
            </Grid>
            <Grid xs={4} item>
              <Image
                src={HourOfCodeLogoImage}
                alt='Hour Of Code Logo'
                style={{
                  display: 'block',
                  margin: 'auto',
                  width: '30%',
                  height: 'auto',
                }}
              />
            </Grid>
            <Grid xs={4} item>
              <Image
                src={USIInfLogoImage}
                alt='USI Logo'
                style={{
                  display: 'block',
                  margin: 'auto',
                  width: '70%',
                  height: 'auto',
                }}
              />
            </Grid>
          </Grid>

          <Container maxWidth='sm'>
            <Image
              src={MarketingImage}
              alt='Photo of Castle'
              style={{
                display: 'block',
                margin: 'auto',
                width: '100%',
                height: 'auto',
              }}
            />
          </Container>

          <Grid container justifyContent='center' spacing={2}>
            {['en', 'it', 'de'].map((lang) => {
              const langT = i18n.getFixedT(lang, 'hourofcode');
              return (
                <Grid key={`lang_selector_${lang}`} xs={6} md={4} item>
                  <Card elevation={1}>
                    <CardActionArea onClick={() => handleLangSelection(lang)}>
                      <CardContent>
                        <Typography
                          sx={{ fontSize: '2rem' }}
                          color='text.secondary'
                          gutterBottom
                        >
                          {langT('locale.flag')}
                        </Typography>
                        <Typography variant='h5' component='div'>
                          {langT('locale.name')}
                        </Typography>
                        <Typography variant='caption'>
                          {langT('intro.hoc')}
                        </Typography>
                        <Typography variant='body2'>
                          {langT('intro.goal')}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Age dialog */}
          <Dialog open={step === Steps.AGE}>
            <DialogTitle>{t('age.title')}</DialogTitle>

            <DialogContent>
              <Grid container justifyContent='center' spacing={2} marginY={2}>
                <Grid item xs={5}>
                  <TextField
                    label={t('age.year')}
                    value={yearOfBirth}
                    onChange={onYearOfBirthChange}
                    error={yobError}
                    helperText={yobError ? t('age.error.year') : undefined}
                    type='number'
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    select
                    label={t('age.month')}
                    value={monthOfBirth}
                    onChange={onMonthOfBirthChange}
                    error={mobError}
                    helperText={mobError ? t('age.error.month') : undefined}
                    fullWidth
                  >
                    {Array.from(Array(12).keys()).map((month) => (
                      <MenuItem
                        key={`month_${month}`}
                        value={(month + 1).toString()}
                      >
                        {new Date(today.getFullYear(), month).toLocaleString(
                          chosenLanguage,
                          { month: 'long' },
                        )}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setStep(Steps.LANGUAGE)}>
                {t('action.cancel')}
              </Button>
              <Button
                disabled={yobError || mobError}
                onClick={handleAgeDialogClose}
              >
                {t('action.confirm')}
              </Button>
            </DialogActions>
          </Dialog>
          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps(['hourofcode'])),
    },
  };
}
