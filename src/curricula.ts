import { Curriculum } from './schemas/curriculumSchema';

export default function visibleCurricula(curricula: Curriculum[]) : Curriculum[] {
  return curricula.filter((curriculum) => curriculum.visibility !== 'hidden');
}
