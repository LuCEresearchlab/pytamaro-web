import {
  Avatar, Box, Card, Chip,
  Stack,
} from '@mui/material';
import { sortBy } from 'lodash';
import { competencyColor } from '../src/curriculumCompetencies';
import { Curriculum, CurriculumActivity, CurriculumCompetency } from '../src/schemas/curriculumSchema';
import theme from '../src/theme';
import CompetencyCardContent from './CompetencyCardContent';
import GenericMuiIcon from './GenericMuiIcon';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { SIDEBAR_CHIPS_FONT_SIZE, SIDEBAR_CHIPS_WIDTH } from './sidebar/Sidebar';

export function myCompetencyChipId(competency: CurriculumCompetency) {
  return `my-competency-${competency.id}`;
}

function UserCompetencyChip({ curriculum, competency, completedActivities }:
{ curriculum: Curriculum, competency: CurriculumCompetency,
  completedActivities: CurriculumActivity[] }) {
  return (
    <Popover placement="right">
      <PopoverTrigger>
        <Chip
          id={myCompetencyChipId(competency)}
          clickable
          label={(
            <Box display="flex" justifyContent="space-between">
              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{competency.name}</Box>
              <Avatar sx={{
                width: '2.2ch',
                height: '2.2ch',
                textAlign: 'center',
                fontSize: '1rem',
                bgcolor: theme.palette[competencyColor(competency)].main,
                marginLeft: 'auto',
              }}
              >
                {completedActivities.length}
              </Avatar>
            </Box>
        )}
          size="small"
          variant="filled"
          color={competencyColor(competency)}
          icon={(
            <GenericMuiIcon
              fontSize={theme.typography.pxToRem(20)}
              iconName={competency.icon}
            />
          )}
          sx={{
            width: SIDEBAR_CHIPS_WIDTH,
            fontSize: SIDEBAR_CHIPS_FONT_SIZE,
            justifyContent: 'flex-start',
            paddingX: 0.5,
            '& .MuiChip-label': {
              width: '100%',
              paddingRight: 0,
            },
          }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <Card elevation={0}>
          <CompetencyCardContent curriculum={curriculum} competency={competency} />
        </Card>
      </PopoverContent>
    </Popover>
  );
}
export default function UserCompetenciesStack({ curriculum, userCompetencies, direction } : {
  curriculum: Curriculum,
  userCompetencies: {
    competency: CurriculumCompetency,
    allActivities: CurriculumActivity[],
    completedActivities: CurriculumActivity[]
  }[],
  direction: 'row' | 'column'
}) {
  return (
    <Stack
      spacing={1}
      direction={direction}
      flexWrap={direction === 'row' ? 'wrap' : undefined}
      useFlexGap
    >
      {sortBy(userCompetencies, ({ competency }) => (competency.category === 'programming' ? 0 : 1)).map((userCompetency) => (
        <UserCompetencyChip
          key={userCompetency.competency.id}
          curriculum={curriculum}
          competency={userCompetency.competency}
          completedActivities={userCompetency.completedActivities}
        />
      ))}
    </Stack>
  );
}
