import { CardMedia } from '@mui/material';
import { ActivityVariant, BasicActivity } from '../src/schemas/activitySchema';
import { activityAssetPathname } from '../src/urlUtils';

export default function CompactActivityVariantCard({ activity, variant, height = '100rem' } :
{ activity: BasicActivity, variant: ActivityVariant, height?: string }) {
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
