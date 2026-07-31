import { isEqual } from 'lodash';
import { ActivityVariant } from './schemas/activitySchema';

export const toolboxActivityVariant = (functionName: string) => ({
  authorSlug: 'luce',
  activitySlug: `$toolbox-${functionName}`,
  language: 'en',
  version: '1',
});

export const rapidEvaluatorActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'rapid-evaluator',
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

export const tamaroCardsPageActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'tamaro-cards-page',
  language: 'en',
  version: 'v1',
};

export const mathematicalFoundationsActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'mathematical-foundations',
  language: 'en',
  version: 'v1',
};

export const multipleLanguagesActivityVariant = {
  authorSlug: 'luce',
  activitySlug: 'multiple-languages',
  language: 'en',
  version: 'v1',
};

export function isToolboxActivity(variant: ActivityVariant) {
  const reference = toolboxActivityVariant('');
  return (
    variant.authorSlug === reference.authorSlug &&
    variant.activitySlug.startsWith(reference.activitySlug) &&
    variant.language === reference.language &&
    variant.version === reference.version
  );
}

export function isSpecialActivity(variant: ActivityVariant) {
  const otherSpecialActivities = [
    rapidEvaluatorActivityVariant,
    toolboxDemoActivityVariant,
    printableGraphicActivityVariant,
    tamaroCardsPageActivityVariant,
    mathematicalFoundationsActivityVariant,
  ];
  return (
    isToolboxActivity(variant) ||
    otherSpecialActivities.some((a) => isEqual(a, variant))
  );
}
