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
import {
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Icon, IconButton, Paper } from '@mui/material';
import '@xyflow/react/dist/style.css';
import '../../style/graph_view.css';
import {
  Clear,
  Fullscreen,
  FullscreenExit,
  PlayCircle,
  Refresh,
} from '@mui/icons-material';
import { node_types } from '../../components/graph/cards';
import { reassignExpression } from '../../components/graph/utils';
import CardSelectionPane from '../../components/graph/CardSelectionPane';
import {
  check_edge_looping,
  check_edge_typing,
} from '../../components/graph/interactivity';
import { playgroundPathname } from '../../src/urlUtils';
import { appWithTranslation } from 'next-i18next';
import { I18nextProvider } from 'react-i18next';

// const initial_edges: Edge[] = [];

// const initial_nodes: Node[] = [
//   {
//     id: '1',
//     data: { module: 'pytamaro', name: 'rectangle', wrap: new Wrap() },
//     position: { x: 0, y: 0 },
//     type: 'function',
//   },
//   {
//     id: '2',
//     data: {
//       module: 'python',
//       name: 'a',
//       literal_type: 'float',
//       wrap: new Wrap(),
//     },
//     position: { x: 10, y: 0 },
//     type: 'literal',
//   },
//   {
//     id: '3',
//     data: {
//       module: 'python',
//       name: 'a',
//       literal_type: 'float',
//       wrap: new Wrap(),
//     },
//     position: { x: 20, y: 0 },
//     type: 'literal',
//   },
// ];

function View() {
  const [fullscreen, setFullscreen] = useState(true);

  const { getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  const store = useStoreApi();

  const [validState, setValidState] = useState(0);
  const [code] = useState('');

  let validation_timeout: NodeJS.Timeout | undefined;
  useEffect(() => {
    if (validState === 0) {
      if (validation_timeout) clearTimeout(validation_timeout);
      setTimeout(() => {
        const nodes = getNodes();
        const edges = getEdges();

        const cleared_nodes = nodes
          .filter((v) => v.data.expression)
          .map((v) => ({
            ...v,
            data: { ...v, expression: undefined },
          }));

        reassignExpression(cleared_nodes, edges);
        // nodes
        //   .filter((v) => v.type === 'function')
        //   .map((v) => v.data)
        //   .forEach((v: any) => {
        //     v.expression =
        //       'from pytamaro import *\nshow_graphic(rectangle(100, 20, red))';
        //   });

        setNodes(cleared_nodes);
        setValidState(1);

        // const new_state = check_valid_graph(nodes, edges) ? 1 : -1;
        // if (new_state === 1) {
        //   const root = nodes.find(
        //     (v) => getParents(nodes, edges, v).size === 0,
        //   )!;
        //   const expr = turnTreeToCode(nodes, edges, root);
        //   setCode(expr);
        // }
        // return setValidState(new_state);
      }, 1000);
    }
  });

  const {
    edges,
    nodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    dragged,
    setNodes,
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
