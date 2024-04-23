import { readFile, readdir } from 'fs/promises';
import path from 'path';
import {
  CURRENT_CELL_FILE, DRIVER_FILE, PREVIOUS_CELLS_FILE, TOOLBOX_FILE,
} from '../codeExecution';
import {
  Activity,
  PythonFileInfo,
  RawActivity,
  platformConfigWithDefaults,
} from '../schemas/activitySchema';
import { ACTIVITIES_DIR, DATA_DIR, notebookFileNames } from './notebooks';

const ACTIVITY_INFO_FILE = 'info.json';
const PYTHON_FILES_DIR = 'python-files';

async function readPythonFiles(files: PythonFileInfo[], authorDir: string) {
  // Ensure that destination paths are unique
  const destinationPaths = files.map((file) => file.destinationPath);
  if (new Set(destinationPaths).size !== destinationPaths.length) {
    throw new Error('Non-unique destination path in extraPythonFiles');
  }
  // Ensure that destination paths are not reserved
  const reservedFilenames = [DRIVER_FILE, PREVIOUS_CELLS_FILE, CURRENT_CELL_FILE, TOOLBOX_FILE];
  const reservedPaths = reservedFilenames.map((filename) => `${filename}.py`);
  if (reservedPaths.some((reservedPath) => destinationPaths.includes(reservedPath))) {
    throw new Error('Reserved path used as destination path in extraPythonFiles');
  }
  // Read content
  return Promise.all(files.map(async (file) => ({
    name: file.destinationPath,
    content: await readFile(path.join(authorDir, PYTHON_FILES_DIR, file.sourcePath), 'utf-8'),
  })));
}

export async function readActivity(authorSlug: string, activitySlug: string)
  : Promise<Activity> {
  const authorDir = path.join(DATA_DIR, authorSlug);
  const content = await readFile(path.join(authorDir, ACTIVITIES_DIR, activitySlug, ACTIVITY_INFO_FILE), 'utf-8');
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
    extraPythonFiles: await readPythonFiles(rawActivity.extraPythonFiles || [], authorDir),
    platformConfig: platformConfigWithDefaults(rawActivity.platformConfig),
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

export function visibleActivities(activities: Activity[]) : Activity[] {
  return activities.filter((activity) => activity.visibility !== 'hidden');
}
