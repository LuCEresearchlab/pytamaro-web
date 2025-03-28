import Grid from '@mui/material/Grid2';
import { ActivityVariantWithNames } from '../src/activitiesAPIs';
import { activityVariantId } from '../src/schemas/activitySchema';
import CompactActivityVariantCard from './CompactActivityVariantCard';

export default function ActivitiesStripe({
  activities,
}: {
  activities: ActivityVariantWithNames[];
}) {
  // Show a stripe with the first 3 activities
  return (
    <Grid container spacing={4}>
      {activities.slice(0, 3).map(({ activity, variant }) => (
        <Grid key={activityVariantId(variant)} size={4}>
          <CompactActivityVariantCard activity={activity} variant={variant} />
        </Grid>
      ))}
    </Grid>
  );
}
