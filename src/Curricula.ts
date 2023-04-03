import path from 'path';
import { readdir, readFile } from 'fs/promises';
import { DATA_DIR } from './Activities';

export const CURRICULA_DIR = 'curricula';
const CURRICULUM_EXT = '.json';

async function getCurriculumInfo(authorSlug: string, curriculumSlug: string) {
  const content = await readFile(path.join(DATA_DIR, authorSlug, CURRICULA_DIR, `${curriculumSlug}.json`), 'utf-8');
  return {
    slug: curriculumSlug,
    ...JSON.parse(content),
  };
}

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
