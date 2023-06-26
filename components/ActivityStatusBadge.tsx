import styled from '@emotion/styled';
import {
  EmojiEvents, Lock, Timeline,
} from '@mui/icons-material';
import {
  Badge, BadgeProps, Icon, Tooltip,
} from '@mui/material';
import { ActivityVariantMetadata } from '../src/localStorage/schema';
import { ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';
import theme from '../src/theme';

export type ActivityStatus = 'initial' | 'in-progress' | 'completed';

const StatusBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'transparent',
    fontSize: theme.typography.h3.fontSize,
  },
  width: '100%',
}));

export function activityVariantStatus(
  activities: ActivityVariantMetadata[],
  variant: ActivityVariant,
) : ActivityStatus {
  const activity = activities.find((a) => a.id === activityVariantId(variant));
  if (!activity) {
    return 'initial';
  }
  if (activity.completed) {
    return 'completed';
  }
  return activity.cellsModified ? 'in-progress' : 'initial';
}

export default function ActivityStatusBadge({ children, status, locked = false } :
{ children: JSX.Element, status: ActivityStatus, locked ?: boolean }) {
  if (!locked && status === 'initial') {
    return children;
  }

  // Assume locked (overrides activity status)
  let tooltipTitle = 'Complete previous activities to unlock';
  let badgeIcon = Lock;

  // If not, check activity status
  if (!locked) {
    if (status === 'in-progress') {
      tooltipTitle = 'Activity In Progress';
      badgeIcon = Timeline;
    } else if (status === 'completed') {
      tooltipTitle = 'Activity Completed';
      badgeIcon = EmojiEvents;
    }
  }
  return (
    <StatusBadge
      badgeContent={<Tooltip title={tooltipTitle} arrow><Icon component={badgeIcon} fontSize="inherit" color="primary" sx={{ filter: 'drop-shadow(0 0 .15rem)' }} /></Tooltip>}
    >
      {children}
    </StatusBadge>
  );
}
