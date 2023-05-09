export interface CurriculumActivity {
  slug: string,
  prerequisites: string[],
  learningObjectives: string[],
  activityRequirements: string[][],
}

export interface Curriculum {
  slug: string,
  title: string,
  description: string,
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  competencies: string[],
  activities: CurriculumActivity[]
}
