import path from 'path';
import { readdir, readFile } from 'fs/promises';
import { DATA_DIR } from './notebooks';
import {
  Curriculum,
  CurriculumStep,
  CurriculumUnit,
  RawCurriculumActivity,
} from '../schemas/curriculumSchema';
import { readActivity } from './activities';
import { activityVariantFromId } from '../schemas/activitySchema';

export const CURRICULA_DIR = 'curricula';
const CURRICULUM_EXT = '.json';

async function getCurriculumInfo(authorSlug: string, curriculumSlug: string) : Promise<Curriculum> {
  const content = JSON.parse(
    await readFile(path.join(DATA_DIR, authorSlug, CURRICULA_DIR, `${curriculumSlug}.json`), 'utf-8'),
  );
  content.units = await Promise.all(
    content.units.map(
      async (unit: CurriculumUnit) => ({
        ...unit,
        steps: await Promise.all(
          unit.steps.map(
            async (step: CurriculumStep) => ({
              ...step,
              activities: await Promise.all(step.activities.map(
                async (curriculumAct: RawCurriculumActivity) => {
                  const variant = activityVariantFromId(curriculumAct.id);
                  return {
                    ...curriculumAct,
                    variant,
                    activity: await readActivity(variant.authorSlug, variant.activitySlug),
                  };
                },
              )),
            }),
          ),
        ),
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
