import { SyncProblem } from '@mui/icons-material';
import { SxProps, Theme, Tooltip } from '@mui/material';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  OverhangingBadge,
  VerticallyOverhangingBadge,
} from './OverhangingBadge';

export default function StaleOutputBadge({
  hidden,
  children,
  overhang = 'both',
  sx = {},
}: {
  hidden: boolean;
  children: React.ReactNode;
  overhang?: 'both' | 'vertical';
  sx?: SxProps<Theme>;
}) {
  const { t } = useLocalTranslation();
  const Badge =
    overhang === 'vertical' ? VerticallyOverhangingBadge : OverhangingBadge;
  return (
    <Badge
      sx={sx}
      badgeContent={
        <Tooltip arrow title={t('staleOutput')}>
          <SyncProblem />
        </Tooltip>
      }
      invisible={hidden}
    >
      {children}
    </Badge>
  );
}
