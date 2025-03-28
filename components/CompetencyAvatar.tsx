import { Avatar } from '@mui/material';
import { competencyColor } from '../src/curriculumCompetencies';
import { CurriculumCompetency } from '../src/schemas/curriculumSchema';
import theme from '../src/theme';
import GenericMuiIcon from './GenericMuiIcon';

export default function CompetencyAvatar({
  competency,
  size = 24,
  fontSize = theme.typography.pxToRem(16),
}: {
  competency: CurriculumCompetency;
  size?: number;
  fontSize?: string;
}) {
  return (
    <Avatar
      sx={{
        bgcolor: theme.palette[competencyColor(competency)].main,
        width: size,
        height: size,
      }}
    >
      <GenericMuiIcon iconName={competency.icon} fontSize={fontSize} />
    </Avatar>
  );
}
