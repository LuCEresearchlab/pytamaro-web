import { AccessAlarm } from '@mui/icons-material';
import {
  Alert, AlertTitle, Button, Collapse, TextField,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import useLocalProfile from '../src/localStorage/useLocalProfile';
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
  const [answer, setAnswer] = useState(currentDoNowInfo?.answer || '');
  const setBlurred = useCallback((blurred: boolean) => {
    const className = 'blurred';
    let nextDoNowEncountered = false;
    // Magic CSS selector to select all siblings after the current element
    // (so that all the elements after the Do Now box are blurred,
    // possibly until the next Do Now box included).
    document.querySelectorAll(`#${id} ~ *`).forEach((element) => {
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
  const [showDidItButton, setShowDidItButton] = useState(!alreadyDidIt);

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
    setShowDidItButton(false);
    logAnalyticsEvent(AnalyticsEventName.DoNowCompleted, { id: `${activityVariantId(activityVariant)}/${id}` });
    storeDbEvent(EventName.DoNowCompleted, metadata, { activityVariant, id, answer });
    // Wait before updating the metadata, allowing the collapse animation to finish
    setTimeout(() => {
      if (currentActivity) {
        setActivityMetadata(activityVariant, {
          ...currentActivity,
          doNowCompleted: [...currentActivity.doNowCompleted, { id, answer }],
        });
      }
    }, 250);
  };

  return (
    <Alert
      severity="warning"
      id={id}
      className={doNowBoxClassName}
      icon={<AccessAlarm />}
      sx={{ fontSize: theme.typography.body1.fontSize, marginY: 2 }}
    >
      <AlertTitle sx={{ fontSize: '1rem' }}>Do Now!</AlertTitle>
      {children}
      {requireAnswer && (
      <TextField
        sx={{ mb: showDidItButton ? 2 : 0 }}
        size="small"
        label="Your answer"
        variant="outlined"
        fullWidth
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        disabled={alreadyDidIt}
      />
      )}
      <Collapse in={showDidItButton}>
        <Button variant="outlined" color="warning" onClick={handleDidIt} disabled={requireAnswer && !answer}>
          {requireAnswer ? 'Save and Continue' : 'I did it!'}
        </Button>
      </Collapse>
    </Alert>
  );
}
