import { Activity, NotebookVariant } from './activitySchema';

export interface RawCurriculumActivity {
  id: string,
  activityRequirements: string[][],
  prerequisites: string[],
  learningObjectives: string[],
}

export interface CurriculumActivity extends RawCurriculumActivity {
  activity: Activity,
  variant: NotebookVariant,
}

export interface CurriculumUnit {
  title: string,
  activities: CurriculumActivity[],
}

export interface CurriculumCompetency {
  id: string,
  name: string,
  description: string,
  longDescription: string,
  icon: string,
}

export interface Curriculum {
  slug: string,
  title: string,
  description: string,
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  competencies: CurriculumCompetency[],
  units: CurriculumUnit[],
}
