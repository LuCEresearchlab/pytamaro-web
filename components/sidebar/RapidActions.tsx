import MenuBook from '@mui/icons-material/MenuBook';
import { Link, Stack } from '@mui/material';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { documentationPathname } from '../../src/urlUtils';
import SidebarItem from './SidebarItem';
import SidebarPlayground from './SidebarPlayground';

export default function RapidActions() {
  const { t } = useLocalTranslation(['common']);
  return (
    <SidebarItem title={t('atMyFingertips')}>
      <Stack direction='column' spacing={1}>
        <SidebarPlayground />
        <Link
          variant='body2'
          underline='none'
          href={documentationPathname()}
          display='flex'
        >
          <MenuBook fontSize='small' sx={{ mr: '.7ch' }} />
          {t('documentation')}
        </Link>
      </Stack>
    </SidebarItem>
  );
}
