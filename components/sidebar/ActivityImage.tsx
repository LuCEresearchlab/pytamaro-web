import { Fullscreen } from '@mui/icons-material';
import { Box, Button, Dialog } from '@mui/material';
import { useState } from 'react';
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
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <Box>
      <SidebarTitle>{title}</SidebarTitle>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ActivityCardMedia activity={activity} variant={variant} />
        {hovered && (
          <>
            <Dialog
              onClose={() => {
                setFullScreenOpen(false);
                setHovered(false);
              }}
              open={fullScreenOpen}
              maxWidth={false}
            >
              <ActivityCardMedia
                activity={activity}
                variant={variant}
                height='auto'
              />
            </Dialog>
            <Button
              onClick={() => setFullScreenOpen(true)}
              variant='contained'
              size='small'
              sx={{ position: 'absolute', right: 12, top: 32 }}
            >
              <Fullscreen />
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
