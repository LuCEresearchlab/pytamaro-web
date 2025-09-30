import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  TextField,
} from '@mui/material';
import Image from 'next/image';

import PytamaroLogo from '../../public/PyTamaroLogo.png';
import theme from '../../src/theme';

import {
  CenterFocusStrong,
  Delete,
  Download,
  Fullscreen,
  FullscreenExit,
  Upload,
} from '@mui/icons-material';
import { Edge, useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { useStore } from '../../src/tide/store';
import { TideNode } from './cards';

export function GraphOptionsIcon(props: { onClick: () => void }) {
  return (
    <button
      className='graph_options_icon'
      style={{
        backgroundColor: 'transparent',
        position: 'relative',
        border: 'none',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'start',
        justifyContent: 'center',
        padding: '20px',
      }}
      tabIndex={1}
      onClick={props.onClick}
    >
      <div>
        <Image width={28} alt='Graph Options' src={PytamaroLogo} />
        <p
          style={{
            margin: '0',
            fontWeight: 'bold',
            fontSize: '10px',
          }}
        >
          PyTamaro
        </p>
      </div>
    </button>
  );
}

export function GraphOptions() {
  const [collapsed, setCollapsed] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const { setNodes, setEdges, getNodes, getEdges, setFullscreen, fullscreen } =
    useStore();
  const { fitView } = useReactFlow();

  return (
    <div
      className='graph_options'
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        gridTemplateRows: 'auto auto',
        justifyItems: 'stretch',
        alignContent: 'stretch',
      }}
    >
      <div />
      <div
        className='column-container'
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 1s',
          alignSelf: 'end',
          alignItems: 'end',
          transform: collapsed ? '' : 'translateY(150%)',
          marginLeft: '20px',
        }}
      >
        <div className='item'>
          <Button itemType='file' component='label' role={undefined}>
            Import <Upload />
            <Input
              type='file'
              style={{
                clip: 'rect(0 0 0 0)',
                clipPath: 'inset(50%)',
                height: 1,
                overflow: 'hidden',
                position: 'absolute',
                bottom: 0,
                left: 0,
                whiteSpace: 'nowrap',
                width: 1,
              }}
              onChange={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const file = (e.target as any).files[0] as File;

                const reader = new FileReader();

                reader.onload = (e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const content = JSON.parse((e as any).target.result) as {
                    nodes: TideNode[];
                    edges: Edge[];
                  };
                  setNodes(content.nodes);
                  setEdges(content.edges);
                };
                reader.readAsText(file);
              }}
            />
          </Button>
        </div>
        <div className='item'>
          <Button onClick={() => setDownloadModalOpen(true)}>
            Export <Download />
          </Button>

          <Dialog
            open={downloadModalOpen}
            onClose={() => setDownloadModalOpen(false)}
            slotProps={{
              paper: {
                component: 'form',
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  const formJson = Object.fromEntries(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (formData as any).entries(),
                  );

                  const { file_name }: { file_name: string } =
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formJson as any;

                  const link = document.createElement('a');
                  link.download = `${file_name.replaceAll(' ', '_')}.json`;
                  link.href = URL.createObjectURL(
                    new Blob(
                      [
                        JSON.stringify({
                          nodes: getNodes(),
                          edges: getEdges(),
                        }),
                      ],
                      {
                        type: 'text/plain',
                      },
                    ),
                  );
                  link.click();
                  setDownloadModalOpen(false);
                  URL.revokeObjectURL(link.href);
                },
              },
            }}
          >
            <DialogTitle>Download</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                required
                margin='dense'
                id='file_name'
                name='file_name'
                label='File Name'
                type='text'
                fullWidth
                variant='standard'
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDownloadModalOpen(false)}>
                Cancel
              </Button>
              <Button type='submit'>Download</Button>
            </DialogActions>
          </Dialog>
        </div>

        <div className='item'>
          <Button onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? (
              <>
                Exit Fullscreen
                <FullscreenExit />
              </>
            ) : (
              <>
                Fullscreen
                <Fullscreen />
              </>
            )}
          </Button>
        </div>
      </div>

      <div
        className='row-container'
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          transform: collapsed ? '' : 'translateX(150%)',
          transition: 'transform 1s',
          alignSelf: 'end',
          alignItems: 'end',
          marginTop: '20px',
        }}
      >
        <div className='item red'>
          <IconButton
            size='large'
            onClick={() => {
              setNodes([]);
              setEdges([]);
            }}
          >
            <Delete />
          </IconButton>
        </div>
        <div className='item'>
          <IconButton
            size='large'
            onClick={() => {
              fitView({
                duration: 1,
                padding: 0.1,
              });
            }}
          >
            <CenterFocusStrong />
          </IconButton>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          flexGrow: '1',
          display: 'flex',
          flexDirection: 'row',
          justifyItems: 'start',
          alignItems: 'center',
          backgroundColor: theme.pytamaro.backgroundColor,
          border: 'solid gray 1px',
          width: '100%',
          borderRadius: '20px 0% 0% 0%',
          userSelect: 'none',
          borderBottom: '0px',
          borderRight: '0px',
          zIndex: '1',
        }}
      >
        <GraphOptionsIcon onClick={() => setCollapsed(!collapsed)} />
      </div>
    </div>
  );
}
