import { SyncProblem } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { TopRightBadge } from './TopRightBadge';

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
