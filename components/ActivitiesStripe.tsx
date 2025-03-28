import Grid from '@mui/material/Unstable_Grid2';
import CompactActivityVariantCard from './CompactActivityVariantCard';
import { ActivityVariantWithNames } from '../src/activitiesAPIs';
import { activityVariantId } from '../src/schemas/activitySchema';

export default function ActivitiesStripe({
  activities,
}: {
  activities: ActivityVariantWithNames[];
}) {
  // Show a stripe with the first 3 activities
  return (
    <Grid container spacing={4} disableEqualOverflow>
      {activities.slice(0, 3).map(({ activity, variant }) => (
        <Grid key={activityVariantId(variant)} md={4}>
          <CompactActivityVariantCard activity={activity} variant={variant} />
        </Grid>
      ))}
    </Grid>
  );
}
