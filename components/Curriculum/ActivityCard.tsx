import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  styled,
  BadgeProps,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  CheckCircleOutlineOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { CURRICULUM_QUERY_PARAM, activityAssetPathname, activityVariantPathname } from '../../src/urlUtils';
import { Activity, activityVariantFromId, getVariantTitle } from '../../src/schemas/activitySchema';
import LockedTooltip from './LockedTooltip';
import { Curriculum, curriculumId } from '../../src/schemas/curriculumSchema';

const CompletedBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    padding: '1rem',
  },
  width: '100%',
}));

export default function ActivityCard({
  id,
  activity,
  curriculum,
  isCompleted,
  isUnlocked,
  width,
  height,
}: {
  id: string,
  activity: Activity,
  curriculum: Curriculum,
  isCompleted: boolean,
  isUnlocked: boolean,
  width: number,
  height: number,
}) {
  const router = useRouter();
  const variant = activityVariantFromId(id);
  const title = getVariantTitle(activity, variant) || activity.slug;

  const url = `${activityVariantPathname(
    variant.authorSlug,
    variant.activitySlug,
    variant.language,
    variant.version,
  )}?${new URLSearchParams({ [CURRICULUM_QUERY_PARAM]: curriculumId(curriculum.authorSlug, curriculum.slug) }).toString()}`;

  return (
    <Box
      sx={{
        width,
        height,
        opacity: isUnlocked ? 1 : 0.38,
        position: 'relative',
        cursor: isUnlocked ? 'auto' : 'not-allowed',
      }}
    >
      <CompletedBadge
        badgeContent={<Tooltip title="Activity Completed" arrow><CheckCircleOutlineOutlined /></Tooltip>}
        color="success"
        invisible={!isCompleted}
      >
        <LockedTooltip unlocked={isUnlocked}>
          <Card
            sx={{
              width: '100%', height: '100%', paddingBottom: 0,
            }}
          >
            <CardActionArea
              onClick={() => router.push(url, url)}
              disabled={!isUnlocked}
            >
              <CardMedia
                component="img"
                height={0.8 * height}
                color="red"
                image={activityAssetPathname(
                  variant.authorSlug,
                  variant.activitySlug,
                  activity.previewImage.filename,
                )}
                alt={title}
                sx={{ padding: 1, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
              />
              <CardContent sx={{ paddingY: { xs: 0, sm: 1 }, maxHeight: 0.2 * height }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                  {title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </LockedTooltip>
      </CompletedBadge>
    </Box>
  );
}
