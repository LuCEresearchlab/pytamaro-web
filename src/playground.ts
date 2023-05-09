export const playgroundInitialSource = `from pytamaro import rectangle, red, show_graphic

red_square = rectangle(100, 100, red)
show_graphic(red_square)`;

export const playgroundActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'playground',
  language: 'en',
  version: 'v1',
};

export function isPlayground(
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
) {
  return authorSlug === playgroundActivityVariant.authorSlug
        && activitySlug === playgroundActivityVariant.activitySlug
        && language === playgroundActivityVariant.language
        && version === playgroundActivityVariant.version;
}
