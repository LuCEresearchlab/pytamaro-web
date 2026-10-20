import { Button, IconButton, Input } from '@mui/material';
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
import { useReactFlow } from '@xyflow/react';
import { saveAs } from 'file-saver';
import { useConfirm } from 'material-ui-confirm';
import { useState } from 'react';
import { parseGraphFile, serializeGraphFile } from '../../src/tide/graphFile';
import { useStore } from '../../src/tide/store';
import CustomSnackbar from '../CustomSnackbar';

function exportFileName() {
  const now = new Date();
  const pad = (value: number) => `${value}`.padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `tide-export-${date}-${time}.json`;
}

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
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const [importSuccessVisible, setImportSuccessVisible] = useState(false);

  const { setNodes, setEdges, getNodes, getEdges, setFullscreen, fullscreen } =
    useStore();
  const { fitView } = useReactFlow();
  const confirm = useConfirm();

  const handleReset = () => {
    confirm({
      title: 'Are you sure?',
      description:
        'You are about to delete everything, including all the cards you have added. This action cannot be undone! ⚠️',
      confirmationText: 'OK, delete everything',
      cancellationText: 'Cancel',
    }).then(({ confirmed }) => {
      if (confirmed) {
        setNodes([]);
        setEdges([]);
      }
    });
  };

  return (
    <>
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
                  const input = e.target as HTMLInputElement;
                  const file = input.files?.[0];
                  // Reset the input so that picking the same file again
                  // triggers a change event
                  input.value = '';
                  if (!file) return;

                  const reader = new FileReader();

                  reader.onload = (e) => {
                    const content = e.target?.result;
                    if (typeof content !== 'string') {
                      setImportError('Could not read the file.');
                      return;
                    }
                    const graph = parseGraphFile(content);
                    if (!graph) {
                      setImportError(
                        'This file is not a valid TIDE export. Please select a file exported from TIDE.',
                      );
                      return;
                    }
                    setNodes(graph.nodes);
                    setEdges(graph.edges);
                    setImportSuccessVisible(true);
                  };
                  reader.onerror = () => {
                    setImportError('Could not read the file.');
                  };
                  reader.readAsText(file);
                }}
              />
            </Button>
          </div>
          <div className='item'>
            <Button
              onClick={() => {
                const blob = new Blob(
                  [serializeGraphFile(getNodes(), getEdges())],
                  {
                    type: 'application/json',
                  },
                );
                saveAs(blob, exportFileName());
              }}
            >
              Export <Download />
            </Button>
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
            <IconButton size='large' onClick={handleReset}>
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
            backgroundColor: theme.pytamaro.palette.background.default,
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
      <CustomSnackbar
        visible={importError !== undefined}
        setVisible={() => setImportError(undefined)}
        severity='error'
        message={importError ?? ''}
      />
      <CustomSnackbar
        visible={importSuccessVisible}
        setVisible={setImportSuccessVisible}
        severity='success'
        message='Import completed successfully!'
      />
    </>
  );
}
