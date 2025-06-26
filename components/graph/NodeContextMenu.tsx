import React, { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useStore } from './store';
import { getChildren, getNode, getSubTreeFromRoot } from './utils';
import { BACKGROUND_COLOR, BORDER_COLOR } from './cards/constant_definition';

export default function NodeContextMenu({
  id,
  top = undefined,
  left = undefined,
  right = undefined,
  bottom = undefined,
  ...props
}: {
  id: string;
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}) {
  const { getNodes, setNodes, getEdges, setEdges } = useStore();

  const extractAsConstant = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const descendants: string[] = getSubTreeFromRoot(nodes, edges, id);

    const existing_edge = edges.find((v) => v.source === id);

    const newNode: Node = {
      id: `${new Date().getTime()}-parent`,
      type: 'constant_definition',
      data: { name: new Date().getTime().toString() },
      position: { x: 0, y: 0 },
      zIndex: -100,
    };

    const replacedByNode: Node = {
      id: `${new Date().getTime()}-replacement`,
      type: 'constant_use',
      data: { name: newNode.data.name },
      position: getNode(nodes, id)!.position,
    };

    setNodes(
      nodes
        .map((v) =>
          !descendants.includes(v.id)
            ? v
            : ({
                ...v,
                data: { ...v.data, parent: newNode.id },
              } as Node),
        )
        .concat(newNode, replacedByNode),
    );

    setEdges(
      getEdges()
        .filter((v) => v.source !== id)
        .concat([
          {
            id: `${id}-${newNode.id}-edge`,
            source: id,
            sourceHandle: 'output',
            target: newNode.id,
            targetHandle: 'output',
          },
        ])
        .concat(
          existing_edge
            ? [
                {
                  id: `${id}-${replacedByNode.id}-edge`,
                  source: replacedByNode.id,
                  sourceHandle: 'output',
                  target: existing_edge.target,
                  targetHandle: existing_edge.targetHandle,
                },
              ]
            : [],
        ),
    );
  }, [getNodes, getEdges, id, setNodes]);

  return (
    <div
      style={{
        top,
        left,
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        border: 'solid black 1px',
        borderRadius: '5px',
        zIndex: '100',
      }}
      className='context-menu'
      {...props}
    >
      <button
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 20px',
        }}
        onClick={extractAsConstant}
      >
        Extract sub expression tree as constant
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            margin: '0px 15px',
            backgroundColor: `${BORDER_COLOR}`,
          }}
        >
          {' '}
        </span>
      </button>
    </div>
  );
}
