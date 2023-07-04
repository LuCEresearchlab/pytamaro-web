import { CardMedia } from '@mui/material';
import { Activity, ActivityVariant } from '../src/schemas/activitySchema';
import { activityAssetPathname } from '../src/urlUtils';

export default function CompactActivityVariantCard({ activity, variant, height = '100rem' } :
{ activity: Activity, variant: ActivityVariant, height?: string }) {
  return (
    <CardMedia
      component="img"
      height={height}
      image={activityAssetPathname(
        variant.authorSlug,
        variant.activitySlug,
        activity.previewImage.filename,
      )}
      sx={{ padding: 0.3, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
    />
  );
}
