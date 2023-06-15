import { AccessAlarm } from '@mui/icons-material';
import {
  Alert, AlertTitle, Button, Collapse,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { ActivityVariant } from '../src/schemas/activitySchema';
import theme from '../src/theme';

const doNowBoxClassName = 'do-now-box';

export default function DoNowBox({ id, children, activityVariant }:
{ id: string, children: React.ReactNode, activityVariant: ActivityVariant }) {
  const { getActivityMetadata, setActivityMetadata } = useLocalProfile();
  const currentActivity = getActivityMetadata(activityVariant);
  const alreadyDidIt = currentActivity?.doNowCompleted.includes(id) ?? false;
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
    logAnalyticsEvent(AnalyticsEventName.DoNowCompleted, { activity: activityVariant, id });
    // Wait a second to allow the collapse animation to finish
    setTimeout(() => {
      if (currentActivity) {
        setActivityMetadata(activityVariant, {
          ...currentActivity,
          doNowCompleted: [...currentActivity.doNowCompleted, id],
        });
      }
    }, 1000);
  };

  return (
    <Alert
      severity="warning"
      id={id}
      className={doNowBoxClassName}
      icon={<AccessAlarm />}
      sx={{ fontSize: theme.typography.body1.fontSize }}
    >
      <AlertTitle sx={{ fontSize: '1rem' }}>Do Now!</AlertTitle>
      {children}
      <Collapse in={showDidItButton}>
        <Button variant="outlined" color="warning" onClick={handleDidIt}>I did it!</Button>
      </Collapse>
    </Alert>
  );
}
