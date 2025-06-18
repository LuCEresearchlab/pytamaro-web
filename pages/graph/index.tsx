'use client';

import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import {
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconButton, Paper } from '@mui/material';
import '@xyflow/react/dist/style.css';
import '../../style/graph_view.css';
import {
  Delete,
  Error,
  Fullscreen,
  FullscreenExit,
  RemoveRedEye,
} from '@mui/icons-material';
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
  const [errorPane, setErrorPane] = useState(false);

  const {
    getNodes,
    getEdges,
    screenToFlowPosition,
    flowToScreenPosition,
    fitView,
  } = useReactFlow();

  const {
    edges,
    nodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    dragged,
    setNodes,
    setEdges,
    revertLastChange,
    redoChange,
    getErrors,
    error_level,
  } = useStore((state) => state);

  useEffect(() => {
    if (getErrors().length === 0) setErrorPane(false);
  }, [edges, getErrors, nodes]);

  const isValidConnection = useCallback(
    (params: Edge | Connection) => {
      if (typeof window === 'undefined') return false;
      const nodes = getNodes();
      const edges = getEdges();
      const source = params.source;
      const target = params.target;

      const sourceHandle = params.sourceHandle || '';
      const targetHandle = params.targetHandle || '';

      return (
        check_edge_looping(nodes, edges, source, target) &&
        (error_level !== 'prevent' ||
          check_edge_typing(nodes, source, sourceHandle, target, targetHandle))
      );
    },
    [getNodes, getEdges, error_level],
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
    [dragged, screenToFlowPosition, setNodes, nodes, getNodes],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      {
        if (e.key === 'Escape') setFullscreen(false);
        if (e.key === 'F11') setFullscreen(true);
        if (e.ctrlKey && e.key === 'a') {
          e.preventDefault();
          setNodes(getNodes().map((v) => ({ ...v, selected: true })));
        }

        if (e.ctrlKey && e.key === 'Z' && e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          redoChange();
        } else if (e.ctrlKey && e.key === 'z') {
          e.preventDefault();
          revertLastChange();
          e.stopPropagation();
        }
      }
    },
    [getNodes, redoChange, revertLastChange, setNodes],
  );

  interface FlowChartClipboardData {
    nodes: Node[];
    edges: Edge[];
  }

  const mousePosition = useRef({ x: 0, y: 0 });

  const onCopyCatpure = useCallback(
    (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.clipboardData?.clearData();

      const selected = {
        nodes: getNodes().filter((v) => v.selected),
        edges: getEdges().filter((v) => v.selected),
      };

      e.clipboardData?.setData('flowchart:graph', JSON.stringify(selected));
    },
    [getEdges, getNodes],
  );

  const onPasteCatpure = useCallback(
    (e: ClipboardEvent) => {
      const paste = e.clipboardData?.getData('flowchart:graph');

      if (!paste) return;

      const unsafe_data = JSON.parse(paste);

      if (
        !unsafe_data.nodes ||
        !unsafe_data.edges ||
        !(unsafe_data satisfies FlowChartClipboardData)
      )
        return;

      const data = unsafe_data as unknown as FlowChartClipboardData;
      const node_mapping: Map<string, string> = new Map();
      const edge_mapping: Map<string, string> = new Map();

      const randomId = () => {
        let v;

        do {
          v = Math.random().toString(16).slice(2);
        } while (node_mapping.has(v) || edge_mapping.has(v));

        return `${new Date().getTime()}-${v}`;
      };

      const positions = data.nodes
        .map((v) => v.position)
        .concat(
          data.nodes
            .filter((v) => v.measured)
            .map((v) => ({
              x: v.position.x + (v.measured?.width || 0),
              y: v.position.y + (v.measured?.height || 0),
            })),
        );

      const x_min = Math.min(...positions.map((v) => v.x));
      const x_max = Math.max(...positions.map((v) => v.x));
      const y_min = Math.min(...positions.map((v) => v.y));
      const y_max = Math.max(...positions.map((v) => v.y));

      const centroid = { x: (x_min + x_max) / 2, y: (y_min + y_max) / 2 };

      const diff = {
        x: mousePosition.current.x - centroid.x,
        y: mousePosition.current.y - centroid.y,
      };

      const newNodes = data.nodes.map((v) => {
        const newId = randomId();

        node_mapping.set(v.id, newId);
        return {
          ...v,
          id: newId,
          position: { x: v.position.x + diff.x, y: v.position.y + diff.y },
          data: {
            ...v.data,
            imports: undefined,
            expression: undefined,
            visualization_imports: undefined,
            visualization_expression: undefined,
          },
        };
      });

      const newEdges = data.edges
        .map((v) => {
          const newId = randomId();

          edge_mapping.set(v.id, newId);

          const idSource = node_mapping.get(v.source);
          const idTarget = node_mapping.get(v.target);

          if (!idSource || !idTarget) return undefined;

          return {
            ...v,
            id: newId,
            source: idSource,
            target: idTarget,
          };
        })
        .filter((v) => v)
        .map((v) => v as Edge);

      setNodes(
        getNodes()
          .map((v) => ({ ...v, selected: false }))
          .concat(newNodes.map((v) => ({ ...v, selected: true }))),
      );
      setEdges(
        getEdges()
          .map((v) => ({ ...v, selected: false }))
          .concat(newEdges.map((v) => ({ ...v, selected: true }))),
      );
    },
    [getEdges, getNodes, setEdges, setNodes],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('copy', onCopyCatpure);
    document.addEventListener('paste', onPasteCatpure);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('copy', onCopyCatpure);
      document.removeEventListener('paste', onPasteCatpure);
    };
  });

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

          const selected_nodes = getNodes()
            .filter((v) => {
              if (!v.measured) return false;
              const v_x = v.position.x;
              const v_y = v.position.y;
              const v2_x = v_x + v.measured.width!;
              const v2_y = v_y + v.measured.height!;

              return rectanglesIntersect(v_x, v_y, v2_x, v2_y);
            })
            .map((v) => v.id);

          const selected_edges = getEdges()
            .filter(
              (v) =>
                selected_nodes.includes(v.target) &&
                selected_nodes.includes(v.source),
            )
            .map((v) => v.id);

          setTimeout(() => {
            setNodes(
              getNodes().map((v) => {
                const isSelected = selected_nodes.includes(v.id);

                if (!isSelected) return v;
                return {
                  ...v,
                  selected: true,
                };
              }),
            );

            setEdges(
              getEdges().map((v) => {
                const isSelected = selected_edges.includes(v.id);

                if (!isSelected) return v;
                return {
                  ...v,
                  selected: true,
                };
              }),
            );
          }, 20);
        }}
        onMouseMove={(e) => {
          const real_point = screenToFlowPosition({
            x: e.clientX,
            y: e.clientY,
          });

          mousePosition.current = real_point;
          if (isSelecting.is_dragging) {
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
        <Controls position={'bottom-right'} />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            right: '5px',
            top: '5px',
            background: 'white',
            padding: '2px',
            zIndex: '100',
          }}
        >
          <IconButton
            style={{
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

          {getErrors().length !== 0 &&
            ['highlight', 'warning'].includes(error_level) && (
              <IconButton onClick={() => setErrorPane(!errorPane)}>
                <Error color='error' />
              </IconButton>
            )}
        </div>

        {errorPane &&
          ['highlight', 'warning'].includes(error_level) &&
          getErrors().length !== 0 && (
            <div
              style={{
                position: 'absolute',
                right: '100px',
                width: '400px',
                border: '#ddd solid 2px',
                padding: '5px',
                borderRadius: '5px',
                top: '20px',
                background: 'white',
                zIndex: '100',
              }}
            >
              <h3 style={{ margin: '10px 5px' }}>Errors :</h3>

              <div
                style={{
                  position: 'relative',
                  borderTop: '#ddd solid 2px',
                  top: '-5px',
                  margin: '0px',
                }}
              ></div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  maxHeight: '300px',
                  width: '100%',
                  overflowY: 'scroll',
                  overflowX: 'hidden',
                  padding: '5px 5px',
                  gap: '5px',
                }}
              >
                {getErrors().map((v) => (
                  <h5
                    key={`${v.nodeId}_${v.handle || 'default'}`}
                    style={{
                      margin: '0px',
                      display: 'flex',
                      alignItems: 'center',
                      height: 'fit-content',
                      marginRight: '30px',
                      padding: '8px 10px',
                      borderRadius: '5px',
                      width: '100%',
                      background: '#f99',
                      userSelect: 'none',
                    }}
                  >
                    {v.type}

                    <div style={{ flexGrow: 1 }} />

                    <IconButton
                      onClick={() =>
                        fitView({
                          nodes: [getNode(getNodes(), v.nodeId)!],
                          duration: 2,
                          padding: 1,
                        })
                      }
                    >
                      <RemoveRedEye />
                    </IconButton>
                  </h5>
                ))}
              </div>
            </div>
          )}

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

        {/* Selection rectangle */}
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
        />
      </ReactFlow>
    </Paper>
  );
}

import i18next from 'i18next';
import { useStore } from '../../components/graph/store';
import { getNode } from '../../components/graph/utils';

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
