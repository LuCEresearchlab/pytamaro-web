import { existsSync } from 'fs';
import { readFile, readdir, stat } from 'fs/promises';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import { Activity } from '../schemas/activitySchema';
import { Author, AuthorProfile } from '../schemas/authorSchema';
import { Curriculum } from '../schemas/curriculumSchema';
import { listActivities } from './activities';
import { listCurricula } from './curricula';
import { DATA_DIR } from './notebooks';

export function authorInfoPath(authorSlug: string) {
  return path.join(DATA_DIR, authorSlug, 'author.json');
}

export async function getAuthorContent(authorSlug: string) {
  return {
    slug: authorSlug,
    activities: await listActivities(authorSlug),
    curricula: await listCurricula(authorSlug),
  };
}

export async function getAuthorProfile(authorSlug: string) : Promise<AuthorProfile> {
  const { name, description } = JSON.parse(await readFile(authorInfoPath(authorSlug), 'utf-8'));
  return {
    slug: authorSlug,
    name,
    description: await serialize(description),
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

export async function listActivitiesAllAuthors() : Promise<Activity[]> {
  return (await listAuthorsWithContent()).map((author) => author.activities).flat();
}

export async function listCurriculaAllAuthors() : Promise<Curriculum[]> {
  return (await listAuthorsWithContent()).map((author) => author.curricula).flat();
}
