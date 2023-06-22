import { readFile, readdir } from 'fs/promises';
import path from 'path';
import {
  Activity,
  RawActivity,
} from '../schemas/activitySchema';
import { ACTIVITIES_DIR, DATA_DIR, notebookFileNames } from './notebooks';

const ACTIVITY_INFO_FILE = 'info.json';

export async function readActivity(authorSlug: string, activitySlug: string)
  : Promise<Activity> {
  const content = await readFile(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, ACTIVITY_INFO_FILE), 'utf-8');
  const rawActivity : RawActivity = JSON.parse(content);
  const notebooks = await notebookFileNames(authorSlug, activitySlug);
  const notebooksVariants = notebooks.map((filename) => {
    const components = filename.split('-');
    const language = components.at(-2);
    const version = components.at(-1);
    if (!language || !version) {
      throw new Error(`Invalid notebook filename ${filename} (cannot detect language or version)`);
    }
    return {
      language,
      version,
    };
  });
  return {
    authorSlug,
    slug: activitySlug,
    previewImage: rawActivity.previewImage,
    visibility: rawActivity.visibility,
    uses: rawActivity.uses || [],
    assets: rawActivity.assets || [],
    derivedFrom: rawActivity.derivedFrom || [],
    variants: notebooksVariants.map((variant) => ({
      authorSlug,
      activitySlug,
      language: variant.language,
      version: variant.version,
    })),
    languagesInfo: rawActivity.variants,
  };
}

export async function findVersions(authorSlug: string, activitySlug: string, language: string)
  : Promise<string[]> {
  const prefix = `${activitySlug}-${language}-`;
  return (await notebookFileNames(authorSlug, activitySlug))
    .filter((filename) => filename.startsWith(prefix))
    .map((filename) => filename.replace(prefix, ''));
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
