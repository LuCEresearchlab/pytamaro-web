import { AccessAlarm } from '@mui/icons-material';
import {
  Alert, AlertTitle, Box, Button, Collapse, TextField,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import theme from '../src/theme';

const doNowBoxClassName = 'do-now-box';

export default function DoNowBox({
  id, requireAnswer, children, activityVariant,
}:
{ id: string,
  requireAnswer: boolean, children: React.ReactNode, activityVariant: ActivityVariant }) {
  const { metadata, getActivityMetadata, setActivityMetadata } = useLocalProfile();
  const currentActivity = getActivityMetadata(activityVariant);
  const currentDoNowInfo = currentActivity?.doNowCompleted.find(
    ({ id: completedId }) => completedId === id,
  );
  const alreadyDidIt = currentDoNowInfo !== undefined;
  const answerFromLocalStorage = currentDoNowInfo?.answer || '';
  const [answer, setAnswer] = useState(answerFromLocalStorage);
  useEffect(() => {
    setAnswer(answerFromLocalStorage);
  }, [answerFromLocalStorage]);
  const setBlurred = useCallback((blurred: boolean) => {
    const className = 'blurred';
    let nextDoNowEncountered = false;
    // We need to find (to blur) all the elements after the current Do Now box
    // in the same Markdown cell, as well as all the elements within the
    // subsequent Markdown/Code cells.
    const nextElementsCurrentCell = document.querySelectorAll(`#${id} ~ *`);
    const allNextElements = Array.from(nextElementsCurrentCell);
    let nextElementsHolder = document.getElementById(id)?.parentElement?.nextElementSibling;
    while (nextElementsHolder) {
      allNextElements.push(...Array.from(nextElementsHolder.querySelectorAll('*')));
      nextElementsHolder = nextElementsHolder.nextElementSibling;
    }
    // Blur all the elements, possibly until another subsequent Do Now box is found.
    allNextElements.forEach((element) => {
      if (!nextDoNowEncountered) {
        if (blurred) {
          element.classList.add(className);
        } else {
          element.classList.remove(className);
        }
      }
      if (element.classList.contains(doNowBoxClassName)) {
        nextDoNowEncountered = true;
      }
    });
  }, [id]);

  useEffect(() => {
    const performedBlur = true;
    if (!alreadyDidIt) {
      setBlurred(true);
    }
    // Cleanup the effect if we changed the DOM
    return () => {
      if (performedBlur) {
        setBlurred(false);
      }
    };
  }, [alreadyDidIt, setBlurred]);

  const handleDidIt = () => {
    setBlurred(false);
    logAnalyticsEvent(AnalyticsEventName.DoNowCompleted, { id: `${activityVariantId(activityVariant)}/${id}` });
    storeDbEvent(EventName.DoNowCompleted, metadata, { activityVariant, id, answer });
    if (currentActivity) {
      setActivityMetadata(activityVariant, {
        ...currentActivity,
        doNowCompleted: [...currentActivity.doNowCompleted, { id, answer }],
      });
    }
  };

  const { t } = useLocalTranslation();

  return (
    <Alert
      severity="warning"
      id={id}
      className={doNowBoxClassName}
      icon={<AccessAlarm />}
      sx={{ fontSize: theme.typography.body1.fontSize, marginY: 2 }}
    >
      <AlertTitle sx={{ fontSize: '1rem' }}>{t('doNow')}</AlertTitle>
      {children}
      <Box sx={{ mt: 1 }}>
        {requireAnswer && (
        <TextField
          sx={{ mb: alreadyDidIt ? 0 : 2 }}
          size="small"
          label={t('yourAnswer')}
          variant="outlined"
          fullWidth
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={alreadyDidIt}
        />
        )}
        <Collapse in={!alreadyDidIt}>
          <Button variant="outlined" color="warning" onClick={handleDidIt} disabled={requireAnswer && !answer}>
            {requireAnswer ? t('saveAndContinue') : t('didIt')}
          </Button>
        </Collapse>
      </Box>
    </Alert>
  );
}
