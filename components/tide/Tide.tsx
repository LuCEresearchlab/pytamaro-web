import { NodeMouseHandler, ReactFlow, useReactFlow } from '@xyflow/react';
import { Ref, useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../../src/tide/store';
import { ErrorType } from '../../src/tide/language/typing';
import { node_types, TideNode, TideNodeMetadata } from './cards';
import { TideError } from '../../src/tide/language/errors';
import TidePalette, { JudiciousModuleElement } from './TidePalette';
import { getNode, module_elements } from '../../src/tide/utils';
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
import { IconButton, Paper } from '@mui/material';
import edge_type, { CustomEdgeLine } from './DynamicEdge';
import { GraphOptions } from './GraphOptions';
import { AnnotationLayer } from './AnnotationLayer';
import { Article, Error, RemoveRedEye } from '@mui/icons-material';
import { ErrorParagraph } from './ErrorParagraph';
import FunctionDocumentation from '../documentation/FunctionDocumentation';
import {
  JudiciousConstant,
  JudiciousFunction,
} from '../../src/schemas/documentation';
import TypeConstantDocumentation from '../documentation/TypeConstantDocumentation';
import NodeContextMenu from './NodeContextMenu';

import '@xyflow/react/dist/style.css';
import '../../style/graph_view.css';
import { ConfigurationState } from '../../src/tide/configuration';

export default function Tide({
  configuration = undefined,
}: {
  configuration?: Partial<ConfigurationState>;
}) {
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
    setConfiguration,
    mousePosition,
    judicious: documentation,
  } = store;

  useEffect(() => {
    setConfiguration(configuration || {});
  }, [configuration, setConfiguration]);

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
    documentation: undefined as JudiciousModuleElement | undefined,
  });

  useEffect(() => {
    setAvailabilities({
      error: (() => {
        const errors = nodes
          .map((v) => v.data.tide_node)
          .map((v): [TideNodeMetadata, ErrorType | false] | undefined =>
            v && 'error_phase' in v
              ? [v!.metadata, v!.type as ErrorType | false]
              : undefined,
          )
          .filter((v) => v)
          .map((v) => v as [TideNodeMetadata, ErrorType | false])
          .map((v): [TideNodeMetadata, TideError | false][] =>
            v[1] === false
              ? [[v[0], false]]
              : Array.isArray(v[1].error)
                ? v[1].error.map((o) => [v[0], o])
                : [[v[0], v[1].error as TideError]],
          )
          .reduce((a, b) => a.concat(b), []);
        return errors.length === 0 ? undefined : errors;
      })(),
      documentation: (() => {
        const toBeDocumentedNodes = getNodes().filter((v) => v.selected);

        if (!(toBeDocumentedNodes.length === 1)) return;

        const node = toBeDocumentedNodes[0];
        const data = node.data;
        const elements = module_elements(documentation);

        return elements.find((v) => v.name === data.input);
      })(),
    });
  }, [documentation, error_level, getNodes, nodes]);

  useEffect(() => {
    if (!pane) return;
    if (!availabilities[pane]) setPane(undefined);
  }, [availabilities, pane, setPane]);

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
          {availabilities.error && initialized === 'done' && (
            <IconButton
              onClick={() => setPane(pane !== 'error' ? 'error' : undefined)}
            >
              <Error color='error' />
            </IconButton>
          )}

          {availabilities.documentation && initialized === 'done' && (
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
              {availabilities.error
                .filter((v) => v[1] !== false)
                .map((v) => v as [TideNodeMetadata, TideError])
                .map((v, i) => (
                  <div
                    style={{
                      position: 'relative',
                      padding: '5px',
                      borderRadius: '10px',
                      border: 'solid #f99 4px',
                      background: '#fcc',
                      userSelect: 'none',
                    }}
                    key={`${v[0].node_id}_${i}`}
                  >
                    <ErrorParagraph annotation={v[1]} />

                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        margin: '10px',
                      }}
                      onClick={() =>
                        fitView({
                          nodes: [
                            getNode(getNodes() as TideNode[], v[0].node_id)!,
                          ],
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
              right: '50px',
              width: '40%',
              maxHeight: '100%',
              border: '#ddd solid 2px',
              padding: '20px',
              borderRadius: '5px',
              top: '50px',
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
          <TidePalette />
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
