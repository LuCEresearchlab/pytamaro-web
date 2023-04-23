import {
  Card, CardActionArea, CardMedia, Paper,
} from '@mui/material';
import { useRouter } from 'next/router';
import { Handle, Position, NodeProps } from 'reactflow';
import { Activity, NotebookVariant } from '../src/Activities';
import { activityAssetPathname, activityVariantPathname } from '../src/urlUtils';

type NodeData = {
  authorSlug: string;
  activity: Activity;
  variant: NotebookVariant;
  isCompleted: boolean;
  isAvailable: boolean;
};

export default function ActivityNode({ data }: NodeProps<NodeData>) {
  const router = useRouter();
  const {
    authorSlug, activity, variant, isCompleted, isAvailable,
  } = data;
  const isDraft = activity.visibility === 'draft' || !isAvailable;
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>
        <Paper elevation={8}>
          <Card>
            <CardActionArea
              onClick={() => router.push(activityVariantPathname(
                authorSlug,
                activity.slug,
                variant.language,
                variant.latestVersion,
              ))}
              disabled={isDraft}
            >
              <CardMedia
                component="img"
                height="300"
                image={activityAssetPathname(
                  authorSlug,
                  activity.slug,
                  activity.previewImage.filename,
                )}
                alt={variant.title}
                sx={{ padding: 1, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
              />
            </CardActionArea>
          </Card>
        </Paper>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
