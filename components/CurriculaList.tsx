import { Stack } from '@mui/material';
import { Curriculum, curriculumToId } from '../src/schemas/curriculumSchema';
import CurriculumCard from './CurriculumCard';

export default function CurriculaList({ curricula }:
{ curricula: Curriculum[] }) {
  return (
    <Stack spacing={2}>
      {curricula.map((curriculum: Curriculum) => (
        <CurriculumCard key={curriculumToId(curriculum)} curriculum={curriculum} />
      ))}
    </Stack>
  );
}
