import { Card, CardActionArea, CardMedia } from '@mui/material';
import { useRouter } from 'next/router';
import { Activity, ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';
import { activityAssetPathname, activityVariantPathname } from '../src/urlUtils';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';

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
        <CardMedia
          component="img"
          height="100rem"
          image={activityAssetPathname(
            variant.authorSlug,
            variant.activitySlug,
            activity.previewImage.filename,
          )}
          sx={{ padding: 0.3, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
        />
      </CardActionArea>
    </Card>
  );
}
