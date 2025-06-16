'use client';

import {
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStoreApi,
} from '@xyflow/react';
import { DragEvent, useCallback, useMemo, useRef, useState } from 'react';
import { IconButton, Paper } from '@mui/material';
import '@xyflow/react/dist/style.css';
import '../../style/graph_view.css';
import { Delete, Fullscreen, FullscreenExit } from '@mui/icons-material';
import { node_types } from '../../components/graph/cards';
import CardSelectionPane from '../../components/graph/CardSelectionPane';
import {
  check_edge_looping,
  check_edge_typing,
} from '../../components/graph/interactivity';
import { appWithTranslation } from 'next-i18next';
import { I18nextProvider } from 'react-i18next';

function View() {
  const [fullscreen, setFullscreen] = useState(true);

  const { getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  const store = useStoreApi();

  const {
    edges,
    nodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    dragged,
    setNodes,
    setEdges,
  } = useStore((state) => state);

  const isValidConnection = useCallback(
    (params: Edge | Connection) => {
      if (typeof window === 'undefined') return false;
      const nodes = getNodes();
      const edges = getEdges();
      const source = params.source;
      const sourceHandle = params.sourceHandle || '';
      const target = params.target;
      const targetHandle = params.targetHandle || '';

      return (
        check_edge_typing(nodes, source, sourceHandle, target, targetHandle) &&
        check_edge_looping(nodes, edges, source, target)
      );
    },
    [getNodes, getEdges],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer!.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!dragged) {
        return;
      }

      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${dragged.type}-${Date.now()}`,
        type: dragged.type,
        position,
        data: dragged.data,
        dragHandle: '.drag-handle',
      };

      setNodes(nodes.concat(newNode));
    },
    [screenToFlowPosition, dragged, nodes, setNodes],
  );

  const nodeTypes = useMemo(() => node_types, []);
  const ref = useRef(null);

  return (
    <Paper className={`${fullscreen ? 'fullscreen' : 'normal'} graph_view `}>
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
        onConnect={onConnect}
        defaultEdgeOptions={{
          type: 'smoothstep',
          focusable: true,
          style: {
            strokeWidth: 2,
            stroke: '#000',
          },
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        isValidConnection={isValidConnection}
        onNodeDoubleClick={(e, node) => {
          if (!node.selected) return;

          const angle = Math.random() * Math.PI * 2;

          const dx = Math.cos(angle) * 10;
          const dy = Math.sin(angle) * 10;

          const { addSelectedNodes } = store.getState();
          const newNode = {
            type: node.type,
            data: { ...node.data, expression: undefined },
            id: `${node.data?.name || node.type || 'node'}-${Date.now()}`,
            position: { x: node.position.x + dx, y: node.position.y + dy },
          };
          setNodes(nodes.concat(newNode));

          addSelectedNodes([newNode.id]);
        }}
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
        >
          {fullscreen ? (
            <FullscreenExit style={{ fontSize: '40px' }} />
          ) : (
            <Fullscreen style={{ fontSize: '40px' }} />
          )}
        </IconButton>

        <IconButton
          style={{
            zIndex: '100',
            background: 'white',
            borderRadius: '5px',
            position: 'absolute',
            bottom: '0',
            left: '0',
          }}
          size='large'
          onClick={() => {
            setNodes([]);
            setEdges([]);
          }}
        >
          <Delete />
        </IconButton>

        <div
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            margin: '10px',
            zIndex: '100',
          }}
        >
          <CardSelectionPane />
        </div>
        {/* {menu && <Menu onClick={onPaneClick} {...(menu as any)} />} */}
      </ReactFlow>
    </Paper>
  );
}

import i18next from 'i18next';
import { useStore } from '../../components/graph/store';

function Graph() {
  return (
    <I18nextProvider i18n={i18next}>
      <ReactFlowProvider>
        <View />
      </ReactFlowProvider>
    </I18nextProvider>
  );
}

export default appWithTranslation(Graph);
