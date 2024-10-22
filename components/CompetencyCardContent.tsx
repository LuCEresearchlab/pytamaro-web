import {
  Box, CardContent, Chip,
  Stack, Typography,
} from '@mui/material';
import { MDXRemote } from 'next-mdx-remote';
import { allActivitiesForCompetency, competencyColor, completedActivitiesForCompetency } from '../src/curriculumCompetencies';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { activityVariantId } from '../src/schemas/activitySchema';
import { Curriculum, CurriculumCompetency } from '../src/schemas/curriculumSchema';
import GenericMuiIcon from './GenericMuiIcon';
import VariantCard from './VariantCard';

function LongDescriptionTypography({ children = null }: { children?: React.ReactNode }) {
  return (
    <Typography color="text.secondary">
      {children}
    </Typography>
  );
}

export default function CompetencyCardContent({
  curriculum, competency, fullWidth = false, noActivities = false,
}: {
  curriculum: Curriculum, competency: CurriculumCompetency,
  fullWidth?: boolean, noActivities?: boolean
}) {
  const { metadata } = useLocalProfile();
  const allActivities = allActivitiesForCompetency(curriculum, competency);
  const completedActivities = completedActivitiesForCompetency(allActivities, metadata.activities);
  const { t } = useLocalTranslation(['curriculum']);
  const color = competencyColor(competency);
  return (
    <CardContent sx={{ minWidth: '80ch', maxWidth: fullWidth ? 'none' : '100ch' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <GenericMuiIcon fontSize="1.5em" iconName={competency.icon} color={color} />
        <Typography fontSize="1.3em" fontWeight="bold" mx="1ch" color={color}>
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
      {!noActivities && allActivities.length > 0 && (
        <>
          <Typography marginTop={2}>
            {t('practicedInOutOf', { done: completedActivities.length, total: allActivities.length, count: allActivities.length })}
          </Typography>
          <Box sx={{ overflow: 'auto' }}>
            <Box sx={{ display: 'flex', width: 'fit-content' }} p={1}>
              <Stack mt={2} direction="row" spacing={2}>
                {allActivities.map((activityWithVariant) => (
                  <VariantCard
                    key={activityVariantId(activityWithVariant.variant)}
                    activityWithVariant={activityWithVariant}
                    width="30ch"
                    noVariantInfo
                    noInProgress
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </>
      )}
      {competency.longDescription && (
        <Box marginTop={3}>
          <MDXRemote
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...competency.longDescription}
            components={{ p: LongDescriptionTypography }}
          />
        </Box>
      )}
    </CardContent>
  );
}
