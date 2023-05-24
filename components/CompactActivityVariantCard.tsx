import { Card, CardActionArea } from '@mui/material';
import { useRouter } from 'next/router';
import { Activity, ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';
import { activityVariantPathname } from '../src/urlUtils';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import ActivityCardMedia from './ActivityCardMedia';

export default function CompactActivityVariantCard({ activity, variant } :
{ activity: Activity, variant: ActivityVariant }) {
  const router = useRouter();
  const handleClick = () => {
    logAnalyticsEvent(AnalyticsEventName.RecommendedActivity, {
      activityVariant: activityVariantId(variant),
    });
    router.push(activityVariantPathname(
      variant.authorSlug,
      variant.activitySlug,
      variant.language,
      variant.version,
    ));
  };
  return (
    <Card>
      <CardActionArea onClick={handleClick}>
        <ActivityCardMedia activity={activity} variant={variant} />
      </CardActionArea>
    </Card>
  );
}
