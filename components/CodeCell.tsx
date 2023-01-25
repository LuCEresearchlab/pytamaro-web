import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTheme, styled } from '@mui/material/styles';
import {
  Card, CardActions, CardContent, Collapse, IconButton, Paper,
  Container,
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButtonProps } from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DoneIcon from '@mui/icons-material/Done';
import OutputArea from './OutputArea';

const AceEditor = dynamic(
  async () => {
    const ace = await import('react-ace');
    await import('ace-builds/src-noconflict/mode-python');
    await import('ace-builds/src-noconflict/theme-github');
    await import('ace-builds/src-noconflict/ext-language_tools');
    return ace;
  },
  {
    ssr: false,
  },
);

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function CodeCell({ source, onSourceChanged, compile }:
{ source: string, onSourceChanged: (newSource: string) => void, compile: () => Promise<any> }) {
  const theme = useTheme();
  const [executionResponse, setExecutionResponse] = useState<any>(undefined);
  const [showOutputArea, setShowOutputArea] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const outputAreaBgColor = theme.palette.grey[executionResponse?.type === 'error' ? 400 : 100];
  const executeCode = async () => {
    setExecuting(true);
    const response = await compile();
    setExecutionResponse(response);
    setExecuting(false);
    setExecuted(true);
    if (response.content.length > 0) {
      setShowOutputArea(true);
    }
  };
  const handleShowOutputArea = () => {
    setShowOutputArea(!showOutputArea);
  };
  return (
    <Container maxWidth="md" sx={{ mb: 2 }}>
      <Paper elevation={8}>
        <Card>
          <CardContent>
            <AceEditor
              mode="python"
              theme="xcode"
              defaultValue={source}
              onChange={(newSource: string) => { setExecuted(false); onSourceChanged(newSource); }}
              maxLines={Infinity}
              fontSize={theme.typography.fontSize}
              width="100%"
              showPrintMargin={false}
              showGutter={false}
              highlightActiveLine={false}
            />
          </CardContent>
          <CardActions disableSpacing sx={{ padding: 2, display: 'flex' }}>
            <LoadingButton
              onClick={executeCode}
              endIcon={<PlayCircleFilledIcon />}
              loading={executing}
              loadingPosition="end"
              variant="contained"
              sx={{ marginRight: 2 }}
            >
              <span>Run</span>
            </LoadingButton>
            <DoneIcon color="success" fontSize="large" sx={{ visibility: executed ? 'visible' : 'hidden' }} />
            <ExpandMore
              expand={showOutputArea}
              onClick={handleShowOutputArea}
              aria-expanded={showOutputArea}
              aria-label="show output area"
              sx={{ visibility: executionResponse ? 'visible' : 'hidden' }}
            >
              <ExpandMoreIcon fontSize="large" />
            </ExpandMore>
          </CardActions>
          <Collapse in={showOutputArea} timeout="auto" unmountOnExit>
            <CardContent>
              <Card sx={{ backgroundColor: outputAreaBgColor, p: 2 }}>
                {executionResponse
                                    && <OutputArea executionResponse={executionResponse} />}
              </Card>
            </CardContent>
          </Collapse>
        </Card>
      </Paper>

    </Container>
  );
}
