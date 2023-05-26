import { Stack } from '@mui/material';
import { AuthorProfile } from '../src/schemas/authorSchema';
import { Curriculum } from '../src/schemas/curriculumSchema';
import CurriculumCard from './CurriculumCard';

export default function CurriculaList({ authorProfile, curricula }:
{ authorProfile: AuthorProfile, curricula: Curriculum[] }) {
  return (
    <Stack spacing={2}>
      {curricula.map((curriculum: Curriculum) => (
        <CurriculumCard key={`${authorProfile.slug}/${curriculum.slug}`} authorSlug={authorProfile.slug} curriculum={curriculum} />
      ))}
    </Stack>
  );
}
