import { ReactElement } from 'react';
import { Tooltip } from '@mui/material';

export default function LockedTooltip({ children, unlocked }:
{ children: ReactElement, unlocked: boolean }) {
  return (
    <Tooltip
      title={unlocked ? '' : 'Complete previous activities to unlock'}
      followCursor
      arrow
      placement="top-start"
    >
      {children}
    </Tooltip>
  );
}
