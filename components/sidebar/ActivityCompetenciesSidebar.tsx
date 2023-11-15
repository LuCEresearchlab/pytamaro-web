import { Avatar, Box, Stack } from '@mui/material';
import { useState } from 'react';
import { allActivities } from '../../src/curricula';
import { competencyColor } from '../../src/curriculumCompetencies';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { ActivityVariant, activityVariantId } from '../../src/schemas/activitySchema';
import { Curriculum, CurriculumCompetency } from '../../src/schemas/curriculumSchema';
import theme from '../../src/theme';
import CompetencyCard from '../CompetencyCard';
import GenericMuiIcon from '../GenericMuiIcon';
import { myCompetencyChipId } from '../UserCompetenciesStack';
import SidebarItemPopover from './SidebarItemPopover';
import SidebarTitle from './SidebarTitle';

const AVATAR_SIZE = 24;

function CompetencyAvatar({ curriculum, competency } :
{ curriculum: Curriculum, competency: CurriculumCompetency }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const highlightCorrespondingMyCompetency = (brigheter: boolean) => {
    const element = document.getElementById(myCompetencyChipId(competency));
    if (element) {
      element.style.filter = `brightness(${brigheter ? 1.5 : 1})`;
    }
  };

  const open = Boolean(anchorEl);
  const popoverId = `activity-competency-popover-${competency.id}`;
  return (
    <>
      <Avatar
        sx={{
          bgcolor: theme.palette[competencyColor(competency)].main,
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          cursor: 'pointer',
        }}
        aria-owns={open ? popoverId : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        onMouseEnter={() => highlightCorrespondingMyCompetency(true)}
        onMouseLeave={() => highlightCorrespondingMyCompetency(false)}
      >
        <GenericMuiIcon
          iconName={competency.icon}
          fontSize="large"
        />
      </Avatar>
      <SidebarItemPopover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        fromRight
      >
        <CompetencyCard curriculum={curriculum} competency={competency} noActivities />
      </SidebarItemPopover>
    </>
  );
}

export default function ActivityCompetenciesSidebar({ curriculum, activityVariant } :
{ curriculum: Curriculum, activityVariant: ActivityVariant }) {
  const { t } = useLocalTranslation(['curriculum']);
  const activities = allActivities(curriculum);
  const curriculumActivity = activities.find((a) => a.id === activityVariantId(activityVariant));

  if (!curriculumActivity) {
    return null;
  }

  const competencies = curriculumActivity.learningObjectives
    .map((objective) => curriculum.competencies.find((c) => c.id === objective))
    .filter((c): c is CurriculumCompetency => c !== undefined);

  return competencies.length > 0 ? (
    <Box>
      <SidebarTitle>
        {t('competencies')}
      </SidebarTitle>
      <Stack
        direction="row"
        flexWrap="wrap"
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
