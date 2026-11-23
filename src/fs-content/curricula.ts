/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { existsSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import { activityVariantFromId } from '../schemas/activitySchema';
import {
  Curriculum,
  CurriculumCompetency,
  curriculumId,
  CurriculumUnit,
  RawCurriculum,
  RawCurriculumCompetency,
  RawCurriculumUnit,
} from '../schemas/curriculumSchema';
import { curriculumFinishPathname } from '../urlUtils';
import { basicActivity, readActivity } from './activities';
import DataCache from './cache';
import { DATA_DIR } from './notebooks';

export const CURRICULA_DIR = 'curricula';
const CURRICULUM_EXT = '.json';

async function processCompetencies(
  competencies: RawCurriculumCompetency[],
): Promise<CurriculumCompetency[]> {
  return Promise.all(
    competencies.map(async (competency) => ({
      ...competency,
      longDescription: await serialize(competency.longDescription),
    })),
  );
}

async function processUnits(
  units: RawCurriculumUnit[],
): Promise<CurriculumUnit[]> {
  return Promise.all(
    units.map(async (unit) => ({
      ...unit,
      steps: await Promise.all(
        unit.steps.map(async (step) => ({
          ...step,
          activities: await Promise.all(
            step.activities.map(async (rawCurriculumActivity) => {
              const variant = activityVariantFromId(rawCurriculumActivity.id);
              return {
                ...rawCurriculumActivity,
                variant,
                activity: basicActivity(
                  await readActivity(variant.authorSlug, variant.activitySlug),
                ),
              };
            }),
          ),
        })),
      ),
    })),
  );
}

async function readCurriculumFromFS(
  authorSlug: string,
  curriculumSlug: string,
): Promise<Curriculum> {
  const content: RawCurriculum = JSON.parse(
    await readFile(
      path.join(DATA_DIR, authorSlug, CURRICULA_DIR, `${curriculumSlug}.json`),
      'utf-8',
    ),
  );
  return {
    authorSlug,
    slug: curriculumSlug,
    title: content.title,
    visibility: content.visibility,
    derivedFrom: content.derivedFrom || [],
    activitiesPreviewImage: content.activitiesPreviewImage || [],
    orderingKey: content.orderingKey || curriculumSlug,
    hourOfCode: content.hourOfCode || false,
    finishLabel: content.finishLabel || 'Finish',
    finishURL:
      content.finishURL || curriculumFinishPathname(authorSlug, curriculumSlug),
    allActivitiesUnlocked: content.allActivitiesUnlocked || false,
    description: await serialize(content.description),
    competencies: await processCompetencies(content.competencies),
    units: await processUnits(content.units),
  };
}

const curriculaCache = new DataCache<Curriculum>();

export async function readCurriculum(
  authorSlug: string,
  curriculumSlug: string,
): Promise<Curriculum> {
  return curriculaCache.get(curriculumId(authorSlug, curriculumSlug), () =>
    readCurriculumFromFS(authorSlug, curriculumSlug),
  );
}

const curriculaListCache = new DataCache<Curriculum[]>();

async function listCurriculaFromFS(authorSlug: string): Promise<Curriculum[]> {
  const curriculaDir = path.join(DATA_DIR, authorSlug, CURRICULA_DIR);
  if (!existsSync(curriculaDir)) {
    return [];
  }
  const curriculumSlugs = (await readdir(curriculaDir, { withFileTypes: true }))
    .filter((item) => item.isFile())
    .filter((item) => !/^\./.test(item.name)) // skip hidden files
    .map((file) => file.name.replace(CURRICULUM_EXT, ''));

  return Promise.all(
    curriculumSlugs.map((curriculumSlug) =>
      readCurriculum(authorSlug, curriculumSlug),
    ),
  );
}

export async function listCurricula(authorSlug: string): Promise<Curriculum[]> {
  return curriculaListCache.get(authorSlug, () =>
    listCurriculaFromFS(authorSlug),
  );
}

export async function getCurriculum(
  authorSlug: string,
  curriculumSlug: string,
): Promise<Curriculum> {
  return readCurriculum(authorSlug, curriculumSlug);
}
