import { Box } from '@mui/material';
import SidebarTitle from './SidebarTitle';

export default function SidebarItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <SidebarTitle>{title}</SidebarTitle>
      {children}
    </Box>
  );
}
