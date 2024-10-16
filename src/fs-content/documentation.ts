import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { JudiciousModule } from '../schemas/documentation';
import DataCache from './cache';

const DOCS_DIR = 'public/docs';

export default async function allDocumentationModules() {
  return (await readdir(DOCS_DIR)).map((name) => path.basename(name, '.json'));
}

const documentationCache = new DataCache<JudiciousModule>();

export async function readDocumentation(module: string) : Promise<JudiciousModule> {
  return documentationCache.get(
    module,
    async () => JSON.parse(await readFile(`${DOCS_DIR}/${module}.json`, 'utf8')),
  );
}
