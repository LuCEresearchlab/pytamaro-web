import React, { useCallback, useEffect, useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { useStore } from './store';
import { getConstantDefinition, getNode, getSubTreeFromRoot } from './utils';
import { BORDER_COLOR } from './cards/constant_definition';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

export default function NodeContextMenu({
  id,
  top = undefined,
  left = undefined,
  click_outside = false,
  close,
  ...props
}: {
  id: string;
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  click_outside?: boolean;
  close: () => void;
}) {
  const [openNameModal, setNameModalOpen] = useState(false);
  const { fitView } = useReactFlow();
  const { getNodes, setNodes, getEdges, setEdges } = useStore();

  useEffect(() => {
    if (click_outside && !openNameModal) {
      close();
    }
  });

  const extractAsConstant = useCallback(
    (name: string) => {
      const nodes = getNodes();
      const edges = getEdges();

      const descendants: string[] = getSubTreeFromRoot(nodes, edges, id);

      const existing_edge = edges.find((v) => v.source === id);

      const newNode: Node = {
        id: `${new Date().getTime()}-parent`,
        type: 'constant_definition',
        data: { name },
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
          .concat(replacedByNode, newNode),
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
                    ...existing_edge,
                    id: `${id}-${replacedByNode.id}-edge`,
                    source: replacedByNode.id,
                    sourceHandle: 'output',
                  },
                ]
              : [],
          ),
      );
    },
    [getNodes, getEdges, id, setNodes, setEdges],
  );

  const node = getNode(getNodes(), id);

  const constant_reference: string | undefined =
    node?.type === 'constant_use' && node.data.name
      ? getConstantDefinition(getNodes(), node?.data?.name as string)?.id
      : undefined;

  const goToParentDefinition = useCallback(() => {
    fitView({
      nodes: getNodes().filter((v) => v.id === constant_reference),
    });
  }, [fitView, getNodes, constant_reference]);

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
          justifyContent: 'left',
          padding: '10px 20px',
        }}
        onClick={() => setNameModalOpen(true)}
      >
        Extract sub expression tree as constant
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            margin: '0px 15px',
            backgroundColor: `${BORDER_COLOR}`,
            borderRadius: '0',
          }}
        >
          {' '}
        </span>
      </button>

      {constant_reference && (
        <button
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'left',
            padding: '10px 20px',
            borderRadius: '0',
          }}
          onClick={() => goToParentDefinition()}
        >
          Go to constant definition
        </button>
      )}
      <Dialog
        open={openNameModal}
        // onClose={() => setNameModalOpen(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { name } = Object.fromEntries((formData as any).entries());
              extractAsConstant(name);
              setNameModalOpen(false);
            },
          },
        }}
      >
        <Box>
          <DialogTitle>Create a new constant node</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin='dense'
              id='name'
              name='name'
              label='Constant name'
              type='name'
              fullWidth
              variant='standard'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNameModalOpen(false)}>Cancel</Button>
            <Button type='submit'>Confirm</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </div>
  );
}
