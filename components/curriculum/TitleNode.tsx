import { AssignmentTurnedIn, PlayCircle } from '@mui/icons-material';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { slug } from 'github-slugger';
import { Handle, NodeProps, Position } from 'reactflow';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';

type NodeData = {
  type: 'unit' | 'start' | 'end';
  text: string;
  width: number;
  height: number;
  unlocked: boolean;
  id: string;
  started?: boolean;
  onStartClick?: () => void;
  onEndClick?: () => void;
};

export default function TitleNode({ data }: NodeProps<NodeData>) {
  const {
    type,
    text,
    width,
    height,
    unlocked,
    started,
    onStartClick,
    onEndClick,
    id,
  } = data;
  const showStartingButton = type === 'start' && !started;
  const showFinishButton = type === 'end' && unlocked;
  const { t } = useLocalTranslation(['curriculum']);
  return (
    <Box id={id} sx={{ opacity: unlocked ? 1 : 0.38 }}>
      <Handle type='target' position={Position.Top} isConnectable={false} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width,
          height,
          overflow: 'initial !important',
          textOverflow: 'ellipsis',
          backgroundColor: type === 'unit' ? '#aed9e7' : 'transparent',
        }}
        className={type === 'unit' ? 'curriculum-unit' : undefined}
        id={slug(text)}
      >
        {/* eslint-disable-next-line no-nested-ternary */}
        {showStartingButton || showFinishButton ? (
          <Tooltip
            arrow
            title={t(`clickTo${showStartingButton ? 'Start' : 'Finish'}`)}
            placement='top'
          >
            <Button
              variant='contained'
              color='success'
              onClick={showStartingButton ? onStartClick : onEndClick}
              startIcon={
                showStartingButton ? <PlayCircle /> : <AssignmentTurnedIn />
              }
            >
              {t(text.toLowerCase())}
            </Button>
          </Tooltip>
        ) : type === 'unit' ? (
          <Typography variant='h5' textAlign='center' noWrap>
            {text}
          </Typography>
        ) : (
          <Typography
            variant='h6'
            textTransform='uppercase'
            letterSpacing='.08rem'
            textAlign='center'
            noWrap
          >
            {t(text.toLowerCase())}
          </Typography>
        )}
      </Box>
      <Handle type='source' position={Position.Bottom} isConnectable={false} />
    </Box>
  );
}
