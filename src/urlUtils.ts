export function activityAssetUrl(authorSlug: string, activitySlug: string, asset: string) {
  return `/activities/${authorSlug}/${activitySlug}/${asset}`;
}

export function notebookVersionUrl(
  activitySlug: string,
  language: string,
  version: string,
) {
  return `${activitySlug}/${language}/${version}`;
}
