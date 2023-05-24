import { CardMedia } from '@mui/material';
import { Activity, ActivityVariant } from '../src/schemas/activitySchema';
import { activityAssetPathname } from '../src/urlUtils';

export default function CompactActivityVariantCard({ activity, variant } :
{ activity: Activity, variant: ActivityVariant }) {
  return (
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
  );
}
