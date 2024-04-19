import {
  Box,
  Button, Modal,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { activityVariantId } from '../../src/schemas/activitySchema';
import ActivityCard from './ActivityCard';
import { ActivityNodeData } from './utils';

type NodeData = {
  activityInfo: ActivityNodeData[],
  width: number,
  height: number,
  unlocked: boolean,
  id: string,
};

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  overflow: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function OptionalActivitiesNode({ data }: NodeProps<NodeData>) {
  const { t } = useLocalTranslation(['curriculum']);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const text = t('optionalActivities');

  const {
    activityInfo, width, height, unlocked, id,
  } = data;
  return (
    <Box id={id} sx={{ cursor: unlocked ? 'auto' : 'not-allowed' }}>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Button
        onClick={handleOpen}
        variant="contained"
        color="primary"
        style={{
          width, height, overflow: 'hidden', textOverflow: 'ellipsis',
        }}
        disabled={!unlocked}
      >
        <Typography variant="h6">
          {text.toUpperCase()}
        </Typography>
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h6" textAlign="center">
            {text.toUpperCase()}
          </Typography>
          <Stack
            spacing={2}
            marginTop={2}
            direction="row"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {activityInfo.map(({
              curriculumActivity, curriculum, status, isUnlocked,
              width: awidth, height: aheight,
            }) => (
              <ActivityCard
                key={activityVariantId(curriculumActivity.variant)}
                id={`optional-${id}`}
                curriculumActivity={curriculumActivity}
                curriculum={curriculum}
                status={status}
                isUnlocked={isUnlocked}
                width={awidth}
                height={aheight}
              />
            ))}
          </Stack>
        </Box>
      </Modal>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </Box>
  );
}
