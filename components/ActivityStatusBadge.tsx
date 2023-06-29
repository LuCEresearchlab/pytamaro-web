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

export default function ActivityStatusBadge({
  children, status, locked = false, small = false, noInProgress = false,
} :
{ children: JSX.Element, status: ActivityStatus, locked ?: boolean,
  small ?: boolean, noInProgress ?: boolean }) {
  if (!locked && (status === 'initial' || (noInProgress && status === 'in-progress'))) {
    return children;
  }

  // Assume locked (overrides activity status)
  let tooltipTitle = 'Complete previous activities to unlock';
  let badgeIcon = Lock;
  let badgeColor = theme.palette.grey[600];

  // If not, check activity status
  if (!locked) {
    if (status === 'in-progress') {
      tooltipTitle = 'Activity In Progress';
      badgeIcon = Timeline;
      badgeColor = theme.palette.primary.main;
    } else if (status === 'completed') {
      tooltipTitle = 'Activity Completed';
      badgeIcon = EmojiEvents;
      badgeColor = 'gold';
    }
  }
  return (
    <StatusBadge
      sx={{
        color: badgeColor,
        '& .MuiBadge-badge': {
          fontSize: theme.typography[small ? 'h4' : 'h3'].fontSize,
        },
      }}
      badgeContent={<Tooltip title={tooltipTitle} arrow><Icon component={badgeIcon} fontSize="inherit" sx={{ filter: 'drop-shadow(0 0 .05em)' }} /></Tooltip>}
    >
      {children}
    </StatusBadge>
  );
}
