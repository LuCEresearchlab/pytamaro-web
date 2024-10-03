import { readdir } from 'fs/promises';
import path from 'path';

export default async function allDocumentationModules() {
  return (await readdir('public/docs')).map((name) => path.basename(name, '.json'));
}
