import styled from '@emotion/styled';
import { CheckCircleOutline, Edit } from '@mui/icons-material';
import { Badge, BadgeProps, Tooltip } from '@mui/material';
import { ActivityVariantMetadata } from '../src/localStorage/schema';
import { ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';

export type ActivityStatus = 'initial' | 'in-progress' | 'completed';

const StatusBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    padding: '1rem',
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

export default function ActivityStatusBadge({ children, status } :
{ children: React.ReactNode, status: ActivityStatus }) {
  const tooltipTitle = status === 'in-progress' ? 'Activity In Progress' : 'Activity Completed';
  const badgeIcon = status === 'in-progress' ? <Edit /> : <CheckCircleOutline />;
  const badgeColor = status === 'in-progress' ? 'info' : 'success';
  return (
    <StatusBadge
      badgeContent={<Tooltip title={tooltipTitle} arrow>{badgeIcon}</Tooltip>}
      color={badgeColor}
      invisible={status === 'initial'}
    >
      {children}
    </StatusBadge>
  );
}
