import { Badge, BadgeProps, styled } from '@mui/material';
import theme from '../src/theme';

export const TopRightBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    backgroundColor: theme.palette.grey[600],
    color: 'white',
  },
  width: '100%',
}));
