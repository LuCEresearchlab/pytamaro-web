import { Container, Divider, Stack } from '@mui/material';
import { CodeCellState } from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { Activity, ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';
import { AuthorProfile } from '../src/schemas/authorSchema';
import { Curriculum } from '../src/schemas/curriculumSchema';
import AttributionInfo from './AttributionInfo';
import CodeDownloadButton from './CodeDownloadButton';
import CompleteActivityButton from './CompleteActivityButton';

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
    toggleCompleted,
  } = useLocalActivity(initialCodeCells, activityVariant);
  return (
    <>
      <Stack mt={12} mb={6} direction="row" justifyContent="center" spacing={4}>
        <CodeDownloadButton codeCells={codeCells} />
        <CompleteActivityButton
          completed={completed}
          toggleCompleted={toggleCompleted}
          activityVariant={activityVariant}
          curriculum={curriculum}
          key={activityVariantId(activityVariant)}
        />
      </Stack>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Divider sx={{ mb: 3 }} />
        <AttributionInfo type="activity" author={author} derivedFrom={activity.derivedFrom} />
      </Container>
    </>
  );
}
