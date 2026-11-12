/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Error, MenuBook } from '@mui/icons-material';
import { IconButton, Paper, Tooltip } from '@mui/material';
import {
  Background,
  NodeMouseHandler,
  NodeToolbar,
  Position,
  ReactFlow,
  useStore as useFlowStore,
  useReactFlow,
} from '@xyflow/react';
import {
  Ref,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  JudiciousConstant,
  JudiciousFunction,
} from '../../src/schemas/documentation';
import {
  isValidConnection,
  onDocumentCopyCatpure,
  onDocumentKeyDown,
  onDocumentMouseMove,
  onDocumentPasteCatpure,
  onDragOver,
  onDrop,
  onMouseDown,
  onMouseUp,
} from '../../src/tide/graph_toolbox';
import { TideError, TideRuntimeError } from '../../src/tide/language/errors';
import { ErrorType } from '../../src/tide/language/typing';
import { setExecute, useStore } from '../../src/tide/store';
import { getNode, module_elements } from '../../src/tide/utils';
import FunctionDocumentation from '../documentation/FunctionDocumentation';
import TypeConstantDocumentation from '../documentation/TypeConstantDocumentation';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { AnnotationLayer } from './AnnotationLayer';
import { node_types, TideNode, TideNodeMetadata } from './cards';
import edge_type, { CustomEdgeLine } from './DynamicEdge';
import { ErrorParagraph } from './ErrorParagraph';
import { GraphOptions } from './GraphOptions';
import NodeContextMenu from './NodeContextMenu';
import PythonPanel from './PythonPanel';
import TidePalette, { JudiciousModuleElement } from './TidePalette';

import '@xyflow/react/dist/style.css';
import { ExecutorContext } from '../../src/execution/executorContext';
import theme from '../../src/theme';
import { extract_error } from '../../src/tide/language/utils';

function DocumentationToolbar({
  node_id,
  element,
}: {
  node_id: string;
  element: JudiciousModuleElement;
}) {
  const { t } = useLocalTranslation(['tide']);
  const [offset_x, setOffsetX] = useState(0);

  // `NodeToolbar` centers on the whole node bounds, which also include the
  // parameter and output arrow panes. Measure the actual card body instead so
  // the button is centered over the visible card.
  const nodes = useFlowStore((state) => state.nodes);
  const transform = useFlowStore((state) => state.transform);

  useLayoutEffect(() => {
    const node = document.querySelector<HTMLElement>(
      `.react-flow__node[data-id="${CSS.escape(node_id)}"]`,
    );
    const card = node?.querySelector<HTMLElement>('.tamaro_card');
    if (!node || !card) return;

    const node_rect = node.getBoundingClientRect();
    const card_rect = card.getBoundingClientRect();

    setOffsetX(
      card_rect.left +
        card_rect.width / 2 -
        (node_rect.left + node_rect.width / 2),
    );
  }, [node_id, nodes, transform]);

  return (
    <NodeToolbar
      nodeId={node_id}
      position={Position.Top}
      align='center'
      offset={4}
    >
      <div style={{ transform: `translateX(${offset_x}px)` }}>
        <Popover placement='top'>
          <PopoverTrigger>
            <Tooltip arrow title={t('documentationButton')}>
              <IconButton
                size='small'
                sx={{
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { backgroundColor: 'grey.100' },
                }}
              >
                <MenuBook color='info' fontSize='small' />
              </IconButton>
            </Tooltip>
          </PopoverTrigger>
          <PopoverContent>
            <Paper
              elevation={0}
              sx={{
                width: '40vw',
                minWidth: '300px',
                maxWidth: '90vw',
                maxHeight: '70vh',
                padding: '20px',
                borderRadius: '5px',
                overflow: 'auto',
              }}
            >
              {element.kind === 'function' ? (
                <FunctionDocumentation
                  fn={element as JudiciousFunction}
                  module={element.module}
                />
              ) : (
                <TypeConstantDocumentation
                  element={element as JudiciousConstant}
                  module={element.module}
                />
              )}
            </Paper>
          </PopoverContent>
        </Popover>
      </div>
    </NodeToolbar>
  );
}

