import path from 'path';
import { readdir, readFile } from 'fs/promises';

export const MODULES_PATH = 'learning_modules';
const MODULE_INFO_FILE = 'info.json';

async function getModuleInfo(slug: string) {
  const content = await readFile(path.join(MODULES_PATH, slug, MODULE_INFO_FILE), 'utf-8');
  return {
    slug,
    ...JSON.parse(content),
  };
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

export interface Module {
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

async function notebookFileNames(slug: string) {
  const suffix = '.ipynb';
  const notebooks = (await readdir(path.join(MODULES_PATH, slug))).filter(
    (file) => file.endsWith(suffix),
  );
  return notebooks.map((filename) => filename.replace(suffix, ''));
}

export async function findVersions(slug: string, language: string)
  : Promise<string[]> {
  const prefix = `${slug}-${language}-`;
  return (await notebookFileNames(slug)).filter((filename) => filename.startsWith(prefix)).map(
    (filename) => filename.replace(prefix, ''),
  );
}

export async function variantInfo(slug: string, language: string)
  : Promise<NotebookVariant> {
  const mod = await getModuleInfo(slug);
  return mod.variants.find((v : NotebookVariant) => v.language === language);
}

export async function findLanguages(slug: string)
  : Promise<LanguageWithLatestVersion[]> {
  const notebooks = await notebookFileNames(slug);
  const languages = notebooks.map((filename) => filename.split('-').at(-2)) as string[];
  const uniqueLanguages = Array.from(new Set(languages));
  return Promise.all(uniqueLanguages.map(async (language) => (
    { language, latestVersion: (await variantInfo(slug, language)).latestVersion })));
}

export async function listModules() : Promise<Module[]> {
  const slugs = (await readdir(MODULES_PATH, { withFileTypes: true }))
    .filter((item) => item.isDirectory())
    .map((dir) => dir.name);

  return Promise.all(slugs.map(getModuleInfo));
}

export async function getModule(slug: string) : Promise<Module> {
  return getModuleInfo(slug);
}

export async function getNotebookUses(slug: string) : Promise<NotebookUse[]> {
  const mod = await getModuleInfo(slug);
  return mod.uses.filter((use: NotebookUse) => use.course !== 'internal');
}
