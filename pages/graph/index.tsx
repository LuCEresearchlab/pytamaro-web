'use client';

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  EdgeChange,
  Handle,
  Node,
  NodeChange,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStoreApi,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DnDProvider, useDnD } from './DnDContext';
import { Button, Icon, IconButton, Paper } from '@mui/material';
import '@xyflow/react/dist/style.css';
import '../../style/graph_view.css';
import {
  Check,
  Clear,
  Fullscreen,
  FullscreenExit,
  PlayCircle,
  Refresh,
} from '@mui/icons-material';
import { node_types, Wrap } from '../../components/graph/cards';
import { getParents, turnTreeToCode } from '../../components/graph/utils';
import CardSelectionPane from '../../components/graph/CardSelectionPane';
import { JudiciousElement } from '../../src/schemas/documentation';
import {
  check_edge_looping,
  check_edge_typing,
  check_valid_graph,
} from '../../components/graph/interactivity';
import RapidPlaygroundButton from '../../components/navbar/RapidPlaygroundButton';
import { playgroundPathname } from '../../src/urlUtils';

function DefaultNode() {
  return (
    <div>
      <Handle position={Position.Top} type='source' />
      AAAAAA
      <Handle position={Position.Bottom} type='target' />
    </div>
  );
}

const initial_edges: Edge[] = [];

const initial_nodes: Node[] = [
  {
    id: '1',
    data: { module: 'pytamaro', name: 'rectangle', wrap: new Wrap() },
    position: { x: 0, y: 0 },
    type: 'function',
  },
  {
    id: '2',
    data: {
      module: 'python',
      name: 'a',
      literal_type: 'float',
      wrap: new Wrap(),
    } as any,
    position: { x: 10, y: 0 },
    type: 'literal',
  },
  {
    id: '3',
    data: {
      module: 'python',
      name: 'a',
      literal_type: 'float',
      wrap: new Wrap(),
    } as any,
    position: { x: 20, y: 0 },
    type: 'literal',
  },
];

function View() {
  const [idCounter, setIdCounter] = useState(0);
  const [fullscreen, setFullscreen] = useState(true);

  const [nodes, setNodes] = useState(initial_nodes);
  const [edges, setEdges] = useState(initial_edges);

  const { getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  const store = useStoreApi();

  const [validState, setValidState] = useState(0);
  const [code, setCode] = useState('');

  let validation_timeout: any;
  useEffect(() => {
    if (validState === 0) {
      if (validation_timeout) clearTimeout(validation_timeout);
      setTimeout(() => {
        const nodes = getNodes();
        const edges = getEdges();
        const new_state = check_valid_graph(nodes, edges) ? 1 : -1;
        if (new_state === 1) {
          const root = nodes.find(
            (v) => getParents(nodes, edges, v).size === 0,
          )!;
          const expr = turnTreeToCode(nodes, edges, root);
          setCode(expr);
        }
        return setValidState(new_state);
      }, 1000);
    }
  });

  const onNodesChange = useCallback((changes: NodeChange<any>[]) => {
    if (changes.find((v) => v.type !== 'select' && v.type !== 'position'))
      setValidState(0);
    return setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange<any>[]) => {
    if (changes.find((v) => v.type !== 'select')) setValidState(0);
    return setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    (params: any) => {
      setValidState(0);
      return setEdges((els) => addEdge(params, els));
    },
    [setEdges],
  );

  const isValidConnection = useCallback((params: Edge | Connection) => {
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
  }, []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }, []);

  const [nodeData, setNodeData]: [JudiciousElement & { module: string }, any] =
    useDnD() as any;

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!nodeData) {
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
        id: `${nodeData.name}-${Date.now()}`,
        type: nodeData.kind,
        position,
        data: {
          module: nodeData.module,
          name: nodeData.name,
          wrap: new Wrap(nodeData),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, nodeData],
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
            ...node,
            id: `${node.data?.name || node.type || 'node'}-${Date.now()}`,
            position: { x: node.position.x + dx, y: node.position.y + dy },
          };
          setNodes((eds) => eds.concat(newNode));

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

        <div
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            margin: '10px',
            zIndex: '100',
          }}
        >
          <Icon>
            {validState === -1 ? (
              <Clear color={'error'} />
            ) : validState === 0 ? (
              <Refresh />
            ) : (
              <Button
                variant='outlined'
                size='small'
                href={playgroundPathname(code)}
                target='_blank'
                endIcon={<PlayCircle />}
                sx={{ position: 'absolute', right: '0px' }}
              >
                Try it!
              </Button>
            )}
          </Icon>
        </div>

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

export default function Graph() {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <View />
      </DnDProvider>
    </ReactFlowProvider>
  );
}
