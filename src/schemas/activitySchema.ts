import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export interface Activity {
  slug: string,
  previewImage: { filename: string, backgroundColor: string },
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  variants: NotebookVariant[],
  uses: ActivityUse[],
  assets: string[],
}

export interface ActivityInfo {
  slug: string,
  completed: boolean,
}

export interface ActivityVariant {
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
}

export interface LanguageWithLatestVersion {
  language: string,
  latestVersion: string,
}

export interface ActivityUse {
  institution: string,
  course: string,
  instructors: string[],
  assignment: string,
  url: string,
}

export interface ContentItem {
  name: string,
  path: string
  type: string
}

export interface NotebookCell {
  id: string,
  source: string,
  attachments?: any,
  cell_type: CellType,
}

export interface MarkdownCell extends NotebookCell {
  cell_type: 'markdown',
  mdxSource: MDXRemoteSerializeResult,
}

export interface NotebookVariant {
  title: string,
  language: string,
  description: string,
  latestVersion: string,
}

export type CellType = 'code' | 'markdown' | 'raw';

export interface JupyterCell {
  id: string,
  source: string[],
  attachments?: any,
  cell_type: CellType,
}

export function activityVariantId(activityVariant: ActivityVariant) {
  const {
    authorSlug, activitySlug, language, version,
  } = activityVariant;
  return `${authorSlug}/${activitySlug}/${language}/${version}`;
}
