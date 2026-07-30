import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export type VisibilityState = 'featured' | 'visible' | 'draft' | 'hidden';
export type PreviewImage = { filename: string; backgroundColor: string };

export interface BasicActivity {
  slug: string;
  previewImage: PreviewImage;
  visibility: VisibilityState;
  variants: ActivityVariant[];
  languagesInfo: ActivityLanguageInfo[];
  authorSlug: string;
  concepts: string[];
}

export type Activity = BasicActivity & {
  uses: ActivityUse[];
  assets: string[];
  derivedFrom: string[];
  extraPythonFiles: PythonFile[];
  platformConfig: PlatformConfiguration;
};

export interface RawActivity {
  variants: ActivityLanguageInfo[];
  previewImage: PreviewImage;
  visibility: VisibilityState;
  uses?: ActivityUse[];
  assets?: string[];
  derivedFrom?: string[];
  extraPythonFiles?: PythonFileInfo[];
  platformConfig?: Partial<PlatformConfiguration>;
  concepts?: string[];
}

export interface PlatformConfiguration {
  showNoOutputTip: boolean;
  showVariantSelector: boolean;
}

export interface PythonFile {
  name: string; // 'name' to be consistent with glot (back to when it was used for execution), but it is potentially a path
  content: string;
}

export interface PythonFileInfo {
  sourcePath: string;
  destinationPath: string;
}

export interface ActivityInfo {
  slug: string;
  completed: boolean;
}

export interface ActivityVariant {
  authorSlug: string;
  activitySlug: string;
  language: string;
  version: string;
}

export interface ActivityLanguageInfo {
  title: string;
  language: string;
  latestVersion: string;
}

export interface ActivityUse {
  institution: string;
  course: string;
  instructors: string[];
  assignment: string;
  url: string;
  hidden?: boolean;
}

export interface ContentItem {
  name: string;
  path: string;
  type: string;
}

export interface NotebookCell {
  id: string;
  source: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments?: any;
  cell_type: CellType;
}

export interface MarkdownCell extends NotebookCell {
  cell_type: 'markdown';
  mdxSource: MDXRemoteSerializeResult;
}

export type CellType = 'code' | 'markdown' | 'raw';

export interface JupyterCell {
  id: string;
  source: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments?: any;
  cell_type: CellType;
}

export function activityVariantId(activityVariant: ActivityVariant) {
  const { authorSlug, activitySlug, language, version } = activityVariant;
  return `${authorSlug}/${activitySlug}/${language}/${version}`;
}

export function activityVariantFromId(id: string): ActivityVariant {
  const [authorSlug, activitySlug, language, version] = id.split('/');
  return {
    authorSlug,
    activitySlug,
    language,
    version,
  };
}

export function getVariantTitle(
  activity: BasicActivity,
  variant: ActivityVariant,
) {
  const maybeInfo = activity.languagesInfo.find(
    (i) => i.language === variant.language,
  );
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return maybeInfo?.title || activity.slug;
}

export function canonicalVariantForLanguage(
  activity: BasicActivity,
  language: string,
): ActivityVariant {
  const languageInfo = activity.languagesInfo.find(
    (i) => i.language === language,
  );
  return activity.variants.find(
    (v) => v.language === language && v.version === languageInfo?.latestVersion,
  ) as ActivityVariant;
}

export function languageInfoForVariant(
  activity: BasicActivity,
  variant: ActivityVariant,
) {
  return activity.languagesInfo.find(
    (i) => i.language === variant.language,
  ) as ActivityLanguageInfo;
}

export function platformConfigWithDefaults(
  config: Partial<PlatformConfiguration> = {},
): PlatformConfiguration {
  return {
    showNoOutputTip: config.showNoOutputTip ?? true,
    showVariantSelector: config.showVariantSelector ?? true,
  };
}
