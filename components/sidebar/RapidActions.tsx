import { LibraryBooks, MenuBook } from '@mui/icons-material';
import { Link, Stack } from '@mui/material';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { documentationPathname, pytamaroDocsUrl } from '../../src/urlUtils';
import SidebarItem from './SidebarItem';
import SidebarPlayground from './SidebarPlayground';

export default function RapidActions() {
  const { t } = useLocalTranslation(['common']);
  return (
    <SidebarItem title={t('atMyFingertips')}>
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
          PyTamaro ReadTheDocs
        </Link>
        <Link
          variant="body2"
          underline="none"
          href={documentationPathname()}
          display="flex"
        >
          <LibraryBooks fontSize="small" sx={{ mr: '.7ch' }} />
          {t('documentation')}
        </Link>
      </Stack>
    </SidebarItem>
  );
}
