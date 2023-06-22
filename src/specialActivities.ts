import { isEqual } from 'lodash';
import { ActivityVariant } from './schemas/activitySchema';

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

export const toolboxDemoActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'learn-toolbox',
  language: 'en',
  version: 'v1',
};

export function isSpecialActivity(variant: ActivityVariant) {
  return isEqual(variant, toolboxActivityVariant)
  || isEqual(variant, rapidPlaygroundActivityVariant)
  || isEqual(variant, toolboxDemoActivityVariant);
}
