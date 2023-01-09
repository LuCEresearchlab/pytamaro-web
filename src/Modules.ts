import path from 'path';
import { readdir, readFile } from 'fs/promises';

const MODULES_PATH = 'learning_modules';
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
  target: string,
  description: string,
}

export interface Module {
  slug: string,
  previewImage: string,
  variants: NotebookVariant[],
}

export async function variantInfo(slug: string, language: string, target: string)
  : Promise<NotebookVariant> {
  const mod = await getModuleInfo(slug);
  return mod.variants.find((v : NotebookVariant) => v.language === language && v.target === target);
}

export async function listModules() : Promise<Module[]> {
  const slugs = (await readdir(MODULES_PATH, { withFileTypes: true }))
    .filter((item) => item.isDirectory())
    .map((dir) => dir.name);

  return Promise.all(slugs.map(getModuleInfo));
}

export async function getModuleAsset(slug: string, asset: string) {
  return readFile(path.join(MODULES_PATH, slug, asset));
}

export function moduleAssetUrl(slug: string, asset: string) {
  return `/modules/${slug}/${asset}`;
}
