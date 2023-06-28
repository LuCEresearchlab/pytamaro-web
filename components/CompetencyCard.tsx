import {
  Box, CardContent, Chip, Typography,
} from '@mui/material';
import { allActivitiesForCompetency, competencyColor, completedActivitiesForCompetency } from '../src/curriculumCompetencies';
import { format } from '../src/internationalization';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { Curriculum, CurriculumCompetency } from '../src/schemas/curriculumSchema';
import GenericMuiIcon from './GenericMuiIcon';
import VariantsGallery from './VariantsGallery';

export default function CompetencyCard({ curriculum, competency, fullWidth = false }:
{ curriculum: Curriculum, competency: CurriculumCompetency, fullWidth?: boolean }) {
  const { metadata } = useLocalProfile();
  const allActivities = allActivitiesForCompetency(curriculum, competency);
  const completedActivities = completedActivitiesForCompetency(allActivities, metadata.activities);
  return (
    <CardContent sx={{ pb: 1, minWidth: '80ch', maxWidth: fullWidth ? 'none' : '100ch' }}>
      <Box display="flex" alignItems="center">
        <GenericMuiIcon iconName={competency.icon} />
        <Typography fontSize="1.1em" fontWeight="bold" mx="1ch">
          {competency.name}
        </Typography>
        <Chip
          label={competency.category.toUpperCase()}
          color={competencyColor(competency)}
          sx={{ ml: '1ch' }}
        />
      </Box>
      <Typography fontWeight="bold" marginY={1}>
        {competency.description}
      </Typography>
      <Typography marginTop={2}>
        {`Practiced in ${completedActivities.length} out of ${format(allActivities.length, 'activity', 'activities')}:`}
      </Typography>
      <Box mt={2} mb={2}>
        <VariantsGallery
          activitiesWithVariants={allActivities}
          noVariantInfo
          noInProgress
          clickingDisabled
        />
      </Box>
      <Typography color="text.secondary" marginBottom={1}>
        {competency.longDescription}
      </Typography>
    </CardContent>
  );
}
