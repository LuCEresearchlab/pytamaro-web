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
import { Button, IconButton, Input, Paper } from '@mui/material';
import '@xyflow/react/dist/style.css';
import '../../style/graph_view.css';
import {
  Delete,
  Download,
  Error,
  Fullscreen,
  FullscreenExit,
  RemoveRedEye,
  Upload,
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
  const [fullscreen, setFullscreen] = useState(false);
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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [isSelecting, setIsSelecting] = useState({
    x: 0,
    y: 0,
    is_dragging: false,
  });

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
        x: mousePosition.x - centroid.x,
        y: mousePosition.y - centroid.y,
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
    [getEdges, getNodes, mousePosition.x, mousePosition.y, setEdges, setNodes],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const real_point = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      setMousePosition(real_point);
    },
    [screenToFlowPosition],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('copy', onCopyCatpure);
    document.addEventListener('paste', onPasteCatpure);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('copy', onCopyCatpure);
      document.removeEventListener('paste', onPasteCatpure);
      document.removeEventListener('mousemove', onMouseMove);
    };
  });

  const nodeTypes = useMemo(() => node_types, []);
  const clickedRef = useRef(-1);

  const [download_file, setDownloadFile] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ nodes: getNodes(), edges: getEdges() })], {
        type: 'text/plain',
      }),
    );
    setDownloadFile(url);

    return () => URL.revokeObjectURL(url);
  }, [getNodes, getEdges]);

  return (
    <Paper className={`${fullscreen ? 'fullscreen' : 'normal'} graph_view `}>
      <ReactFlow
        id='graph_element'
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
              ...mousePosition,
            });
          }
        }}
        onMouseUp={() => {
          const min_point = {
            x: Math.min(isSelecting.x, mousePosition.x),
            y: Math.min(isSelecting.y, mousePosition.y),
          };
          const max_point = {
            x: Math.max(isSelecting.x, mousePosition.x),
            y: Math.max(isSelecting.y, mousePosition.y),
          };

          const x_0 = min_point.x;
          const y_0 = min_point.y;
          const x_1 = max_point.x;
          const y_1 = max_point.y;

          setIsSelecting({
            is_dragging: false,
            ...mousePosition,
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

        <div
          style={{
            zIndex: '100',
            background: 'white',
            borderRadius: '5px',
            position: 'absolute',
            bottom: '0',
            left: '0',
          }}
        >
          <IconButton
            size='large'
            onClick={() => {
              setNodes([]);
              setEdges([]);
            }}
          >
            <Delete />
          </IconButton>

          <Button
            style={{
              borderRadius: '5px',
              fontSize: '18px',
            }}
            size='large'
            itemType='file'
            component='label'
            role={undefined}
          >
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
                    nodes: Node[];
                    edges: Edge[];
                  };

                  setNodes(content.nodes);
                  setEdges(content.edges);
                };
                reader.readAsText(file);
              }}
            />
          </Button>

          <Button
            style={{
              borderRadius: '5px',
              fontSize: '18px',
            }}
            size='large'
            download={'tamaro_graph.json'}
            href={download_file}
          >
            Download <Download />
          </Button>
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

        {/* Selection rectangle */}

        {isSelecting.is_dragging && (
          <div
            style={(() => {
              const { x, y } = flowToScreenPosition(isSelecting);

              const { x: x2, y: y2 } = flowToScreenPosition(mousePosition);

              const div = document.getElementById('graph_element')!;

              const { x: shift_x, y: shift_y } = div.getBoundingClientRect();
              const min_point = {
                x: Math.min(x, x2) - shift_x,
                y: Math.min(y, y2) - shift_y,
              };
              const max_point = {
                x: Math.max(x, x2) - shift_x,
                y: Math.max(y, y2) - shift_y,
              };

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
        )}
      </ReactFlow>
    </Paper>
  );
}

import i18next from 'i18next';
import { useStore } from '../../components/graph/store';
import { getNode } from '../../components/graph/utils';
import CodeEditor from '../../components/CodeEditor';
import { executeOnServer } from '../../src/useActivity';

function Graph() {
  const [source] = useState('from pytamaro import *');

  const { setConfiguration } = useStore();

  const configuration_timeout = useRef(undefined as NodeJS.Timeout | undefined);

  function extract_codes(configuration_code: string) {
    if (configuration_timeout.current)
      clearTimeout(configuration_timeout.current);
    configuration_timeout.current = setTimeout(async () => {
      const code = `from ast import parse, ImportFrom

parsed = parse(
    """${configuration_code}"""
)
imports = [b for b in parsed.body if b.__class__ == ImportFrom]
[print("IMPORT", v.module, o.name) for v in imports for o in v.names]
`;
      configuration_timeout.current = undefined;
      const results = await executeOnServer([code], 0, [], [])
        .catch(() => undefined)
        .then((v) => {
          return v?.type === 'success' ? v.stdout : undefined;
        })
        .then((v) => {
          if (!v) return [];

          const lines = v.trim().split('\n');
          const imports = lines
            .map((v) => v.trim())
            .filter((v) => v.startsWith('IMPORT'))
            .map((v) => v.substring('IMPORT '.length));
          return imports;
        });

      setConfiguration({
        node_filter: results
          .map((v) => v.split(' '))
          .map((v) => ({ module: v[0], name: v[1] })),
      });
    }, 500);
  }

  return (
    <I18nextProvider i18n={i18next}>
      <div className='graph_page'>
        <div className='editor'>
          <CodeEditor
            initialSource=''
            currentSource={source}
            onChange={async (v) => {
              extract_codes(v);
            }}
          />
        </div>
        <ReactFlowProvider>
          <View />
        </ReactFlowProvider>
      </div>
    </I18nextProvider>
  );
}

export default appWithTranslation(Graph);
