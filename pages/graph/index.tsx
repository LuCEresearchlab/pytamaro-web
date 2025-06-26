import {
  Background,
  BackgroundVariant,
  NodeMouseHandler,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { Ref, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton, Paper } from '@mui/material';
import '@xyflow/react/dist/style.css';
import '../../style/graph_view.css';
import { Article, Error, RemoveRedEye } from '@mui/icons-material';
import { IImportedCardData, node_types } from '../../components/graph/cards';
import CardSelectionPane, {
  JudiciousModuleElement,
} from '../../components/graph/CardSelectionPane';

function View() {
  const [pane, setPane] = useState(
    undefined as 'error' | 'documentation' | undefined,
  );

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

  const { getNodes, screenToFlowPosition, flowToScreenPosition, fitView } =
    useReactFlow();

  // const { i18n } = useLocalTranslation(['common']);
  const store = useStore();

  const {
    edges,
    nodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    error_level,
    unstack_queue,
    initialized,
    getAnnotations,
    fullscreen,
    setFullscreen,
  } = store;

  const getErrors = useCallback(
    () =>
      getAnnotations().filter((v) =>
        ['syntax-error', 'value-error', 'type-error'].includes(v.kind),
      ),
    [getAnnotations],
  );

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
    error: undefined as ErrorAnnotation[] | undefined,
    documentation: undefined as JudiciousModuleElement | undefined,
  });

  useEffect(() => {
    setAvailabilities({
      error: (() => {
        return getErrors().length === 0 &&
          ['highlight', 'warning'].includes(error_level)
          ? undefined
          : getErrors();
      })(),
      documentation: (() => {
        const toBeDocumentedNodes = getNodes().filter((v) => v.selected);

        if (
          !(
            toBeDocumentedNodes.length === 1 &&
            toBeDocumentedNodes[0].type !== 'literal'
          )
        )
          return;

        const node = toBeDocumentedNodes[0];
        const data = node.data as unknown as IImportedCardData;

        return { ...data.value, module: data.module };
      })(),
    });
  }, [getErrors, error_level, getNodes]);

  useEffect(() => {
    if (!pane) return;
    if (!availabilities[pane]) setPane(undefined);
  }, [availabilities, pane, setPane]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    mousePosition,
    setMousePosition,
    isSelecting,
    setIsSelecting,
  };

  useEffect(() => {
    if (initialized === 'wait') {
      const { updateAnnotation, setInitialized } = store;
      nodes.forEach(updateAnnotation);
      setInitialized('done');
    }
  }, [initialized, nodes, store]);

  useEffect(() => {
    const interval = setInterval(() => {
      unstack_queue();
    }, 100);
    return () => clearInterval(interval);
  }, [unstack_queue]);

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

  return (
    <Paper
      className={`${fullscreen ? 'fullscreen' : 'normal'} graph_view `}
      style={{
        border: 'solid black 2px',
      }}
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
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <AnnotationLayer />
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
          {availabilities.error && (
            <IconButton
              onClick={() => setPane(pane !== 'error' ? 'error' : undefined)}
            >
              <Error color='error' />
            </IconButton>
          )}

          {availabilities.documentation && (
            <IconButton
              onClick={() =>
                setPane(pane !== 'documentation' ? 'documentation' : undefined)
              }
            >
              <Article color='info' />
            </IconButton>
          )}
        </div>

        {availabilities.error && pane === 'error' && (
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
                <div
                  style={{
                    position: 'relative',
                    padding: '5px',
                    borderRadius: '10px',
                    border: 'solid #f99 4px',
                    background: '#fcc',
                    userSelect: 'none',
                  }}
                  key={`${v.location.node_id}_${v.location.handle || 'default'}`}
                >
                  <ErrorParagraph annotation={v} />

                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      margin: '10px',
                    }}
                    onClick={() =>
                      fitView({
                        nodes: [getNode(getNodes(), v.location.node_id)!],
                        duration: 2,
                        padding: 0.125,
                      })
                    }
                  >
                    <RemoveRedEye />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {availabilities.documentation && pane === 'documentation' && (
          <div
            style={{
              position: 'absolute',
              right: '100px',
              width: '30%',
              maxHeight: '100%',
              border: '#ddd solid 2px',
              padding: '20px',
              borderRadius: '5px',
              top: '20px',
              background: 'white',
              zIndex: '100',
              overflow: 'scroll',
            }}
          >
            {availabilities.documentation?.kind === 'function' ? (
              <FunctionDocumentation
                fn={availabilities.documentation! as JudiciousFunction}
                module={availabilities.documentation!.module}
              />
            ) : (
              <TypeConstantDocumentation
                element={availabilities.documentation! as JudiciousConstant}
                module={availabilities.documentation!.module}
              />
            )}
          </div>
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
          <CardSelectionPane />
        </div>

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
      </ReactFlow>
    </Paper>
  );
}

import { useStore } from '../../components/graph/store';
import { getNode } from '../../components/graph/utils';
import CodeEditor from '../../components/CodeEditor';
import { executeOnServer } from '../../src/useActivity';
import {
  isValidConnection,
  onDocumentCopyCatpure,
  onDrop,
  onDocumentKeyDown,
  onDocumentMouseMove,
  onDocumentPasteCatpure,
  onDragOver,
  onMouseUp,
  onMouseDown,
} from '../../components/graph/graph_toolbox';
import { AnnotationLayer } from '../../components/graph/AnnotationLayer';
import { ErrorParagraph } from '../../components/graph/ErrorParagraph';
import { GraphOptions } from '../../components/graph/GraphOptions';
import edge_type from '../../components/graph/SmoothStepWithPadding';
import {
  JudiciousConstant,
  JudiciousFunction,
} from '../../src/schemas/documentation';
import { ErrorAnnotation } from '../../components/graph/annotations';
import FunctionDocumentation from '../../components/documentation/FunctionDocumentation';
import { translationProps } from '../../src/serverSideTranslationProps';
import TypeConstantDocumentation from '../../components/documentation/TypeConstantDocumentation';
import NodeContextMenu from '../../components/graph/NodeContextMenu';

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
  );
}

export default Graph;

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps()),
    },
  };
}
