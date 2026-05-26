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
  activityVariant,
  initialCodeCells,
  author,
  activity,
  curriculum,
}: {
  activityVariant: ActivityVariant;
  initialCodeCells: CodeCellState[];
  author: AuthorProfile;
  activity: Activity;
  curriculum: Curriculum | undefined;
}) {
  const { codeCells, completed } = useLocalActivity(
    initialCodeCells,
    activityVariant,
  );

  return (
    <>
      <Stack
        mt={12}
        mb={6}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-around'
        spacing={4}
        alignItems='center'
      >
        {curriculum && (
          <NavigateToActivity
            activityVariant={activityVariant}
            curriculum={curriculum}
            direction='previous'
            completed={completed}
          />
        )}
        {codeCells.length > 0 && (
          <CodeDownloadButton
            codeCells={codeCells}
            extraPythonFiles={activity.extraPythonFiles}
          />
        )}
        {curriculum && (
          <NavigateToActivity
            activityVariant={activityVariant}
            curriculum={curriculum}
            direction='next'
            completed={completed}
          />
        )}
      </Stack>
      {curriculum?.hourOfCode === true && <FinishHourOfCodeButton />}
      <Divider sx={{ mb: 3 }} />
      <Container maxWidth='md' sx={{ textAlign: 'center' }}>
        <AttributionInfo
          type='activity'
          author={author}
          derivedFrom={activity.derivedFrom}
        />
      </Container>
    </>
  );
}
