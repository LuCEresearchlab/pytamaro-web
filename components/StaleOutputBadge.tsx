import { SyncProblem } from '@mui/icons-material';
import { Badge, BadgeProps, styled, Tooltip } from '@mui/material';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

const TopRightBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  width: '100%',
}));

export default function StaleOutputBadge({
  hidden,
  children,
}: {
  hidden: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLocalTranslation();
  return (
    <TopRightBadge
      badgeContent={
        <Tooltip arrow title={t('staleOutput')}>
          <SyncProblem />
        </Tooltip>
      }
      color='error'
      invisible={hidden}
    >
      {children}
    </TopRightBadge>
  );
}
