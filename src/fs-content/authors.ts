import path from 'path';
import { readFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { DATA_DIR } from './notebooks';
import { listActivities } from './activities';
import { listCurricula } from './curricula';
import { Author, AuthorProfile } from '../schemas/authorSchema';

export function authorInfoPath(authorSlug: string) {
  return path.join(DATA_DIR, authorSlug, 'author.json');
}

async function getAuthorContent(authorSlug: string) {
  return {
    slug: authorSlug,
    activities: await listActivities(authorSlug),
    curricula: await listCurricula(authorSlug),
  };
}

export async function getAuthorProfile(authorSlug: string) : Promise<AuthorProfile> {
  const { name } = JSON.parse(await readFile(authorInfoPath(authorSlug), 'utf-8'));
  return {
    slug: authorSlug,
    name,
  };
}

export async function listAuthorsProfiles() : Promise<AuthorProfile[]> {
  const authorSlugs = (await readdir(DATA_DIR, { withFileTypes: true }))
    .filter(async (entry) => (await stat(path.join(DATA_DIR, entry.name))).isDirectory())
    .filter((entry) => existsSync(authorInfoPath(entry.name)))
    .map((dir) => dir.name)
    .filter((name) => !/^\./.test(name)); // skip hidden directories starting with a '.', such as '.DS_Store'
  return Promise.all(authorSlugs.map(getAuthorProfile));
}

export async function listAuthorsWithContent() : Promise<Author[]> {
  const profiles = await listAuthorsProfiles();
  return Promise.all(profiles.map(({ slug }) => getAuthorContent(slug)));
}
