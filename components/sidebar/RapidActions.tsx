import { MenuBook } from '@mui/icons-material';
import { Link, Stack } from '@mui/material';
import { pytamaroDocsUrl } from '../../src/urlUtils';
import SidebarItem from './SidebarItem';
import SidebarPlayground from './SidebarPlayground';

export default function RapidActions() {
  return (
    <SidebarItem title="At My Fingertips">
      <Stack direction="column" spacing={1}>
        <SidebarPlayground />
        <Link
          variant="body2"
          underline="none"
          href={pytamaroDocsUrl()}
          display="flex"
          target="_blank"
        >
          <MenuBook fontSize="small" sx={{ mr: '.7ch' }} />
          Documentation
        </Link>
      </Stack>
    </SidebarItem>
  );
}
