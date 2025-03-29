import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import theme from '../../src/theme';

const SidebarTitle = styled(Typography)(() => ({
  paddingBottom: theme.spacing(1),
  fontSize: theme.typography.pxToRem(11),
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'uppercase' as const,
  letterSpacing: '.08rem',
  color: theme.palette.grey[600],
}));

export default SidebarTitle;
