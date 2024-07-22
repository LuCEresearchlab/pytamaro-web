import { isEqual } from 'lodash';
import { ActivityVariant } from './schemas/activitySchema';

export const toolboxActivityVariant = (functionName : string) => ({
  authorSlug: 'luce',
  activitySlug: `$toolbox-${functionName}`,
  language: 'en',
  version: '1',
});

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

export const printableGraphicActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'paper-cutouts',
  language: 'en',
  version: 'v1',
};

export function isToolboxActivity(variant: ActivityVariant) {
  const reference = toolboxActivityVariant('');
  return variant.authorSlug === reference.authorSlug
    && variant.activitySlug.startsWith(reference.activitySlug)
    && variant.language === reference.language
    && variant.version === reference.version;
}

export function isSpecialActivity(variant: ActivityVariant) {
  return isToolboxActivity(variant)
  || isEqual(variant, rapidPlaygroundActivityVariant)
  || isEqual(variant, toolboxDemoActivityVariant)
  || isEqual(variant, printableGraphicActivityVariant);
}
