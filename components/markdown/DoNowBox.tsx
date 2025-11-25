import AccessAlarm from '@mui/icons-material/AccessAlarm';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  TextField,
} from '@mui/material';
import { slug } from 'github-slugger';
import { useCallback, useEffect, useState } from 'react';
import logAnalyticsEvent, {
  AnalyticsEventName,
} from '../../src/analyticsEvent';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  ActivityVariant,
  activityVariantId,
} from '../../src/schemas/activitySchema';
import { EventName, storeDbEvent } from '../../src/storeDbEvent';
import theme from '../../src/theme';

export const blurredClassName = 'blurred';

const doNowBoxClassName = 'do-now-box';

function domElementId(id: string) {
  return `donow-${id}`;
}

export default function DoNowBox({
  id: idBeforeSlug,
  requireAnswer,
  children,
  activityVariant,
}: {
  id: string;
  requireAnswer: boolean;
  children: React.ReactNode;
  activityVariant: ActivityVariant;
}) {
  // Use a slugged version of the id (preserving case) to ensure it is a valid DOM id.
  // Duplicate ids are prevented at build time, so we don't need to use the stateful Slugger here.
  const id = slug(idBeforeSlug, true);

  const { metadata, getActivityMetadata, setActivityMetadata } =
    useLocalProfile();
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
  const setBlurred = useCallback(
    (blurred: boolean) => {
      let nextDoNowEncountered = false;
      // We need to find (to blur) all the elements after the current Do Now box
      // in the same Markdown cell, as well as all the elements within the
      // subsequent Markdown/Code cells.
      const nextElementsCurrentCell = document.querySelectorAll(
        `#${domElementId(id)} ~ *`,
      );
      const allNextElements = Array.from(nextElementsCurrentCell);
      let nextElementsHolder = document.getElementById(domElementId(id))
        ?.parentElement?.nextElementSibling;
      while (nextElementsHolder) {
        // Only consider the direct children (to avoid blurring recursively).
        allNextElements.push(...Array.from(nextElementsHolder.children));
        nextElementsHolder = nextElementsHolder.nextElementSibling;
      }
      // Blur all the elements, possibly until another subsequent Do Now box is found.
      allNextElements.forEach((element) => {
        if (!nextDoNowEncountered) {
          if (blurred) {
            element.classList.add(blurredClassName);
          } else {
            element.classList.remove(blurredClassName);
          }
        }
        if (element.classList.contains(doNowBoxClassName)) {
          nextDoNowEncountered = true;
        }
      });
    },
    [id],
  );

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
    logAnalyticsEvent(AnalyticsEventName.DoNowCompleted, {
      id: `${activityVariantId(activityVariant)}/${id}`,
    });
    storeDbEvent(EventName.DoNowCompleted, metadata, {
      activityVariant,
      id,
      answer,
    });
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
      severity='warning'
      id={domElementId(id)}
      className={doNowBoxClassName}
      icon={<AccessAlarm />}
      sx={{ fontSize: theme.typography.body1.fontSize, marginY: 2 }}
    >
      <AlertTitle sx={{ fontSize: '1rem' }}>{t('doNow')}</AlertTitle>
      <Box
        sx={{
          '& > p:last-child': {
            marginBottom: 0,
          },
        }}
      >
        {children}
      </Box>
      <Box>
        {requireAnswer && (
          <TextField
            sx={{ mt: 2, mb: 0 }}
            size='small'
            label={t('yourAnswer')}
            variant='outlined'
            fullWidth
            multiline
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={alreadyDidIt}
          />
        )}
        <Collapse in={!alreadyDidIt}>
          <Button
            sx={{ mt: 2 }}
            variant='outlined'
            color='warning'
            onClick={handleDidIt}
            disabled={requireAnswer && !answer}
          >
            {requireAnswer ? t('saveAndContinue') : t('didIt')}
          </Button>
        </Collapse>
      </Box>
    </Alert>
  );
}
