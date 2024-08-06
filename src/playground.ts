import { isEqual } from 'lodash';
import { ActivityVariant } from './schemas/activitySchema';

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
  const variant = {
    authorSlug, activitySlug, language, version,
  };
  return isEqual(variant, playgroundActivityVariant);
}

export function isPlaygroundVariant(activityVariant: ActivityVariant) {
  return isEqual(activityVariant, playgroundActivityVariant);
}
