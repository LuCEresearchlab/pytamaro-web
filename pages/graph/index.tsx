'use client';

import {
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
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

  const { getNodes, getEdges, screenToFlowPosition, flowToScreenPosition } =
    useReactFlow();

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

      const topLeftPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${dragged.type}-${Date.now()}`,
        type: dragged.type,
        position: topLeftPosition,
        data: dragged.data,
        dragHandle: '.drag-handle',
        className: 'node_hidden',
      };

      setNodes(nodes.concat(newNode));

      setTimeout(() => {
        const newNodes = getNodes();
        setNodes(
          newNodes.map((v) =>
            v.id === newNode.id
              ? {
                  ...v,
                  position: {
                    x: v.position.x - (v.measured?.width || 0) / 2,
                    y: v.position.y - (v.measured?.height || 0) / 2,
                  },
                  className: '',
                }
              : v,
          ),
        );
      });
    },
    [screenToFlowPosition, dragged, nodes, setNodes],
  );

  const nodeTypes = useMemo(() => node_types, []);
  const clickedRef = useRef(-1);
  const [isSelecting, setIsSelecting] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    is_dragging: false,
  });

  return (
    <Paper className={`${fullscreen ? 'fullscreen' : 'normal'} graph_view `}>
      <ReactFlow
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setFullscreen(false);
          if (e.key === 'F11') setFullscreen(true);
          if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            setNodes(getNodes().map((v) => ({ ...v, selected: true })));
          }
        }}
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
        onMouseDown={(e) => {
          if (e.ctrlKey) {
            setIsSelecting({
              is_dragging: true,
              width: 0,
              height: 0,
              ...screenToFlowPosition({ x: e.clientX, y: e.clientY }),
            });
          }
        }}
        onMouseUp={() => {
          const min_point = {
            x: Math.min(isSelecting.x, isSelecting.x + isSelecting.width),
            y: Math.min(isSelecting.y, isSelecting.y + isSelecting.height),
          };
          const max_point = {
            x: Math.max(isSelecting.x, isSelecting.x + isSelecting.width),
            y: Math.max(isSelecting.y, isSelecting.y + isSelecting.height),
          };

          const x_0 = min_point.x;
          const y_0 = min_point.y;
          const x_1 = max_point.x;
          const y_1 = max_point.y;

          setIsSelecting({
            is_dragging: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          });

          function rectanglesIntersect(
            minBx: number,
            minBy: number,
            maxBx: number,
            maxBy: number,
          ) {
            const aLeftOfB: boolean = x_1 < minBx;
            const aRightOfB: boolean = x_0 > maxBx;
            const aAboveB: boolean = y_0 > maxBy;
            const aBelowB: boolean = y_1 < minBy;

            return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
          }

          setTimeout(
            () =>
              setNodes(
                getNodes().map((v) => {
                  if (!v.measured) return v;
                  const v_x = v.position.x;
                  const v_y = v.position.y;
                  const v2_x = v_x + v.measured.width!;
                  const v2_y = v_y + v.measured.height!;

                  const isInRectangle = rectanglesIntersect(
                    v_x,
                    v_y,
                    v2_x,
                    v2_y,
                  );
                  const newNode = {
                    ...v,
                    selected: v.selected || isInRectangle,
                  };
                  return newNode;
                }),
              ),
            20,
          );
        }}
        onMouseMove={(e) => {
          if (isSelecting.is_dragging) {
            const real_point = screenToFlowPosition({
              x: e.clientX,
              y: e.clientY,
            });

            setIsSelecting({
              is_dragging: true,
              x: isSelecting.x,
              y: isSelecting.y,
              width: real_point.x - isSelecting.x,
              height: real_point.y - isSelecting.y,
            });
          }
        }}
        onNodeClick={(e, n) => {
          if (!n.selected) clickedRef.current = new Date().getTime();
        }}
        onNodeDoubleClick={(e, node) => {
          console.log(new Date().getTime() - clickedRef.current);
          if (!node.selected || new Date().getTime() - clickedRef.current < 300)
            return;

          const angle = Math.random() * Math.PI * 2;

          const dx = Math.cos(angle) * 10;
          const dy = Math.sin(angle) * 10;

          const newNode = {
            type: node.type,
            data: { ...node.data, expression: undefined },
            id: `${node.data?.name || node.type || 'node'}-${Date.now()}`,
            position: { x: node.position.x + dx, y: node.position.y + dy },
            selected: true,
          };
          setNodes(
            nodes
              .map((v) => (v.id === node.id ? { ...node, selected: false } : v))
              .concat(newNode),
          );
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

        {
          <div
            style={(() => {
              const { x, y } = flowToScreenPosition({
                x: isSelecting.x,
                y: isSelecting.y,
              });

              const { x: x2, y: y2 } = flowToScreenPosition({
                x: isSelecting.x + isSelecting.width,
                y: isSelecting.y + isSelecting.height,
              });

              const min_point = { x: Math.min(x, x2), y: Math.min(y, y2) };
              const max_point = { x: Math.max(x, x2), y: Math.max(y, y2) };

              const width = Math.abs(max_point.x - min_point.x);
              const height = Math.abs(max_point.y - min_point.y);

              return {
                position: 'absolute',
                backgroundColor: 'lightblue',
                left: min_point.x,
                top: min_point.y,
                width: width,
                height: height,
                opacity: '40%',
              };
            })()}
          ></div>
        }
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
