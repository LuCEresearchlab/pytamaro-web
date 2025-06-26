import React, { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useStore } from './store';
import { getChildren, getNode, getSubTreeFromRoot } from './utils';

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

    const newNode: Node = {
      id: `${new Date().getTime()}-parent`,
      type: 'constant_definition',
      data: {},
      position: { x: 0, y: 0 },
      zIndex: -100,
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
        .concat(newNode),
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
        ]),
    );
  }, [getNodes, getEdges, id, setNodes]);

  return (
    <div
      style={{
        top,
        left,
        right,
        bottom,
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
      <p style={{ margin: '0.5em' }}>
        <small>node: {id}</small>
      </p>
      <button onClick={extractAsConstant}>Extract as Constant</button>
    </div>
  );
}
