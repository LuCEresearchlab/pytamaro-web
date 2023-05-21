// eslint-disable-next-line import/no-relative-packages
import { PythonName, imported_names } from './parser/parser';
import { latestVariant, listVisibleActivities } from './fs-content/activities';
import { readNotebookContent } from './fs-content/notebooks';
import { Activity, ActivityVariant } from './schemas/activitySchema';
import { joinLines } from './sourceUtils';
import { cellsVisibleToUser, isCodeCell } from './notebook';

export interface ActivityVariantWithNames {
  activity: Activity,
  variant: ActivityVariant,
  importedNames: PythonName[],
}

async function importedAPIs(variant: ActivityVariant) : Promise<PythonName[]> {
  const cells = await readNotebookContent(
    variant.authorSlug,
    variant.activitySlug,
    variant.language,
    variant.version,
  );
  const codeCells = cellsVisibleToUser(cells, 'student').filter(isCodeCell);
  return codeCells.flatMap((cell) => imported_names(joinLines(cell.source)));
}

export default async function getActivitiesWithAPIs(authorSlug: string)
  : Promise<ActivityVariantWithNames[]> {
  const activities = await listVisibleActivities(authorSlug);
  return (await Promise.all(
    activities.map((activity) => (
      Promise.all(activity.variants.map(async (variant) => {
        const activityVariant = latestVariant(authorSlug, activity.slug, variant);
        return {
          activity,
          variant: activityVariant,
          importedNames: await importedAPIs(activityVariant),
        };
      }))
    )),
  )).flat();
}
