import { Stack } from '@mui/material';
import { sortBy } from 'lodash';
import { ActivityVariantMetadata } from '../src/localStorage/schema';
import { Curriculum, curriculumToId } from '../src/schemas/curriculumSchema';
import CurriculumCard from './CurriculumCard';

export default function CurriculaList({
  curricula,
  userActivities = undefined,
  alwaysClickable = false,
  compact = false,
}: {
  curricula: Curriculum[];
  userActivities?: ActivityVariantMetadata[];
  alwaysClickable?: boolean;
  compact?: boolean;
}) {
  return (
    <Stack spacing={2}>
      {sortBy(curricula, (c) => `${c.authorSlug}/${c.orderingKey}`).map(
        (curriculum: Curriculum) => (
          <CurriculumCard
            key={curriculumToId(curriculum)}
            curriculum={curriculum}
            userActivities={userActivities}
            alwaysClickable={alwaysClickable}
            compact={compact}
          />
        ),
      )}
    </Stack>
  );
}
