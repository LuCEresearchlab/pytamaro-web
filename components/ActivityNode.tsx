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
  Block,
  CheckCircle,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Handle, Position, NodeProps } from 'reactflow';
import { Activity, NotebookVariant } from '../src/Activities';
import { activityAssetPathname, activityVariantPathname } from '../src/urlUtils';

type NodeData = {
  id: string;
  activity: Activity;
  variant: NotebookVariant;
  isCompleted: boolean;
  isUnlocked: boolean;
};

export default function ActivityNode({ data }: NodeProps<NodeData>) {
  const router = useRouter();
  const {
    id, activity, variant, isCompleted, isUnlocked,
  } = data;
  const [authorSlug, , , version] = id.split('/');

  function getBackgroundColor() {
    if (isCompleted) {
      return 'green';
    }
    if (isUnlocked) {
      return 'yellow';
    }
    return 'red';
  }

  return (
    <Box style={{
      width: 400,
    }}
    >
      <Handle type="target" position={Position.Top} />
      <Paper elevation={8} sx={{ padding: 1, backgroundColor: getBackgroundColor() }}>
        <Card>
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
                {!isUnlocked
                    && (
                    <Block
                      sx={{ marginLeft: 1, color: 'red' }}
                    />
                    )}
                {isCompleted
                    && (
                    <CheckCircle
                      sx={{ marginLeft: 1, color: 'green' }}
                    />
                    )}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Paper>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
}
