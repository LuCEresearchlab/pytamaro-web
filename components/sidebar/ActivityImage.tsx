import { Box } from '@mui/material';
import { Activity, ActivityVariant } from '../../src/schemas/activitySchema';
import ActivityCardMedia from '../ActivityCardMedia';
import SidebarTitle from './SidebarTitle';

export default function ActivityImage({
  activity,
  variant,
  title,
}: {
  activity: Activity;
  variant: ActivityVariant;
  title: string;
}) {
  return (
    <Box sx={{ zIndex: 100 }}>
      <SidebarTitle>{title}</SidebarTitle>
      <Box
        sx={{
          transformOrigin: 'top right',
          transition: 'transform .2s',
          '&:hover': {
            transform: 'scale(4)',
          },
        }}
      >
        <ActivityCardMedia activity={activity} variant={variant} />
      </Box>
    </Box>
  );
}
