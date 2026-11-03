import { Container, Divider, Stack } from '@mui/material';
import { Activity, ActivityVariant } from '../src/schemas/activitySchema';
import { AuthorProfile } from '../src/schemas/authorSchema';
import { Curriculum } from '../src/schemas/curriculumSchema';
import type { ActivityState } from '../src/useActivity';
import AttributionInfo from './AttributionInfo';
import CodeDownloadButton from './CodeDownloadButton';
import FinishHourOfCodeButton from './FinishHourOfCodeButton';
import NavigateToActivity from './NavigateToActivityButton';

export default function ActivityFooter({
  activityState,
  activityVariant,
  author,
  activity,
  curriculum,
}: {
  activityState: ActivityState;
  activityVariant: ActivityVariant;
  author: AuthorProfile;
  activity: Activity;
  curriculum: Curriculum | undefined;
}) {
  const { codeCells, completed } = activityState;

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        sx={{
          mt: 12,
          mb: 6,
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
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
            activitySession={activityState.activitySession}
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
