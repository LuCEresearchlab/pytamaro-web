import path from 'path';
import { readdir, readFile } from 'fs/promises';

export const DATA_DIR = 'data';
export const ACTIVITIES_DIR = 'activities';
const ACTIVITY_INFO_FILE = 'info.json';

async function getActivityInfo(authorSlug: string, activitySlug: string) {
  const content = await readFile(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, ACTIVITY_INFO_FILE), 'utf-8');
  return {
    slug: activitySlug,
    ...JSON.parse(content),
  };
}

export interface ActivityInfo {
  slug: string,
  completed: boolean,
}

export interface NotebookVariant {
  title: string,
  language: string,
  description: string,
  latestVersion: string,
}

export interface NotebookUse {
  institution: string,
  course: string,
  instructors: string[],
  assignment: string,
  url: string,
}

export interface Activity {
  slug: string,
  previewImage: { filename: string, backgroundColor: string },
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  variants: NotebookVariant[],
  uses: NotebookUse[],
}

export interface LanguageWithLatestVersion {
  language: string,
  latestVersion: string,
}

async function notebookFileNames(authorSlug: string, activitySlug: string) {
  const suffix = '.ipynb';
  const notebooks = (await readdir(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug)))
    .filter((file) => file.endsWith(suffix));
  return notebooks.map((filename) => filename.replace(suffix, ''));
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
  const activity = await getActivityInfo(authorSlug, activitySlug);
  return activity.variants.find((v : NotebookVariant) => v.language === language);
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
    .map((dir) => dir.name);

  return Promise.all(activitySlugs.map(
    (activitySlug) => getActivityInfo(authorSlug, activitySlug),
  ));
}

export async function getActivity(authorSlug: string, activitySlug: string) : Promise<Activity> {
  return getActivityInfo(authorSlug, activitySlug);
}

export async function getNotebookUses(
  authorSlug: string,
  activitySlug: string,
) : Promise<NotebookUse[]> {
  const mod = await getActivityInfo(authorSlug, activitySlug);
  return mod.uses.filter((use: NotebookUse) => use.course !== 'internal');
}
