import { SyncProblem } from '@mui/icons-material';
import { Badge, BadgeProps, styled, Tooltip } from '@mui/material';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import theme from '../src/theme';

const TopRightBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    backgroundColor: theme.palette.grey[600],
    color: 'white',
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
      invisible={hidden}
    >
      {children}
    </TopRightBadge>
  );
}
