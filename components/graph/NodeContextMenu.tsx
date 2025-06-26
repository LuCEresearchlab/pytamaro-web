import React, { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useStore } from './store';
import { getChildren, getNode } from './utils';

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
  const { getNodes, setNodes, getEdges } = useStore();

  const extractAsConstant = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const descendants: string[] = [];
    const visited = new Set<string>();
    const stack = [getNode(nodes, id)];

    while (stack.length !== 0) {
      const el = stack.shift()!;

      if (visited.has(el.id)) continue;
      visited.add(el.id);
      descendants.push(el.id);

      getChildren(nodes, edges, el, true).forEach((v) => {
        stack.push(v);
        descendants.push(v.id);
      });
    }

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
