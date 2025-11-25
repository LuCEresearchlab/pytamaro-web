import { uniq } from 'lodash';
import {
  basicActivities,
  listVisibleActivities,
} from './fs-content/activities';
import { readNotebookContent } from './fs-content/notebooks';
import { cellsVisibleToUser, isCodeCell } from './notebook';
import { PythonName, analyze } from './python-analyzer/python_analyzer';
import { ActivityVariant, BasicActivity } from './schemas/activitySchema';
import { joinLines } from './sourceUtils';

export interface ActivityVariantWithNames {
  activity: BasicActivity;
  variant: ActivityVariant;
  importedNames: string[];
}

async function importedAPIs(variant: ActivityVariant): Promise<PythonName[]> {
  const cells = await readNotebookContent(
    variant.authorSlug,
    variant.activitySlug,
    variant.language,
    variant.version,
  );
  const codeCells = cellsVisibleToUser(cells, 'student').filter(isCodeCell);
  return codeCells.flatMap(
    (cell) => analyze(joinLines(cell.source)).imported_names,
  );
}

export default async function getActivitiesWithAPIs(
  authorSlug: string,
): Promise<ActivityVariantWithNames[]> {
  const activities = basicActivities(await listVisibleActivities(authorSlug));
  return (
    await Promise.all(
      activities.map((activity) =>
        Promise.all(
          activity.languagesInfo.map(async (info) => {
            const variant = {
              authorSlug,
              activitySlug: activity.slug,
              language: info.language,
              version: info.latestVersion,
            };
            return {
              activity,
              variant,
              importedNames: uniq(
                (await importedAPIs(variant)).map(
                  (pythonName) => pythonName.module + '.' + pythonName.name,
                ),
              ),
            };
          }),
        ),
      ),
    )
  ).flat();
}
