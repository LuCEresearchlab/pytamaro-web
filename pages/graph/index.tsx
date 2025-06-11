import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { useMemo, useRef, useState } from 'react';
import { DnDProvider } from './DnDContext';
import { IconButton, Paper } from '@mui/material';
import '@xyflow/react/dist/style.css';
import '../../style/graph_view.css';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';

function DefaultNode() {
  return (
    <div>
      <Handle position={Position.Top} type='source' />
      AAAAAA
      <Handle position={Position.Bottom} type='target' />
    </div>
  );
}

const initial_edges = [{ id: '1-2', source: '1', target: '2' }];

const initial_nodes = [
  {
    id: '1',
    data: { label: 'Hello' },
    position: { x: 0, y: 0 },
    type: 'default',
  },
  {
    id: '2',
    data: { label: 'World' },
    position: { x: 100, y: 100 },
    type: 'default',
  },
  {
    id: '3',
    data: { label: 'World' },
    position: { x: 100, y: 100 },
    type: 'default',
  },
  {
    id: '4',
    data: { label: 'World' },
    position: { x: 100, y: 100 },
    type: 'default',
  },
];

function View() {
  const [fullscreen, setFullscreen] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial_nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial_edges);
  const nodeTypes = useMemo(
    () => ({
      default: DefaultNode,
    }),
    [],
  );
  const ref = useRef(null);

  return (
    <Paper className={`${fullscreen ? 'fullscreen' : 'normal'} graph_view`}>
      <ReactFlow
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setFullscreen(false);
          if (e.key === 'F11') setFullscreen(true);
        }}
        ref={ref}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionStart={(e) =>
          (e.target as HTMLElement).classList.add('selected')
        }
        onSelectionEnd={(e) =>
          (e.target as HTMLElement).classList.remove('selected')
        }
        defaultEdgeOptions={{
          type: 'smoothstep',
          focusable: true,
          style: { strokeWidth: 2, stroke: '#000' },
        }}
        // onDrop={onDrop}
        // onConnect={onConnect}
        // onDragOver={onDragOver}
        // onPaneClick={onPaneClick}
        // isValidConnection={isValidConnection}
        // onReconnect={onReconnect}
        // onNodeContextMenu={onNodeContextMenu}
        // onReconnectStart={onReconnectStart}
        // onReconnectEnd={onReconnectEnd}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
      >
        {/* <Controls position={'bottom-right'} /> */}
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <IconButton
          style={{
            zIndex: '100',
            background: 'white',
            position: 'absolute',
            bottom: '0',
            right: '0',
            fontSize: '40',
          }}
          onClick={() => setFullscreen(!fullscreen)}
          onKeyDownCapture={(e) => {
            console.log(e);
          }}
        >
          {fullscreen ? (
            <FullscreenExit style={{ fontSize: '40px' }} />
          ) : (
            <Fullscreen style={{ fontSize: '40px' }} />
          )}
        </IconButton>
        {/* {menu && <Menu onClick={onPaneClick} {...(menu as any)} />} */}
      </ReactFlow>
    </Paper>
  );
}

export default function Graph() {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <View />
      </DnDProvider>
    </ReactFlowProvider>
  );
}
