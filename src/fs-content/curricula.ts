import path from 'path';
import { readdir, readFile } from 'fs/promises';
import { DATA_DIR } from './notebooks';
import { Curriculum, CurriculumUnit, RawCurriculumActivity } from '../schemas/curriculumSchema';
import { variantInfo, readActivity } from './activities';

export const CURRICULA_DIR = 'curricula';
const CURRICULUM_EXT = '.json';

async function getCurriculumInfo(authorSlug: string, curriculumSlug: string) {
  const content = JSON.parse(
    await readFile(path.join(DATA_DIR, authorSlug, CURRICULA_DIR, `${curriculumSlug}.json`), 'utf-8'),
  );
  content.units = await Promise.all(
    content.units.map(
      async (unit: CurriculumUnit) => ({
        ...unit,
        activities: await Promise.all(unit.activities.map(
          async (curriculumAct: RawCurriculumActivity) => {
            const [thisAuthorSlug, activitySlug, language] = curriculumAct.id.split('/');
            return {
              ...curriculumAct,
              activity: await readActivity(thisAuthorSlug, activitySlug),
              variant: await variantInfo(thisAuthorSlug, activitySlug, language),
            };
          },
        )),
      }),
    ),
  );
  return {
    slug: curriculumSlug,
    ...content,
  };
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
