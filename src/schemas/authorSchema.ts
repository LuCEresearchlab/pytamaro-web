import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Activity } from './activitySchema';
import { Curriculum } from './curriculumSchema';

export interface Author {
  slug: string;
  activities: Activity[];
  curricula: Curriculum[];
}

export interface AuthorProfile {
  slug: string;
  name: string;
  description: MDXRemoteSerializeResult;
}
