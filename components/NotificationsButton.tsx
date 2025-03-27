import { Notifications } from '@mui/icons-material';
import {
  Badge,
  Button,
  Card,
  CardActions,
  IconButton,
} from '@mui/material';
import produce from 'immer';
import { useState } from 'react';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import theme from '../src/theme';
import { aboutPathname } from '../src/urlUtils';
import ChangelogList, { changelogEntries } from './ChangelogList';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

const DEFAULT_SHOW_COUNT = 3;

export default function NotificationsButton() {
  const { metadata, setMetadata } = useLocalProfile();
  const unreadCount = (changelogEntries.length - 1) - metadata.lastNotificationSeen;
  const showCount = unreadCount === 0 ? DEFAULT_SHOW_COUNT : unreadCount;
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open === false) {
      setMetadata((currentMetadata) => produce(currentMetadata, (draft) => {
        draft.lastNotificationSeen = changelogEntries.length - 1;
      }));
    }
    setIsOpen(open);
  };

  const handleClick = () => {
    handleOpenChange(!isOpen);
  };

  return (
    <Popover placement="bottom" open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger onClick={handleClick}>
        <IconButton
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <Badge badgeContent={unreadCount} invisible={isOpen} color="error">
            <Notifications />
          </Badge>
        </IconButton>
      </PopoverTrigger>
      <PopoverContent>
        <Card elevation={0} sx={{ maxWidth: '60ch' }}>
          <ChangelogList start={0} end={showCount} />
          <CardActions>
            <Button size="small" href={aboutPathname()}>See All</Button>
          </CardActions>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
