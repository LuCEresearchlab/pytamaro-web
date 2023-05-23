import { IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import InfoIcon from '@mui/icons-material/Info';
import { activityPathname } from '../src/urlUtils';

export default function ActivityInfoButton({ authorSlug, activitySlug }:
{ authorSlug: string, activitySlug: string }) {
  const router = useRouter();
  return (
    <Tooltip title="Activity Info">
      <span>
        <IconButton
          sx={{ ml: 1 }}
          color="neutral"
          onClick={() => router.push(activityPathname(authorSlug, activitySlug))}
        >
          <InfoIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}
