import { Activity, NotebookVariant } from './activitySchema';

export interface RawCurriculumActivity {
  id: string,
  activityRequirements: string[][],
  prerequisites: string[],
  learningObjectives: string[],
}

export interface CurriculumActivity {
  id: string,
  activity: Activity,
  variant: NotebookVariant,
  activityRequirements: string[][],
  prerequisites: string[],
  learningObjectives: string[],
}

export interface CurriculumUnit {
  title: string,
  activities: CurriculumActivity[],
}

export interface Curriculum {
  slug: string,
  title: string,
  description: string,
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  competencies: string[],
  units: CurriculumUnit[],
}
