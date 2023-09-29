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
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import HourOfCodeFooter from '../../../components/HourOfCodeFooter';
import NavigationBar from '../../../components/NavigationBar';
import MarketingImage from '../../../public/hoc/castle/MarketingImage-NoText-NoList-Overlay-transparent.png';
import useLocalProfile from '../../../src/localStorage/useLocalProfile';

const HOC_TP_URL = 'https://code.org/api/hour/begin_dance.png';

const MIN_AGE_YEARS = 13;
const MIN_AGE_MONTHS_DATA_COLLECTION = MIN_AGE_YEARS * 12;

type LangRes = {
  code: string,
  locale: {
    flag: string,
    name: string,
  },
  intro: {
    hoc: string,
    goal: string,
  },
  action: {
    confirm: string,
    cancel: string,
  },
  age: {
    title: string,
    year: string,
    month: string,
    error: {
      year: string,
      month: string,
    },
  },
};

const RESOURCES: LangRes[] = [
  {
    code: 'en',
    locale: {
      flag: '🇺🇸',
      name: 'English',
    },
    intro: {
      hoc: 'Hour of Code',
      goal: 'Program Your Own Castle',
    },
    action: {
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    age: {
      title: 'When were you born?',
      year: 'Year',
      month: 'Month',
      error: {
        month: 'Invalid month',
        year: 'Invalid year',
      },
    },
  },
  {
    code: 'it',
    locale: {
      flag: '🇮🇹',
      name: 'Italiano',
    },
    intro: {
      hoc: 'Ora del Codice',
      goal: 'Programma il tuo Castello',
    },
    action: {
      confirm: 'Conferma',
      cancel: 'Annulla',
    },
    age: {
      title: 'Quando sei nato?',
      year: 'Anno',
      month: 'Mese',
      error: {
        month: 'Mese non valido',
        year: 'Anno non valido',
      },
    },
  },
  {
    code: 'de',
    locale: {
      flag: '🇩🇪',
      name: 'Deutsch',
    },
    intro: {
      hoc: 'Stunde des Codes',
      goal: 'Programmiere Deine Burg',
    },
    action: {
      confirm: 'Ok',
      cancel: 'Abbrechen',
    },
    age: {
      title: 'Wann bist du geboren?',
      year: 'Jahr',
      month: 'Monat',
      error: {
        month: 'Ungültiger Monat',
        year: 'Ungültiges Jahr',
      },
    },
  },
];

enum Steps {
  LANGUAGE,
  AGE,
  BEGIN_HOC,
}

export default function HocCastlePage() {
  const [step, setStep] = useState(Steps.LANGUAGE);

  const [res, setRes] = useState(RESOURCES[0]);

  const today = new Date();
  const [yearOfBirth, setYearOfBirth] = useState(today.getFullYear());
  const [monthOfBirth, setMonthOfBirth] = useState(today.getMonth() + 1);
  const [yobError, setYobError] = useState(false);
  const [mobError, setMobError] = useState(false);

  const [dataSharingAllowed, setDataSharingAllowed] = useState(false);
  const { setDataSharingPreference } = useLocalProfile();

  const onYearOfBirthChange = (e: { target: { value: string } }) => {
    const newValue = parseInt(e.target.value, 10);
    setYearOfBirth(newValue);
    setYobError(newValue < 1900 || newValue > today.getFullYear());
  };
  const onMonthOfBirthChange = (e: { target: { value: string } }) => {
    const newValue = parseInt(e.target.value, 10);
    setMonthOfBirth(newValue);
    setMobError(newValue < 1 || newValue > 12);
  };

  const handleLangSelection = (lang: LangRes) => {
    setRes(lang);
    setStep(Steps.AGE);
  };

  const handleAgeDialogClose = () => {
    if (yobError || mobError) {
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
    const now = new Date();
    const age = (now.getFullYear() * 12 + (now.getMonth() + 1))
      - (yearOfBirth * 12 + monthOfBirth);
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
      window.open(`/hoc/castle/${res.code}`, '_self');
    }
  }, [step, res.code]);

  return (
    <div>
      <Head>
        <title>{res.intro.hoc}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container maxWidth="md">

          <Image
            src={MarketingImage}
            alt="Photo of Castle"
            style={{
              display: 'block',
              margin: 'auto',
              width: '100%',
              height: 'auto',
            }}
          />

          <Grid
            container
            justifyContent="center"
            spacing={2}
          >
            {RESOURCES.map((lang) => (
              <Grid
                key={`lang_selector_${lang.code}`}
                xs={4}
                item
              >
                <Card elevation={1}>
                  <CardActionArea onClick={() => handleLangSelection(lang)}>
                    <CardContent>
                      <Typography
                        sx={{ fontSize: '2rem' }}
                        color="text.secondary"
                        gutterBottom
                      >
                        {lang.locale.flag}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {lang.locale.name}
                      </Typography>
                      <Typography variant="caption">
                        {lang.intro.hoc}
                      </Typography>
                      <Typography variant="body2">
                        {lang.intro.goal}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Age dialog */}
          <Dialog open={step === Steps.AGE}>
            <DialogTitle>
              {res.age.title}
            </DialogTitle>

            <DialogContent>
              <Grid
                container
                justifyContent="center"
                spacing={2}
                marginY={2}
              >
                <Grid item xs={5}>
                  <TextField
                    label={res.age.year}
                    value={yearOfBirth}
                    onChange={onYearOfBirthChange}
                    error={yobError}
                    helperText={yobError ? res.age.error.year : undefined}
                    type="number"
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    select
                    label={res.age.month}
                    value={monthOfBirth}
                    onChange={onMonthOfBirthChange}
                    error={mobError}
                    helperText={mobError ? res.age.error.month : undefined}
                    type="number"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {Array.from(Array(12).keys()).map((month) => (
                      <option key={`month_${month}`} value={month + 1}>
                        {new Date(yearOfBirth, month).toLocaleString(res.code, { month: 'long' })}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setStep(Steps.LANGUAGE)}>
                {res.action.cancel}
              </Button>
              <Button
                disabled={yobError || mobError}
                onClick={handleAgeDialogClose}
              >
                {res.action.confirm}
              </Button>
            </DialogActions>
          </Dialog>

          <Image
            src={HOC_TP_URL}
            width="1"
            height="1"
            alt="HoC participation tracking pixel"
          />
          <HourOfCodeFooter />
        </Container>
      </Box>
    </div>
  );
}
