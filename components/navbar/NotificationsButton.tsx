import { NotificationsOutlined } from '@mui/icons-material';
import { Badge, Button, Card, CardActions } from '@mui/material';
import produce from 'immer';
import { useState } from 'react';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { aboutPathname } from '../../src/urlUtils';
import ChangelogList, { changelogEntries } from '../ChangelogList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import NavBarButton from './NavBarButton';

const DEFAULT_SHOW_COUNT = 3;

export default function NotificationsButton() {
  const { t } = useLocalTranslation();
  const { metadata, setMetadata } = useLocalProfile();
  const unreadEntries = changelogEntries
    .slice(metadata.lastNotificationSeen + 1)
    .filter((entry) => entry.silent !== true);
  const unreadCount = unreadEntries.length;
  const showCount = unreadCount === 0 ? DEFAULT_SHOW_COUNT : unreadCount;
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open === false) {
      setMetadata((currentMetadata) =>
        produce(currentMetadata, (draft) => {
          draft.lastNotificationSeen = changelogEntries.length - 1;
        }),
      );
    }
    setIsOpen(open);
  };

  const handleClick = () => {
    handleOpenChange(!isOpen);
  };

  return (
    <Popover placement='bottom' open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger onClick={handleClick}>
        <NavBarButton label={t('notifications')}>
          <Badge badgeContent={unreadCount} invisible={isOpen} color='error'>
            <NotificationsOutlined />
          </Badge>
        </NavBarButton>
      </PopoverTrigger>
      <PopoverContent>
        <Card elevation={0} sx={{ maxWidth: '60ch' }}>
          <ChangelogList start={0} end={showCount} />
          <CardActions>
            <Button size='small' href={aboutPathname()}>
              See All
            </Button>
          </CardActions>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
