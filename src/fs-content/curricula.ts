import { readdir, readFile } from 'fs/promises';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import { activityVariantFromId } from '../schemas/activitySchema';
import {
  Curriculum,
  CurriculumCompetency,
  CurriculumUnit,
  RawCurriculum,
  RawCurriculumCompetency,
  RawCurriculumUnit,
} from '../schemas/curriculumSchema';
import { readActivity } from './activities';
import { DATA_DIR } from './notebooks';

export const CURRICULA_DIR = 'curricula';
const CURRICULUM_EXT = '.json';

async function processCompetencies(competencies: RawCurriculumCompetency[]) :
Promise<CurriculumCompetency[]> {
  return Promise.all(competencies.map(async (competency) => ({
    ...competency,
    longDescription: await serialize(competency.longDescription),
  })));
}

async function processUnits(units: RawCurriculumUnit[]) : Promise<CurriculumUnit[]> {
  return Promise.all(units.map(async (unit) => ({
    ...unit,
    steps: await Promise.all(unit.steps.map(async (step) => ({
      ...step,
      activities: await Promise.all(step.activities.map(
        async (rawCurriculumActivity) => {
          const variant = activityVariantFromId(rawCurriculumActivity.id);
          return {
            ...rawCurriculumActivity,
            variant,
            activity: await readActivity(variant.authorSlug, variant.activitySlug),
          };
        },
      )),
    }))),
  })));
}

async function readCurriculum(authorSlug: string, curriculumSlug: string) : Promise<Curriculum> {
  const content : RawCurriculum = JSON.parse(
    await readFile(path.join(DATA_DIR, authorSlug, CURRICULA_DIR, `${curriculumSlug}.json`), 'utf-8'),
  );
  return {
    authorSlug,
    slug: curriculumSlug,
    title: content.title,
    visibility: content.visibility,
    derivedFrom: content.derivedFrom || [],
    activitiesPreviewImage: content.activitiesPreviewImage || [],
    orderingKey: content.orderingKey || curriculumSlug,
    description: await serialize(content.description),
    competencies: await processCompetencies(content.competencies),
    units: await processUnits(content.units),
  };
}

export async function listCurricula(authorSlug: string) : Promise<Curriculum[]> {
  const curriculumSlugs = (await readdir(
    path.join(DATA_DIR, authorSlug, CURRICULA_DIR),
    { withFileTypes: true },
  ))
    .filter((item) => item.isFile())
    .filter((item) => !/^\./.test(item.name)) // skip hidden files
    .map((file) => file.name.replace(CURRICULUM_EXT, ''));

  return Promise.all(curriculumSlugs.map(
    (curriculumSlug) => readCurriculum(authorSlug, curriculumSlug),
  ));
}

export async function getCurriculum(
  authorSlug: string,
  curriculumSlug: string,
) : Promise<Curriculum> {
  return readCurriculum(authorSlug, curriculumSlug);
}
