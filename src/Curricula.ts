import path from 'path';
import { readdir, readFile } from 'fs/promises';
import {
  Activity, DATA_DIR, getActivity, NotebookVariant, variantInfo,
} from './Activities';

export const CURRICULA_DIR = 'curricula';
const CURRICULUM_EXT = '.json';

interface RawCurriculumActivity {
  id: string,
  activityRequirements: string[][],
  prerequisites: string[],
  learningObjectives: string[],
}

async function getCurriculumInfo(authorSlug: string, curriculumSlug: string) {
  const content = JSON.parse(
    await readFile(path.join(DATA_DIR, authorSlug, CURRICULA_DIR, `${curriculumSlug}.json`), 'utf-8'),
  );
  content.activities = await Promise.all(content.activities.map(
    async (curriculumAct: RawCurriculumActivity) => {
      const [thisAuthorSlug, activitySlug, language] = curriculumAct.id.split('/');
      return {
        activity: await getActivity(thisAuthorSlug, activitySlug),
        variant: await variantInfo(thisAuthorSlug, activitySlug, language),
        ...curriculumAct,
      };
    },
  ));
  return {
    slug: curriculumSlug,
    ...content,
  };
}

export interface CurriculumActivity {
  id: string,
  activity: Activity,
  variant: NotebookVariant,
  activityRequirements: string[][],
  prerequisites: string[],
  learningObjectives: string[],
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
