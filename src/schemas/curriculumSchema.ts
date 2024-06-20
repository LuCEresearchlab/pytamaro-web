import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { ActivityVariant, BasicActivity } from './activitySchema';

export interface RawCurriculumActivity {
  id: string,
  fallbackIds?: string[],
  prerequisites: string[],
  learningObjectives: string[],
}

export interface CurriculumActivity extends RawCurriculumActivity {
  variant: ActivityVariant,
  activity: BasicActivity,
}

interface BaseCurriculumStep {
  isOptional?: boolean,
}

export interface RawCurriculumStep extends BaseCurriculumStep {
  activities: RawCurriculumActivity[],
}

export interface CurriculumStep extends BaseCurriculumStep {
  activities: CurriculumActivity[],
}

interface BaseCurriculumUnit {
  title?: string,
}

export interface RawCurriculumUnit extends BaseCurriculumUnit {
  steps: RawCurriculumStep[],
}

export interface CurriculumUnit extends BaseCurriculumUnit {
  steps: CurriculumStep[],
}

export type CurriculumCategory = 'programming' | 'graphics';

interface BaseCurriculumCompetency {
  id: string,
  name: string,
  description: string,
  icon: string,
  category: CurriculumCategory,
}

export interface RawCurriculumCompetency extends BaseCurriculumCompetency {
  longDescription: string,
}

export interface CurriculumCompetency extends BaseCurriculumCompetency {
  longDescription: MDXRemoteSerializeResult,
}

export type CurriculumVisibility = 'featured' | 'visible' | 'draft' | 'hidden';

interface BaseCurriculum {
  title: string,
  visibility: CurriculumVisibility,
}

export interface RawCurriculum extends BaseCurriculum {
  description: string,
  competencies: RawCurriculumCompetency[],
  units: RawCurriculumUnit[],
  derivedFrom?: string[],
  activitiesPreviewImage?: string[],
  orderingKey?: string,
  hourOfCode?: boolean,
  finishLabel?: string,
  finishURL?: string,
  allActivitiesUnlocked?: boolean,
}

export interface Curriculum extends BaseCurriculum {
  authorSlug: string,
  slug: string,
  description: MDXRemoteSerializeResult,
  competencies: CurriculumCompetency[],
  units: CurriculumUnit[],
  derivedFrom: string[],
  activitiesPreviewImage: string[],
  orderingKey: string,
  hourOfCode: boolean,
  finishLabel: string,
  finishURL: string,
  allActivitiesUnlocked: boolean,
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
