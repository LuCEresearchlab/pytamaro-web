import { NavigateNext } from '@mui/icons-material';
import { Breadcrumbs, Link } from '@mui/material';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { documentationElementPathname, documentationModulePathname, documentationPathname } from '../../src/urlUtils';

export default function DocBreadcrumbs(
  { module = undefined, name = undefined, nameKind = undefined } :
  { module?: string, name?: string, nameKind?: string },
) {
  const { t } = useLocalTranslation();
  return (
    <Breadcrumbs
      separator={<NavigateNext fontSize="small" />}
      aria-label="breadcrumb"
      sx={{
        mb: 4,
        fontSize: '1.2em',
        '& ol': {
          justifyContent: 'center',
          margin: 'auto',
        },
      }}
    >
      <Link key="doc" href={documentationPathname()} color="inherit" underline="hover">
        {t('documentation')}
      </Link>
      {module && (
      <Link key="mod" href={documentationModulePathname(module)} color={name ? 'inherit' : 'primary'} underline="hover">
        {t('library')}
        {' '}
        <strong>{module}</strong>
      </Link>
      )}
      {module && name && nameKind && (
        <Link key="name" href={documentationElementPathname(module, name)} color="primary" underline="hover">
          {t(nameKind)}
          {' '}
          <strong>{name}</strong>
        </Link>
      )}
    </Breadcrumbs>
  );
}
