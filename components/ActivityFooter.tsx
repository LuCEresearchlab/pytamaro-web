import { Container, Divider, Stack } from '@mui/material';
import { CodeCellState } from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { Activity, ActivityVariant } from '../src/schemas/activitySchema';
import { AuthorProfile } from '../src/schemas/authorSchema';
import { Curriculum } from '../src/schemas/curriculumSchema';
import AttributionInfo from './AttributionInfo';
import CodeDownloadButton from './CodeDownloadButton';
import FinishHourOfCodeButton from './FinishHourOfCodeButton';
import NavigateToActivity from './NavigateToActivityButton';

export default function ActivityFooter({
  activityVariant, initialCodeCells, author, activity, curriculum,
} : {
  activityVariant: ActivityVariant,
  initialCodeCells: CodeCellState[],
  author: AuthorProfile,
  activity: Activity,
  curriculum: Curriculum | undefined,
}) {
  const {
    codeCells, completed,
  } = useLocalActivity(initialCodeCells, activityVariant);
  return (
    <>
      <Stack mt={12} mb={6} direction="row" justifyContent="center" spacing={4}>
        {curriculum && (
          <NavigateToActivity
            activityVariant={activityVariant}
            curriculum={curriculum}
            direction="previous"
            completed={completed}
          />
        )}
        <CodeDownloadButton codeCells={codeCells} extraPythonFiles={activity.extraPythonFiles} />
        {curriculum && (
          <NavigateToActivity
            activityVariant={activityVariant}
            curriculum={curriculum}
            direction="next"
            completed={completed}
          />
        )}
      </Stack>
      { curriculum?.hourOfCode && (
        <FinishHourOfCodeButton />
      )}
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Divider sx={{ mb: 3 }} />
        <AttributionInfo type="activity" author={author} derivedFrom={activity.derivedFrom} />
      </Container>
    </>
  );
}
