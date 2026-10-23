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
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
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
  const { t } = useLocalTranslation(['tide']);
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const [importSuccessVisible, setImportSuccessVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    setNodes,
    setEdges,
    getNodes,
    getEdges,
    setFullscreen,
    fullscreen,
    asSingleChange,
  } = useStore();
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
        setImportError(t('graphOptions.importReadError'));
        return;
      }
      const graph = parseGraphFile(content);
      if (!graph) {
        setImportError(t('graphOptions.importInvalidFile'));
        return;
      }
      asSingleChange(() => {
        // Start from an empty graph, so that no node or edge from the
        // current graph is left around while importing the new one.
        setNodes([]);
        setEdges([]);
        setNodes(graph.nodes);
        setEdges(graph.edges);
      });
      setImportSuccessVisible(true);
    };
    reader.onerror = () => {
      setImportError(t('graphOptions.importReadError'));
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
      title: t('graphOptions.resetConfirmTitle'),
      description: t('graphOptions.resetConfirmDescription'),
      confirmationText: t('graphOptions.resetConfirm'),
      cancellationText: t('graphOptions.cancel'),
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
          <Tooltip
            arrow
            title={t('graphOptions.importFromFile')}
            placement='left'
          >
            <IconButton
              className='item'
              size='large'
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload />
            </IconButton>
          </Tooltip>
          <Tooltip
            arrow
            title={t('graphOptions.exportToFile')}
            placement='left'
          >
            <IconButton className='item' size='large' onClick={handleExport}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip
            arrow
            title={
              fullscreen
                ? t('graphOptions.exitFullscreen')
                : t('graphOptions.showFullscreen')
            }
            placement='left'
          >
            <IconButton
              className='item'
              size='large'
              aria-label={
                fullscreen
                  ? t('graphOptions.exitFullscreen')
                  : t('graphOptions.showFullscreen')
              }
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Tooltip
            arrow
            title={t('graphOptions.centerOnScreen')}
            placement='left'
          >
            <IconButton
              className='item'
              size='large'
              aria-label={t('graphOptions.centerOnScreen')}
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
          <Tooltip arrow title={t('graphOptions.resetTide')} placement='left'>
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
        message={t('graphOptions.importSuccess')}
      />
    </>
  );
}
