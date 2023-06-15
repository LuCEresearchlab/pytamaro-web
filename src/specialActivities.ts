import { isEqual } from 'lodash';

export const toolboxActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'toolbox',
  language: 'en',
  version: '1',
};

export const rapidPlaygroundActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'rapid-playground',
  language: 'en',
  version: 'v1',
};

export function isSpecialActivity(
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
) {
  const variant = {
    authorSlug, activitySlug, language, version,
  };
  return isEqual(variant, toolboxActivityVariant)
  || isEqual(variant, rapidPlaygroundActivityVariant);
}
