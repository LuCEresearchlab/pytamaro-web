function contentTypeByAuthorPathname(contentType: string, authorSlug: string) {
  return `/${contentType}/${authorSlug}`;
}

/* Activities */

export function activitiesByAuthorPathname(authorSlug: string) {
  return contentTypeByAuthorPathname('activities', authorSlug);
}

export function activityPathname(
  authorSlug: string,
  activitySlug: string,
) {
  return `${activitiesByAuthorPathname(authorSlug)}/${activitySlug}`;
}

export function activityVariantPathname(
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
) {
  return `${activityPathname(authorSlug, activitySlug)}/${language}/${version}`;
}

export function activityAssetPathname(authorSlug: string, activitySlug: string, asset: string) {
  return `${activityPathname(authorSlug, activitySlug)}/${asset}`;
}

export const CURRICULUM_QUERY_PARAM = 'curriculum';

/* Curricula */

export function curriculaByAuthorPathname(authorSlug: string) {
  return contentTypeByAuthorPathname('curricula', authorSlug);
}

export function curriculumPathname(authorSlug: string, curriculumSlug: string) {
  return `${curriculaByAuthorPathname(authorSlug)}/${curriculumSlug}`;
}

/* Authors */

export function authorPathname(authorSlug: string) {
  return contentTypeByAuthorPathname('authors', authorSlug);
}

/* Toolbox */

export function toolboxFunctionAnchor(functionName: string) {
  return `toolbox-${functionName}`;
}

export function toolboxFunctionPathname(functionName: string) {
  return `/my-progress#${toolboxFunctionAnchor(functionName)}`;
}

/* Extra */

export function playgroundPathname() {
  return '/playground';
}

export function pytamaroDocsUrl() {
  return 'https://pytamaro.readthedocs.org';
}