export default function Tide() {
  const { t } = useLocalTranslation(['tide']);
  const { executorState, execute } = useContext(ExecutorContext);

  const [menu, setMenu] = useState(
    null as {
      id: string;
      top?: number;
      left?: number;
      click_outside?: boolean;
      close: () => void;
    } | null,
  );
  const ref: Ref<HTMLDivElement> = useRef(null);

  const { screenToFlowPosition, flowToScreenPosition, fitView } =
    useReactFlow();

  const store = useStore();

  const {
    edges,
    nodes,
    getNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    error_level,
    initialized,
    fullscreen,
    setFullscreen,
    mousePosition,
    judicious: documentation,
  } = store;

  // `execute` changes identity on every render; always forward the latest one
  if (executorState.type === 'available') setExecute(execute);

  // The executor toggles between states while running code, so only react once
  const initialEvaluationDone = useRef(false);
  const executorAvailable = executorState.type === 'available';

  useEffect(() => {
    if (!executorAvailable || initialEvaluationDone.current) return;
    initialEvaluationDone.current = true;
    // Re-evaluate everything that was processed before the executor was ready
    const { getNodes, setNodes } = useStore.getState();
    setNodes(
      getNodes().map(
        (v) => ({ ...v, data: { ...v.data, outdated: true } }) as TideNode,
      ),
    );
  }, [executorAvailable]);

  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const { x: shift_x, y: shift_y } = ref.current!.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY - shift_y,
        left: event.clientX - shift_x,
        close: () => setMenu(null),
      });
    },
    [setMenu],
  );

  const [availabilities, setAvailabilities] = useState({
    error: undefined as [TideNodeMetadata, TideError | false][] | undefined,
    documentation: undefined as
      | { element: JudiciousModuleElement; node_id: string }
      | undefined,
  });

  useEffect(() => {
    setAvailabilities({
      error: (() => {
        const errors = nodes
          .map((v) => v.data.tide_node)
          .map(
            (
              v,
            ):
              | [
                  TideNodeMetadata,
                  (
                    | false
                    | ErrorType
                    | {
                        error: TideRuntimeError;
                      }
                  ),
                ]
              | undefined => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const error = extract_error(v as any);
              return error ? [v!.metadata, error] : undefined;
            },
          )
          .filter((v) => v)
          .map((v): [TideNodeMetadata, false | TideError][] => {
            // eslint-disable-next-line no-param-reassign
            v = v!;
            if (v[1] === false) return [[v[0], false]];
            return Array.isArray(v[1].error)
              ? v[1].error.map((o) => [v[0], o])
              : [[v[0], v[1].error as TideError]];
          })
          .reduce((a, b) => a.concat(b), []);
        return errors.length === 0 ? undefined : errors;
      })(),
      documentation: (() => {
        const toBeDocumentedNodes = getNodes().filter((v) => v.selected);

        if (!(toBeDocumentedNodes.length === 1)) return;

        const node = toBeDocumentedNodes[0];
        const data = node.data;
        const elements = module_elements(documentation);

        const element = elements.find(
          (v) =>
            v.name === data.input &&
            (data.module === undefined || v.module === data.module),
        );

        return element ? { element, node_id: node.id } : undefined;
      })(),
    });
  }, [documentation, error_level, getNodes, nodes]);

  const [isSelecting, setIsSelecting] = useState({
    x: 0,
    y: 0,
    is_dragging: false,
  });

  const all_store = {
    ...store,
    screenToFlowPosition,
    setFullscreen,
    fullscreen,
    isSelecting,
    setIsSelecting,
  };

  useEffect(() => {
    const _onKeyDown = (e: KeyboardEvent) => onDocumentKeyDown(all_store, e);
    const _onCopy = (e: ClipboardEvent) => onDocumentCopyCatpure(all_store, e);
    const _onPaste = (e: ClipboardEvent) =>
      onDocumentPasteCatpure(all_store, e);
    const _onMouseMove = (e: MouseEvent) => onDocumentMouseMove(all_store, e);

    document.addEventListener('keydown', _onKeyDown);
    document.addEventListener('copy', _onCopy);
    document.addEventListener('paste', _onPaste);
    document.addEventListener('mousemove', _onMouseMove);
    return () => {
      document.removeEventListener('keydown', _onKeyDown);
      document.removeEventListener('copy', _onCopy);
      document.removeEventListener('paste', _onPaste);
      document.removeEventListener('mousemove', _onMouseMove);
    };
  });

  const documented = availabilities.documentation;

  return (
    <Paper
      className={`${fullscreen ? 'fullscreen' : 'normal'} graph_view ${store.evaluating ? 'evaluating' : ''}`}
    >
      <ReactFlow
        id='graph_element'
        tabIndex={0}
        ref={ref}
        nodes={nodes}
        edges={edges}
        nodeTypes={node_types}
        edgeTypes={edge_type}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionRadius={100}
        connectionLineComponent={CustomEdgeLine}
        deleteKeyCode={['Delete', 'Backspace']}
        connectionLineStyle={{
          fill: 'none',
          strokeWidth: 2,
          stroke: 'gray',
        }}
        onClick={() => {
          if (!menu) return;
          return setMenu({ ...menu!, click_outside: true });
        }}
        onNodeContextMenu={onNodeContextMenu}
        onPaneScroll={() => setMenu(null)}
        onScrollCapture={() => setMenu(null)}
        defaultEdgeOptions={{
          type: 'custom_edge',
          focusable: true,
          style: {
            strokeWidth: 2,
            stroke: '#000',
          },
        }}
        onDrop={(e) => onDrop(all_store, e)}
        onDragOver={(e) => onDragOver(all_store, e)}
        isValidConnection={(params) => isValidConnection(all_store, params)}
        onMouseDown={(e) => onMouseDown(all_store, e)}
        onMouseUp={(e) => onMouseUp(all_store, e)}
        proOptions={{
          hideAttribution: true,
        }}
        maxZoom={6}
      >
        <div
          style={{
            position: 'absolute',
            right: '0',
            bottom: '0',
            zIndex: '100',
            pointerEvents: 'none',
          }}
        >
          <GraphOptions />
        </div>
        <AnnotationLayer />
        {nodes.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 20px',
              textAlign: 'center',
              color: theme.palette.text.secondary,
              fontSize: '1.1rem',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 1,
            }}
          >
            <span style={{ maxWidth: '100%' }}>{t('emptyState')}</span>
          </div>
        )}
        {availabilities.error && initialized === 'done' && (
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
            <Popover placement='left'>
              <PopoverTrigger>
                <IconButton
                  size='large'
                  sx={{
                    color: 'black',
                    backgroundColor: '#ffe600',
                    filter: 'drop-shadow(0px 0px 2px black)',
                    '&:hover': { backgroundColor: '#ffd000' },
                  }}
                >
                  <Error />
                </IconButton>
              </PopoverTrigger>
              <PopoverContent>
                <Paper
                  elevation={0}
                  sx={{
                    width: '400px',
                    maxWidth: '90vw',
                    padding: '5px',
                    borderRadius: '5px',
                  }}
                >
                  <h2 style={{ margin: '8px 5px' }}>
                    {t('errorsPanel.title')}
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      maxHeight: '300px',
                      width: '100%',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      padding: '5px 5px',
                      gap: '8px',
                    }}
                  >
                    {availabilities.error
                      .filter((v) => v[1] !== false)
                      .map((v) => v as [TideNodeMetadata, TideError])
                      .map((v, i) => (
                        <Tooltip
                          arrow
                          title={t('errorsPanel.goToErrorCard')}
                          placement='left'
                          // eslint-disable-next-line react/no-array-index-key
                          key={`${v[0].node_id}_${i}`}
                        >
                          <div
                            style={{
                              position: 'relative',
                              padding: '15px 25px 20px',
                              color: 'black',
                              background: '#ffe600',
                              borderRadius: '15px',
                              filter: 'drop-shadow(0px 0px 2px black)',
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              fitView({
                                nodes: [
                                  getNode(
                                    getNodes() as TideNode[],
                                    v[0].node_id,
                                  )!,
                                ],
                                duration: 2,
                                padding: 2,
                              })
                            }
                          >
                            <ErrorParagraph annotation={v[1]} />
                          </div>
                        </Tooltip>
                      ))}
                  </div>
                </Paper>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {documented && initialized === 'done' && (
          <DocumentationToolbar
            node_id={documented.node_id}
            element={documented.element}
          />
        )}

        <div
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            margin: '10px',
            zIndex: '100',
          }}
        >
          <TidePalette />
        </div>

        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        {menu && <NodeContextMenu {...menu} />}
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

        <Background bgColor={theme.palette.grey[50]} gap={15} />
      </ReactFlow>
      <PythonPanel />
    </Paper>
  );
}
