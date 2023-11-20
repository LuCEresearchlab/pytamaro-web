import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import { activityPathname, curriculumInfoPathname } from '../src/urlUtils';

export default function InfoButton({ authorSlug, slug, type }:
{ authorSlug: string, slug: string, type: 'activity' | 'curriculum' }) {
  const router = useRouter();
  const handleClick = () => {
    router.push(type === 'activity' ? activityPathname(authorSlug, slug) : curriculumInfoPathname(authorSlug, slug));
  };
  return (
    <Tooltip arrow title={`Information about this ${type}`}>
      <span>
        <IconButton
          sx={{ ml: 1 }}
          color="neutral"
          onClick={handleClick}
        >
          <InfoIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}
