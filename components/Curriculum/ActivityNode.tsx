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
import { Handle, Position, NodeProps } from 'reactflow';
import { Activity, NotebookVariant } from '../../src/Activities';
import { activityAssetPathname, activityVariantPathname } from '../../src/urlUtils';

type NodeData = {
  id: string;
  activity: Activity;
  variant: NotebookVariant;
  isCompleted: boolean;
  isUnlocked: boolean;
  width: number,
  height: number,
};

export default function ActivityNode({ data }: NodeProps<NodeData>) {
  const router = useRouter();
  const {
    id, activity, variant, isCompleted, isUnlocked, width, height,
  } = data;
  const [authorSlug, , , version] = id.split('/');

  return (
    <Box
      sx={{
        width,
        height,
        opacity: isUnlocked ? 1 : 0.3,
      }}
    >
      <Handle type="target" position={Position.Top} />
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
              variant.language,
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
              alt={variant.title}
              sx={{ padding: 1, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {variant.title}
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
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
}
