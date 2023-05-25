import { readFile, readdir } from 'fs/promises';
import path from 'path';
import {
  Activity, ActivityUse, ActivityVariant, LanguageWithLatestVersion, NotebookVariant,
} from '../schemas/activitySchema';
import { ACTIVITIES_DIR, DATA_DIR, notebookFileNames } from './notebooks';

const ACTIVITY_INFO_FILE = 'info.json';

export async function readActivity(authorSlug: string, activitySlug: string)
  : Promise<Activity> {
  const content = await readFile(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, ACTIVITY_INFO_FILE), 'utf-8');
  return {
    slug: activitySlug,
    ...JSON.parse(content),
  };
}

export async function findVersions(authorSlug: string, activitySlug: string, language: string)
  : Promise<string[]> {
  const prefix = `${activitySlug}-${language}-`;
  return (await notebookFileNames(authorSlug, activitySlug))
    .filter((filename) => filename.startsWith(prefix))
    .map((filename) => filename.replace(prefix, ''));
}

export async function variantInfo(authorSlug: string, activitySlug: string, language: string)
  : Promise<NotebookVariant> {
  const activity = await readActivity(authorSlug, activitySlug);
  return activity.variants.find((v) => v.language === language) as NotebookVariant;
}

export function latestVariant(
  authorSlug: string,
  activitySlug: string,
  variant: NotebookVariant,
) : ActivityVariant {
  return {
    authorSlug,
    activitySlug,
    language: variant.language,
    version: variant.latestVersion,
  };
}

export async function findLanguages(authorSlug: string, activitySlug: string)
  : Promise<LanguageWithLatestVersion[]> {
  const notebooks = await notebookFileNames(authorSlug, activitySlug);
  const languages = notebooks.map((filename) => filename.split('-').at(-2)) as string[];
  const uniqueLanguages = Array.from(new Set(languages));
  return Promise.all(uniqueLanguages.map(async (language) => ({
    language,
    latestVersion: (await variantInfo(authorSlug, activitySlug, language)).latestVersion,
  })));
}

export async function listActivities(authorSlug: string) : Promise<Activity[]> {
  const activitySlugs = (await readdir(
    path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR),
    { withFileTypes: true },
  ))
    .filter((item) => item.isDirectory())
    .map((dir) => dir.name)
    .filter((name) => !/^\./.test(name)); // skip hidden directories starting with a '.', such as '.DS_Store'

  return Promise.all(activitySlugs.map(
    (activitySlug) => readActivity(authorSlug, activitySlug),
  ));
}

export async function listVisibleActivities(authorSlug: string) : Promise<Activity[]> {
  const activities = await listActivities(authorSlug);
  return activities.filter((activity) => activity.visibility === 'featured' || activity.visibility === 'visible');
}

export async function getActivityUses(
  authorSlug: string,
  activitySlug: string,
) : Promise<ActivityUse[]> {
  const mod = await readActivity(authorSlug, activitySlug);
  return mod.uses.filter((use) => use?.hidden !== true);
}
