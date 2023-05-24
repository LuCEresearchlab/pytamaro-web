import path from 'path';
import { readFile, readdir, stat } from 'fs/promises';
import { DATA_DIR } from './notebooks';
import { listActivities } from './activities';
import { listCurricula } from './curricula';
import { Author, AuthorProfile } from '../schemas/authorSchema';

async function getAuthorContent(authorSlug: string) {
  return {
    slug: authorSlug,
    activities: await listActivities(authorSlug),
    curricula: await listCurricula(authorSlug),
  };
}

export async function getAuthorProfile(authorSlug: string) : Promise<AuthorProfile> {
  const { name } = JSON.parse(await readFile(path.join(DATA_DIR, authorSlug, 'author.json'), 'utf-8'));
  return {
    slug: authorSlug,
    name,
  };
}

export default async function listAuthors() : Promise<Author[]> {
  const authorSlugs = (await readdir(DATA_DIR, { withFileTypes: true }))
    .filter(async (entry) => (await stat(path.join(DATA_DIR, entry.name))).isDirectory())
    .map((dir) => dir.name)
    .filter((name) => !/^\./.test(name)); // skip hidden directories starting with a '.', such as '.DS_Store'
  return Promise.all(authorSlugs.map(getAuthorContent));
}
