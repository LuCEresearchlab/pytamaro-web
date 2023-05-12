import path from 'path';
import { readdir, stat } from 'fs/promises';
import { DATA_DIR } from './notebooks';
import { listActivities } from './activities';
import { listCurricula } from './curricula';
import { Author } from '../schemas/authorSchema';

async function getAuthorInfo(authorSlug: string) {
  return {
    slug: authorSlug,
    activities: await listActivities(authorSlug),
    curricula: await listCurricula(authorSlug),
  };
}

export default async function listAuthors() : Promise<Author[]> {
  const authorSlugs = (await readdir(DATA_DIR, { withFileTypes: true }))
    .filter(async (entry) => (await stat(path.join(DATA_DIR, entry.name))).isDirectory())
    .map((dir) => dir.name);
  return Promise.all(authorSlugs.map(getAuthorInfo));
}
