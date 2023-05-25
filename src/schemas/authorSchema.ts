import { Activity } from './activitySchema';
import { Curriculum } from './curriculumSchema';

export interface Author {
  slug: string;
  activities: Activity[];
  curricula: Curriculum[];
}

export interface AuthorActivities {
  authorSlug: string;
  activities: Activity[];
}

export interface AuthorProfile {
  slug: string;
  name: string;
}
