import path from 'path';
import { readdir, stat } from 'fs/promises';
import { Activity, listActivities, DATA_DIR } from './Activities';

async function getAuthorInfo(authorSlug: string) {
  return {
    slug: authorSlug,
    activities: await listActivities(authorSlug),
  };
}

export interface Author {
  slug: string,
  activities: Activity[],
}

export async function listAuthors() : Promise<Author[]> {
  const authorSlugs = (await readdir(DATA_DIR, { withFileTypes: true }))
    .filter(async (entry) => (await stat(path.join(DATA_DIR, entry.name))).isDirectory())
    .map((dir) => dir.name);
  return Promise.all(authorSlugs.map(getAuthorInfo));
}
