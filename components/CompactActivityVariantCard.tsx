import { Card, CardActionArea } from '@mui/material';
import { useRouter } from 'next/router';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import {
  ActivityVariant,
  activityVariantId,
  BasicActivity,
} from '../src/schemas/activitySchema';
import { activityVariantPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';

export default function CompactActivityVariantCard({
  activity,
  variant,
}: {
  activity: BasicActivity;
  variant: ActivityVariant;
}) {
  const router = useRouter();
  const handleClick = () => {
    logAnalyticsEvent(AnalyticsEventName.RecommendedActivity, {
      activityVariant: activityVariantId(variant),
    });
    router.push(activityVariantPathname(variant));
  };
  return (
    <Card>
      <CardActionArea onClick={handleClick}>
        <ActivityCardMedia activity={activity} variant={variant} />
      </CardActionArea>
    </Card>
  );
}
