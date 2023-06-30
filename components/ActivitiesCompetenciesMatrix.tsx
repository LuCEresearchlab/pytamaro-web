import {
  Box,
  Link,
  Paper, Table,
  TableBody,
  TableCell, TableContainer, TableHead, TableRow, styled,
} from '@mui/material';
import { allActivities, competencyColor } from '../src/curriculumCompetencies';
import { activityVariantId, getVariantTitle } from '../src/schemas/activitySchema';
import { Curriculum } from '../src/schemas/curriculumSchema';
import theme from '../src/theme';
import CompetencyAvatar from './CompetencyAvatar';

export function competencyAnchor(competency: { id: string }) {
  return `competency-${competency.id}`;
}

const CustomCell = styled(TableCell)(() => ({
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const HeaderCell = styled(CustomCell)(() => ({
  padding: theme.spacing(1),
  writingMode: 'vertical-rl',
  rotate: '180deg',
}));

export default function ActivitiesCompetenciesMatrix({ curriculum }: { curriculum: Curriculum }) {
  const activities = allActivities(curriculum);
  return (
    <TableContainer component={Paper}>
      <Table
        size="small"
        sx={{
          'td:last-child, th:last-child': { borderRight: 0 },
          'tbody > tr:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <CustomCell />
            {curriculum.competencies.map((competency) => (
              <HeaderCell key={competency.id}>
                <Link underline="none" color={competencyColor(competency)} href={`#${competencyAnchor(competency)}`}>{competency.name}</Link>
              </HeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => (
            <TableRow
              key={activityVariantId(activity.variant)}
              sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
            >
              <CustomCell component="th" scope="row">
                {getVariantTitle(activity.activity, activity.variant)}
              </CustomCell>
              {curriculum.competencies.map((competency) => (
                <CustomCell key={competency.id} style={{ padding: theme.spacing(1) }}>
                  {activity.learningObjectives.includes(competency.id) ? (
                    <Box sx={{
                      display: 'flex', justifyContent: 'center',
                    }}
                    >
                      <CompetencyAvatar competency={competency} />
                    </Box>
                  ) : null}
                </CustomCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
