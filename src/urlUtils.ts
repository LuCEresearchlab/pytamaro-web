export function moduleAssetUrl(slug: string, asset: string) {
  return `/modules/${slug}/${asset}`;
}

export function notebookVersionUrl(
  slug: string,
  language: string,
  version: string,
) {
  return `${slug}/${language}/${version}`;
}
