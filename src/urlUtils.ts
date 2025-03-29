import { ActivityVariant } from './schemas/activitySchema';
import { Curriculum, curriculumId } from './schemas/curriculumSchema';

function contentTypeByAuthorPathname(contentType: string, authorSlug: string) {
  return `/${contentType}/${authorSlug}`;
}

/* Activities */

export function activitiesByAuthorPathname(authorSlug: string) {
  return contentTypeByAuthorPathname('activities', authorSlug);
}

export function activityPathname(authorSlug: string, activitySlug: string) {
  return `${activitiesByAuthorPathname(authorSlug)}/${activitySlug}`;
}

export function activityVariantPathnameFromParts(
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
) {
  return `${activityPathname(authorSlug, activitySlug)}/${language}/${version}`;
}

export function activityVariantPathname(variant: ActivityVariant) {
  return activityVariantPathnameFromParts(
    variant.authorSlug,
    variant.activitySlug,
    variant.language,
    variant.version,
  );
}

export function activityAssetPathname(
  authorSlug: string,
  activitySlug: string,
  asset: string,
) {
  return `${activityPathname(authorSlug, activitySlug)}/${asset}`;
}

export const CURRICULUM_QUERY_PARAM = 'curriculum';

export function activityVariantWithCurriculum(
  variant: ActivityVariant,
  curriculum: Curriculum,
) {
  return `${activityVariantPathname(variant)}?${new URLSearchParams({ [CURRICULUM_QUERY_PARAM]: curriculumId(curriculum.authorSlug, curriculum.slug) }).toString()}`;
}

/* Curricula */

export function curriculaByAuthorPathname(authorSlug: string) {
  return contentTypeByAuthorPathname('curricula', authorSlug);
}

export function curriculumPathname(authorSlug: string, curriculumSlug: string) {
  return `${curriculaByAuthorPathname(authorSlug)}/${curriculumSlug}`;
}

export function curriculumWithAnchor(
  authorSlug: string,
  curriculumSlug: string,
  anchor: string,
  anchorTo?: string,
) {
  const query = new URLSearchParams();
  if (anchorTo) {
    query.set('to', anchorTo);
  }
  return `${curriculumPathname(authorSlug, curriculumSlug)}?${query.toString()}#${anchor}`;
}

export function curriculumInfoPathname(
  authorSlug: string,
  curriculumSlug: string,
) {
  return `${curriculumPathname(authorSlug, curriculumSlug)}/info`;
}

export function curriculumFinishPathname(
  authorSlug: string,
  curriculumSlug: string,
) {
  return `${curriculumPathname(authorSlug, curriculumSlug)}/finish`;
}

/* Authors */

export function authorPathname(authorSlug: string) {
  return contentTypeByAuthorPathname('authors', authorSlug);
}

/* Extra */

export function playgroundPathname(initialCode?: string) {
  const basePath = '/playground';
  if (!initialCode) {
    return basePath;
  }
  const base64code = Buffer.from(initialCode).toString('base64');
  const queryParams = new URLSearchParams({ code: base64code });
  return `${basePath}?${queryParams.toString()}`;
}

export function curriculaPathname() {
  return '/curricula';
}

export function myProgressPathname() {
  return '/my-progress';
}

export function myDataPathname() {
  return '/my-data';
}

export function myActivitiesPathname() {
  return '/my-activities';
}

export function myCurriculaPathname() {
  return '/my-curricula';
}

export function myToolboxPathname() {
  return '/my-toolbox';
}

export function pytamaroDocsUrl() {
  return 'https://pytamaro.readthedocs.org';
}

export function teachingResourcesPathname() {
  return '/teaching-resources';
}

export function aboutPathname() {
  return '/about';
}

/* Toolbox */

export function toolboxFunctionAnchor(functionName: string) {
  return `toolbox-${functionName}`;
}

export function toolboxFunctionPathname(functionName: string) {
  return `${myToolboxPathname()}#${toolboxFunctionAnchor(functionName)}`;
}

/* Concepts */

export function conceptPathname(concept: string) {
  return `/concepts/${concept}`;
}

/* Documentation */

export function judiciousDocPathname(module: string) {
  return `/docs/${module}.json`;
}

export function documentationPathname() {
  return '/documentation';
}

export function documentationModulePathname(module: string) {
  return `${documentationPathname()}/${module}`;
}

export function documentationElementPathname(module: string, element: string) {
  return `${documentationModulePathname(module)}/${element}`;
}
