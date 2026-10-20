import {
  CenterFocusStrong,
  Delete,
  Download,
  Fullscreen,
  FullscreenExit,
  Upload,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useReactFlow } from '@xyflow/react';
import { saveAs } from 'file-saver';
import { useConfirm } from 'material-ui-confirm';
import { ChangeEvent, useRef, useState } from 'react';
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

export function GraphOptions() {
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const [importSuccessVisible, setImportSuccessVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setNodes, setEdges, getNodes, getEdges, setFullscreen, fullscreen } =
    useStore();
  const { fitView } = useReactFlow();
  const confirm = useConfirm();

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
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
  };

  const handleExport = () => {
    const blob = new Blob([serializeGraphFile(getNodes(), getEdges())], {
      type: 'application/json',
    });
    saveAs(blob, exportFileName());
  };

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
      <div className='graph_options'>
        <div className='items-container'>
          <Tooltip arrow title='Import from a file' placement='left'>
            <IconButton
              className='item'
              size='large'
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title='Export to a file' placement='left'>
            <IconButton className='item' size='large' onClick={handleExport}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip
            arrow
            title={fullscreen ? 'Exit fullscreen' : 'Show TIDE in fullscreen'}
            placement='left'
          >
            <IconButton
              className='item'
              size='large'
              aria-label={
                fullscreen ? 'Exit fullscreen' : 'Show TIDE in fullscreen'
              }
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Tooltip arrow title='Center on the screen' placement='left'>
            <IconButton
              className='item'
              size='large'
              aria-label='Center on the screen'
              onClick={() => {
                fitView({
                  duration: 1,
                  padding: 0.1,
                });
              }}
            >
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title='Reset TIDE' placement='left'>
            <IconButton className='item' size='large' onClick={handleReset}>
              <Delete />
            </IconButton>
          </Tooltip>
        </div>
        <input
          ref={fileInputRef}
          type='file'
          style={{ display: 'none' }}
          onChange={handleImport}
        />
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
