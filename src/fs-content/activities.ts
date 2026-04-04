import { readFile, readdir } from 'fs/promises';
import path from 'path';
import {
  CELL_FILE,
  DRIVER_FILE,
  TOOLBOX_FILE,
} from '../execution/codeExecution';
import {
  Activity,
  BasicActivity,
  PythonFileInfo,
  RawActivity,
  platformConfigWithDefaults,
} from '../schemas/activitySchema';
import DataCache from './cache';
import { ACTIVITIES_DIR, DATA_DIR, notebookFileNames } from './notebooks';

const ACTIVITY_INFO_FILE = 'info.json';
const PYTHON_FILES_DIR = 'python-files';

const CELL_FILE_PATH_PATTERN = new RegExp(`${CELL_FILE}\\d+.py`);

async function readPythonFiles(files: PythonFileInfo[], authorDir: string) {
  // Ensure that destination paths are unique
  const destinationPaths = files.map((file) => file.destinationPath);
  if (new Set(destinationPaths).size !== destinationPaths.length) {
    throw new Error('Non-unique destination path in extraPythonFiles');
  }
  // Ensure that destination paths are not reserved
  const reservedFilenames = [DRIVER_FILE, TOOLBOX_FILE];
  const reservedPaths = reservedFilenames.map((filename) => `${filename}.py`);
  if (
    destinationPaths.some(
      (destinationPath) =>
        reservedPaths.includes(destinationPath) ||
        CELL_FILE_PATH_PATTERN.test(destinationPath),
    )
  ) {
    throw new Error(
      'Reserved path used as destination path in extraPythonFiles',
    );
  }
  // Read content
  return Promise.all(
    files.map(async (file) => ({
      name: file.destinationPath,
      content: await readFile(
        path.join(authorDir, PYTHON_FILES_DIR, file.sourcePath),
        'utf-8',
      ),
    })),
  );
}

async function readActivityFromFS(
  authorSlug: string,
  activitySlug: string,
): Promise<Activity> {
  const authorDir = path.join(DATA_DIR, authorSlug);
  const content = await readFile(
    path.join(authorDir, ACTIVITIES_DIR, activitySlug, ACTIVITY_INFO_FILE),
    'utf-8',
  );
  const rawActivity: RawActivity = JSON.parse(content);
  const notebooks = await notebookFileNames(authorSlug, activitySlug);
  const notebooksVariants = notebooks.flatMap((filename) => {
    const separator = '-';
    const components = filename.split(separator);
    const language = components.at(-2);
    const version = components.at(-1);
    const activity = components.slice(0, -2).join(separator);
    if (activity !== activitySlug || !language || !version) {
      // Show a warning but do not throw (this allows us to have extra notebooks in the directory)
      // eslint-disable-next-line no-console
      console.warn(
        `Ignoring notebook with filename ${filename} in activity ${authorSlug}/${activitySlug}`,
      );
      return [];
    }
    return {
      language,
      version,
    };
  });
  // An activity must have at least one notebook, however.
  if (notebooksVariants.length === 0) {
    throw new Error(
      `No notebooks found for activity ${authorSlug}/${activitySlug}`,
    );
  }
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
    languagesInfo: rawActivity.variants.map(
      ({ title, language, latestVersion }) => ({
        title,
        language,
        latestVersion,
      }),
    ),
    extraPythonFiles: await readPythonFiles(
      rawActivity.extraPythonFiles || [],
      authorDir,
    ),
    platformConfig: platformConfigWithDefaults(rawActivity.platformConfig),
    concepts: rawActivity.concepts || [],
  };
}

const activitiesCache = new DataCache<Activity>();

export async function readActivity(
  authorSlug: string,
  activitySlug: string,
): Promise<Activity> {
  return activitiesCache.get(`${authorSlug}/${activitySlug}`, () =>
    readActivityFromFS(authorSlug, activitySlug),
  );
}

export async function findVersions(
  authorSlug: string,
  activitySlug: string,
  language: string,
): Promise<string[]> {
  const prefix = `${activitySlug}-${language}-`;
  return (await notebookFileNames(authorSlug, activitySlug))
    .filter((filename) => filename.startsWith(prefix))
    .map((filename) => filename.replace(prefix, ''));
}

const activityListCache = new DataCache<Activity[]>();

async function listActivitiesFromFS(authorSlug: string): Promise<Activity[]> {
  const activitySlugs = (
    await readdir(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR), {
      withFileTypes: true,
    })
  )
    .filter((item) => item.isDirectory())
    .map((dir) => dir.name)
    .filter((name) => !/^\./.test(name)); // skip hidden directories starting with a '.', such as '.DS_Store'

  return Promise.all(
    activitySlugs.map((activitySlug) => readActivity(authorSlug, activitySlug)),
  );
}

export async function listActivities(authorSlug: string): Promise<Activity[]> {
  return activityListCache.get(authorSlug, () =>
    listActivitiesFromFS(authorSlug),
  );
}

export async function listVisibleActivities(
  authorSlug: string,
): Promise<Activity[]> {
  const activities = await listActivities(authorSlug);
  return activities.filter(
    (activity) =>
      activity.visibility === 'featured' || activity.visibility === 'visible',
  );
}

export function visibleActivities(
  activities: BasicActivity[],
): BasicActivity[] {
  return activities.filter((activity) => activity.visibility !== 'hidden');
}

export function basicActivity(activity: Activity): BasicActivity {
  return {
    slug: activity.slug,
    previewImage: activity.previewImage,
    visibility: activity.visibility,
    variants: activity.variants,
    languagesInfo: activity.languagesInfo,
    authorSlug: activity.authorSlug,
    concepts: activity.concepts,
  };
}

export function basicActivities(activities: Activity[]): BasicActivity[] {
  return activities.map(basicActivity);
}
