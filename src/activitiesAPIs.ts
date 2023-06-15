import { listVisibleActivities } from './fs-content/activities';
import { readNotebookContent } from './fs-content/notebooks';
import { cellsVisibleToUser, isCodeCell } from './notebook';
import { PythonName, imported_names } from './python-analyzer/python_analyzer';
import { Activity, ActivityVariant } from './schemas/activitySchema';
import { joinLines } from './sourceUtils';

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
      Promise.all(activity.languagesInfo.map(async (info) => {
        const variant = {
          authorSlug,
          activitySlug: activity.slug,
          language: info.language,
          version: info.latestVersion,
        };
        return {
          activity,
          variant,
          importedNames: await importedAPIs(variant),
        };
      })))),
  )).flat();
}
