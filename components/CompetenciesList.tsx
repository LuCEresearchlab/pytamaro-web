import { Card, Stack } from '@mui/material';
import { sortBy } from 'lodash';
import { Curriculum } from '../src/schemas/curriculumSchema';
import { competencyAnchor } from './ActivitiesCompetenciesMatrix';
import CompetencyCardContent from './CompetencyCardContent';

export default function CompetenciesList({
  curriculum,
}: {
  curriculum: Curriculum;
}) {
  return (
    <Stack direction='column' spacing={2}>
      {sortBy(curriculum.competencies, (competency) =>
        competency.category === 'programming' ? 0 : 1,
      ).map((competency) => (
        <Card
          key={competency.id}
          id={competencyAnchor(competency)}
          className='anchor'
          sx={{ overflow: 'visible' }}
        >
          <CompetencyCardContent
            curriculum={curriculum}
            competency={competency}
            fullWidth
          />
        </Card>
      ))}
    </Stack>
  );
}
