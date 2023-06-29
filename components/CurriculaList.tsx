import { Stack } from '@mui/material';
import { ActivityVariantMetadata } from '../src/localStorage/schema';
import { Curriculum, curriculumToId } from '../src/schemas/curriculumSchema';
import CurriculumCard from './CurriculumCard';

export default function CurriculaList({ curricula, userActivities = undefined }:
{ curricula: Curriculum[], userActivities?: ActivityVariantMetadata[] }) {
  return (
    <Stack spacing={2}>
      {curricula.map((curriculum: Curriculum) => (
        <CurriculumCard
          key={curriculumToId(curriculum)}
          curriculum={curriculum}
          userActivities={userActivities}
        />
      ))}
    </Stack>
  );
}
