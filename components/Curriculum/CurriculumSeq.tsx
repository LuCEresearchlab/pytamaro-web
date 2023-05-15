import {
  Stack,
} from '@mui/material';
import { CurriculumUnit } from '../../src/schemas/curriculumSchema';
import CurriculumSeqUnit from './CurriculumSeqUnit';

export default function CurriculumSeq({ units, completedActivityVariantIds }
: { units : CurriculumUnit[], completedActivityVariantIds : string[] }) {
  return (
    <Stack spacing={2}>
      {units.map((unit) => (
        <CurriculumSeqUnit
          title={units.length === 1 ? undefined : unit.title}
          activities={unit.activities}
          completedActivityVariantIds={completedActivityVariantIds}
          key={unit.title}
        />
      ))}
    </Stack>
  );
}
