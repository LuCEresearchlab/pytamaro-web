import dynamic from 'next/dynamic';
import { useState } from 'react';
import axios from 'axios';
import { useTheme, styled } from '@mui/material/styles';
import {
  Card, CardActions, CardContent, Collapse, IconButton, Paper,
  Container,
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButtonProps } from '@mui/material/IconButton';
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

export default function CodeCell({ source, kernelId }: { source: string, kernelId: string }) {
  const theme = useTheme();
  const [editorSource, setEditorSource] = useState(source);
  const [executionResponse, setExecutionResponse] = useState<any>(undefined);
  const [showOutputArea, setShowOutputArea] = useState(false);
  const outputAreaBgColor = theme.palette.grey[executionResponse?.type === 'error' ? 400 : 100];
  const executeCode = async () => {
    const response = (await axios.post('/api/execute', { code: editorSource, kernelId })).data;
    setExecutionResponse(response);
    setShowOutputArea(true);
  };
  const handleShowOutputArea = () => {
    setShowOutputArea(!showOutputArea);
  };
  return (
    <Container maxWidth="md">
      <Paper elevation={8}>
        <Card>
          <CardContent>
            <AceEditor
              mode="python"
              theme="github"
              defaultValue={editorSource}
              onChange={setEditorSource}
              maxLines={Infinity}
              fontSize={theme.typography.fontSize}
              width="100%"
              showPrintMargin={false}
              showGutter={false}
              highlightActiveLine={false}
            />
          </CardContent>
          <CardActions disableSpacing sx={{ pt: 0 }}>
            <IconButton
              aria-label="execute code"
              onClick={executeCode}
            >
              <PlayCircleFilledIcon fontSize="large" color="primary" />
            </IconButton>
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
