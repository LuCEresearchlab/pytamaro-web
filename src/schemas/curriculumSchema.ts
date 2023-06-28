import { Activity, ActivityVariant } from './activitySchema';

export interface RawCurriculumActivity {
  id: string,
  prerequisites: string[],
  learningObjectives: string[],
}

export interface CurriculumActivity extends RawCurriculumActivity {
  variant: ActivityVariant,
  activity: Activity,
}

export interface CurriculumStep {
  activities: CurriculumActivity[],
  isOptional?: boolean,
}

export interface CurriculumUnit {
  title?: string,
  steps: CurriculumStep[],
}

export type CurriculumCategory = 'programming' | 'graphics';

export interface CurriculumCompetency {
  id: string,
  name: string,
  description: string,
  longDescription: string,
  icon: string,
  category: CurriculumCategory,
}

export interface Curriculum {
  authorSlug: string,
  slug: string,
  title: string,
  description: string,
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  competencies: CurriculumCompetency[],
  units: CurriculumUnit[],
  derivedFrom: string[],
}

export function curriculumId(authorSlug: string, slug: string) {
  return `${authorSlug}/${slug}`;
}

export function curriculumToId(curriculum: Curriculum) {
  return curriculumId(curriculum.authorSlug, curriculum.slug);
}

export function curriculumFromId(id: string) {
  const [authorSlug, curriculumSlug] = id.split('/');
  return { authorSlug, curriculumSlug };
}
