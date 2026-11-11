import { Badge, BadgeProps, styled } from '@mui/material';
import theme from '../src/theme';

const CustomOverhangingBadge = (onlyVertical: boolean) =>
  styled(Badge)<BadgeProps>(() => ({
    width: '100%',
    '& .MuiBadge-badge': {
      right: onlyVertical ? '0.5rem' : '1rem',
      zIndex: onlyVertical ? 11 : 1,
      ...(onlyVertical && { translate: '-50% 0' }),
      paddingLeft: '1rem',
      paddingRight: '1rem',
      backgroundColor: theme.palette.grey[600],
      color: 'white',
    },
  }));

export const OverhangingBadge = CustomOverhangingBadge(false);
export const VerticallyOverhangingBadge = CustomOverhangingBadge(true);
