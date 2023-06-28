import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { competencyColor } from '../../src/curriculumCompetencies';
import { activityVariantFromId, getVariantTitle } from '../../src/schemas/activitySchema';
import { Curriculum, CurriculumActivity, curriculumId } from '../../src/schemas/curriculumSchema';
import theme from '../../src/theme';
import { CURRICULUM_QUERY_PARAM, activityAssetPathname, activityVariantPathname } from '../../src/urlUtils';
import ActivityStatusBadge, { ActivityStatus } from '../ActivityStatusBadge';
import GenericMuiIcon from '../GenericMuiIcon';

export default function ActivityCard({
  id,
  curriculumActivity,
  curriculum,
  status,
  isUnlocked,
  width,
  height,
}: {
  id: string,
  curriculumActivity: CurriculumActivity,
  curriculum: Curriculum,
  status: ActivityStatus,
  isUnlocked: boolean,
  width: number,
  height: number,
}) {
  const router = useRouter();
  const variant = activityVariantFromId(id);
  const { activity } = curriculumActivity;
  const title = getVariantTitle(activity, variant) || activity.slug;

  const url = `${activityVariantPathname(variant)}?${new URLSearchParams({ [CURRICULUM_QUERY_PARAM]: curriculumId(curriculum.authorSlug, curriculum.slug) }).toString()}`;

  const avatarFontSize = theme.typography.pxToRem(16);

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
      <ActivityStatusBadge status={status} locked={!isUnlocked}>
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
            <CardContent sx={{
              paddingY: { xs: 0, sm: 1 },
              maxHeight: 0.2 * height,
              display: 'flex',
              alignItems: 'center',
              paddingRight: 0.5,
            }}
            >
              <Typography gutterBottom variant="h5" component="div" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                {title}
              </Typography>
              <AvatarGroup
                max={4}
                sx={{
                  marginLeft: 'auto',
                  '& .MuiAvatarGroup-avatar': {
                    width: 24,
                    height: 24,
                    fontSize: avatarFontSize,
                  },
                }}
              >
                {curriculumActivity.learningObjectives.map((objective) => {
                  const competency = curriculum.competencies.find((c) => c.id === objective);
                  return competency ? (
                    <Avatar sx={{
                      bgcolor: theme.palette[competencyColor(competency)].main,
                    }}
                    >
                      <GenericMuiIcon
                        iconName={competency.icon}
                        fontSize={avatarFontSize}
                      />
                    </Avatar>
                  ) : null;
                })}
              </AvatarGroup>
            </CardContent>
          </CardActionArea>
        </Card>
      </ActivityStatusBadge>
    </Box>
  );
}
