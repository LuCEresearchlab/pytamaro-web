import Route from '@mui/icons-material/Route';
import { Box, Link, Stack, Typography } from '@mui/material';
import { anchorName, findInCurriculum } from '../../src/curricula';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  ActivityVariant,
  activityVariantId,
} from '../../src/schemas/activitySchema';
import { Curriculum } from '../../src/schemas/curriculumSchema';
import { curriculumWithAnchor } from '../../src/urlUtils';
import SidebarTitle from './SidebarTitle';

export default function CurriculumUnitSidebar({
  curriculum,
  activityVariant,
}: {
  curriculum: Curriculum;
  activityVariant: ActivityVariant;
}) {
  const { t } = useLocalTranslation(['curriculum']);
  const unit = curriculum.units.find((u) => {
    const activities = u.steps.flatMap((step) => step.activities);
    return activities.find(
      (activity) =>
        activityVariantId(activityVariant) ===
        activityVariantId(activity.variant),
    );
  });
  const gap = '.7ch';
  const { unitIdx, stepIdx, activityIdx } = findInCurriculum(
    curriculum,
    activityVariant,
  );
  const anchor = anchorName(unitIdx, stepIdx, activityIdx);
  return unit ? (
    <Box>
      <SidebarTitle>{t('myCurriculum')}</SidebarTitle>
      <Stack spacing={0.5} useFlexGap>
        <Link
          variant='body2'
          underline='none'
          href={curriculumWithAnchor(
            curriculum.authorSlug,
            curriculum.slug,
            anchor,
          )}
          sx={{
            display: 'flex',
          }}
        >
          <Route fontSize='small' />
          <span style={{ marginLeft: gap }}>{curriculum.title}</span>
        </Link>
        <Typography
          variant='body2'
          sx={{
            marginLeft: `calc(20px + ${gap})`,
          }}
        >
          {unit.title}
        </Typography>
      </Stack>
    </Box>
  ) : null;
}
