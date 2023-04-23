import path from 'path';
import { readdir, readFile } from 'fs/promises';
import {
  Activity, DATA_DIR, getActivity, NotebookVariant, variantInfo,
} from './Activities';

export const CURRICULA_DIR = 'curricula';
const CURRICULUM_EXT = '.json';

async function getCurriculumInfo(authorSlug: string, curriculumSlug: string) {
  const content = JSON.parse(
    await readFile(path.join(DATA_DIR, authorSlug, CURRICULA_DIR, `${curriculumSlug}.json`), 'utf-8'),
  );
  content.activities = await Promise.all(content.activities.map(async (curriculumAct: any) => {
    const { authorSlug: thisAuthorSlug, activitySlug, language } = curriculumAct.id;
    return {
      activity: await getActivity(thisAuthorSlug, activitySlug),
      variant: await variantInfo(thisAuthorSlug, activitySlug, language),
      ...curriculumAct,
    };
  }));
  return {
    slug: curriculumSlug,
    ...content,
  };
}

export interface CurriculumActivityId {
  authorSlug: string,
  activitySlug: string,
  language: string,
}

export interface CurriculumActivity {
  id: CurriculumActivityId,
  activity: Activity,
  variant: NotebookVariant,
  prerequisites: string[],
  learningObjectives: string[],
  activityRequirements: CurriculumActivityId[][],
}

export interface Curriculum {
  slug: string,
  title: string,
  description: string,
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  competencies: string[],
  activities: CurriculumActivity[],
}

export async function listCurricula(authorSlug: string) : Promise<Curriculum[]> {
  const curriculumSlugs = (await readdir(
    path.join(DATA_DIR, authorSlug, CURRICULA_DIR),
    { withFileTypes: true },
  ))
    .filter((item) => item.isFile())
    .map((file) => file.name.replace(CURRICULUM_EXT, ''));

  return Promise.all(curriculumSlugs.map(
    (curriculumSlug) => getCurriculumInfo(authorSlug, curriculumSlug),
  ));
}

export async function getCurriculum(
  authorSlug: string,
  curriculumSlug: string,
) : Promise<Curriculum> {
  return getCurriculumInfo(authorSlug, curriculumSlug);
}
