import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { BasicActivity } from './activitySchema';
import { Curriculum } from './curriculumSchema';

export interface Author {
  slug: string;
  activities: BasicActivity[];
  curricula: Curriculum[];
}

export interface AuthorProfile {
  slug: string;
  name: string;
  description: MDXRemoteSerializeResult;
}
