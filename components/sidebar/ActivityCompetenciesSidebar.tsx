import { Avatar, Box, Card, Stack } from '@mui/material';
import { allActivities } from '../../src/curricula';
import { competencyColor } from '../../src/curriculumCompetencies';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  ActivityVariant,
  activityVariantId,
} from '../../src/schemas/activitySchema';
import {
  Curriculum,
  CurriculumCompetency,
} from '../../src/schemas/curriculumSchema';
import theme from '../../src/theme';
import CompetencyCardContent from '../CompetencyCardContent';
import GenericMuiIcon from '../GenericMuiIcon';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { myCompetencyChipId } from '../UserCompetenciesStack';
import SidebarTitle from './SidebarTitle';

const AVATAR_SIZE = 24;

function CompetencyAvatar({
  curriculum,
  competency,
}: {
  curriculum: Curriculum;
  competency: CurriculumCompetency;
}) {
  const highlightCorrespondingMyCompetency = (brigheter: boolean) => {
    const element = document.getElementById(myCompetencyChipId(competency));
    if (element) {
      element.style.filter = `brightness(${brigheter ? 1.5 : 1})`;
    }
  };

  return (
    <Popover placement='left'>
      <PopoverTrigger>
        <Avatar
          sx={{
            bgcolor: theme.palette[competencyColor(competency)].main,
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            cursor: 'pointer',
          }}
          onMouseEnter={() => highlightCorrespondingMyCompetency(true)}
          onMouseLeave={() => highlightCorrespondingMyCompetency(false)}
        >
          <GenericMuiIcon iconName={competency.icon} fontSize='large' />
        </Avatar>
      </PopoverTrigger>
      <PopoverContent>
        <Card elevation={0}>
          <CompetencyCardContent
            curriculum={curriculum}
            competency={competency}
            noActivities
          />
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export default function ActivityCompetenciesSidebar({
  curriculum,
  activityVariant,
}: {
  curriculum: Curriculum;
  activityVariant: ActivityVariant;
}) {
  const { t } = useLocalTranslation(['curriculum']);
  const activities = allActivities(curriculum);
  const curriculumActivity = activities.find(
    (a) => a.id === activityVariantId(activityVariant),
  );

  if (!curriculumActivity) {
    return null;
  }

  const competencies = curriculumActivity.learningObjectives
    .map((objective) => curriculum.competencies.find((c) => c.id === objective))
    .filter((c): c is CurriculumCompetency => c !== undefined);

  return competencies.length > 0 ? (
    <Box>
      <SidebarTitle>{t('competencies')}</SidebarTitle>
      <Stack
        direction='row'
        flexWrap='wrap'
        useFlexGap
        spacing={1}
        sx={{
          maxWidth: `calc(6 * (${AVATAR_SIZE}px + ${theme.spacing(1)}))`,
        }}
      >
        {competencies.map((competency) => (
          <CompetencyAvatar
            curriculum={curriculum}
            competency={competency}
            key={competency.id}
          />
        ))}
      </Stack>
    </Box>
  ) : null;
}
