export function activitiesByAuthorPathname(authorSlug: string) {
  return `/activities/${authorSlug}`;
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
