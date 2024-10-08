import { Chip, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { SIDEBAR_CHIPS_FONT_SIZE, SIDEBAR_CHIPS_WIDTH } from './Sidebar';
import SidebarItem from './SidebarItem';

export default function LibrariesListSidebar({ modules } :
{ modules: { id: string, label: string, url: string }[] }) {
  const { t } = useLocalTranslation();
  const router = useRouter();
  return (
    <SidebarItem title={t('libraries')}>
      <Stack
        spacing={1}
      >
        {modules.map((module) => (
          <Chip
            key={module.id}
            label={module.label}
            size="small"
            variant="filled"
            sx={{
              width: SIDEBAR_CHIPS_WIDTH,
              fontSize: SIDEBAR_CHIPS_FONT_SIZE,
            }}
            onClick={() => router.push(module.url)}
          />
        ))}
      </Stack>
    </SidebarItem>
  );
}
