import Grid from '@mui/material/Unstable_Grid2';
import {
  Activity, ActivityVariant, activityVariantId,
} from '../src/schemas/activitySchema';
import VariantCard from './VariantCard';

export default function VariantsGallery({
  activitiesWithVariants, noVariantInfo = false, noInProgress = false,
} :
{ activitiesWithVariants : {
  activity: Activity,
  variant: ActivityVariant,
}[],
noVariantInfo?: boolean,
noInProgress?: boolean,
}) {
  return (
    <Grid container spacing={2} rowSpacing={4}>
      {activitiesWithVariants.map((activityWithVariant) => (
        <Grid
          xs={12}
          sm={6}
          lg={4}
          key={activityVariantId(activityWithVariant.variant)}
        >
          <VariantCard
            activityWithVariant={activityWithVariant}
            noVariantInfo={noVariantInfo}
            noInProgress={noInProgress}
          />
        </Grid>
      ))}
    </Grid>
  );
}
