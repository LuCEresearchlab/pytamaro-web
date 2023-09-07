import { Container, Divider, Stack } from '@mui/material';
import { CodeCellState } from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { Activity, ActivityVariant } from '../src/schemas/activitySchema';
import { AuthorProfile } from '../src/schemas/authorSchema';
import AttributionInfo from './AttributionInfo';
import BackToCurriculum from './BackToCurriculum';
import CodeDownloadButton from './CodeDownloadButton';
import MarkCompletedButton from './MarkCompletedButton';
import { Curriculum } from '../src/schemas/curriculumSchema';

export default function ActivityFooter({
  activityVariant, initialCodeCells, author, activity, curriculum,
} : {
  activityVariant: ActivityVariant,
  initialCodeCells: CodeCellState[],
  author: AuthorProfile,
  activity: Activity,
  curriculum: Curriculum,
}) {
  const {
    codeCells, completed,
    toggleCompleted,
  } = useLocalActivity(initialCodeCells, activityVariant);
  return (
    <>
      <Stack mt={12} mb={6} direction="row" justifyContent="center" spacing={4}>
        <CodeDownloadButton codeCells={codeCells} />
        <MarkCompletedButton completed={completed} toggleCompleted={toggleCompleted} />
      </Stack>
      <BackToCurriculum activityVariant={activityVariant} curriculum={curriculum} completed={completed}/>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Divider sx={{ mb: 3 }} />
        <AttributionInfo type="activity" author={author} derivedFrom={activity.derivedFrom} />
      </Container>
    </>
  );
}
