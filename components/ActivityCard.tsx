import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import {
  CheckCircleOutlineOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { activityAssetPathname, activityVariantPathname } from '../src/urlUtils';
import { Activity } from '../src/schemas/activitySchema';

export default function ActivityCard({
  id,
  activity,
  isCompleted,
  isUnlocked,
  width,
  height,
}: {
  id: string,
  activity: Activity,
  isCompleted: boolean,
  isUnlocked: boolean,
  width: number | undefined,
  height: number | undefined,
}) {
  const router = useRouter();
  const [authorSlug, , language, version] = id.split('/');
  const variant = activity.variants.find((v) => v.language === language);
  const title = variant?.title || activity.slug;

  return (
    <Box
      sx={{
        width,
        height,
        opacity: isUnlocked ? 1 : 0.3,
        position: 'relative',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%', height: '100%', padding: 1, backgroundColor: 'grey',
        }}
      >
        <Card
          sx={{
            width: '100%', height: '100%',
          }}
        >
          <CardActionArea
            onClick={() => router.push(activityVariantPathname(
              authorSlug,
              activity.slug,
              language,
              version,
            ))}
            disabled={!isUnlocked}
          >
            <CardMedia
              component="img"
              height="300"
              color="red"
              image={activityAssetPathname(
                authorSlug,
                activity.slug,
                activity.previewImage.filename,
              )}
              alt={title}
              sx={{ padding: 1, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {title}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Paper>
      {isCompleted && (
        <CheckCircleOutlineOutlined
          sx={{ margin: 1, fontSize: 100, color: 'green' }}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
          }}
        />
      )}
    </Box>
  );
}
