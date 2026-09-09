import { InfoOutlined } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { activityPathname, curriculumInfoPathname } from '../../src/urlUtils';
import NavBarButton from './NavBarButton';

export default function InfoButton({
  authorSlug,
  slug,
  type,
}: {
  authorSlug: string;
  slug: string;
  type: 'activity' | 'curriculum';
}) {
  const router = useRouter();
  const handleClick = () => {
    router.push(
      type === 'activity'
        ? activityPathname(authorSlug, slug)
        : curriculumInfoPathname(authorSlug, slug),
    );
  };
  return (
    <NavBarButton
      label={`Information about this ${type}`}
      onClick={handleClick}
    >
      <InfoOutlined />
    </NavBarButton>
  );
}
