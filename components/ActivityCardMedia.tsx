import { CardMedia } from '@mui/material';
import { ActivityVariant, BasicActivity } from '../src/schemas/activitySchema';
import { activityAssetPathname } from '../src/urlUtils';

export default function ActivityCardMedia({
  activity,
  variant,
  height = '100rem',
  padding = 0.3,
}: {
  activity: BasicActivity;
  variant: ActivityVariant;
  height?: string;
  padding?: number;
}) {
  return (
    <CardMedia
      component='img'
      height={height}
      image={activityAssetPathname(
        variant.authorSlug,
        variant.activitySlug,
        activity.previewImage.filename,
      )}
      sx={{
        padding,
        objectFit: 'contain',
        backgroundColor: activity.previewImage.backgroundColor,
      }}
      // Suppress hydration warning: on the homepage, the images are shuffled,
      // leading to mismatch between the server and the hydrated versions
      suppressHydrationWarning={true}
    />
  );
}
