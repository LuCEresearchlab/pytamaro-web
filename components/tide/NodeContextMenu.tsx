/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useReactFlow } from '@xyflow/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { useStore } from '../../src/tide/store';
import {
  getConstantDefinition,
  getNode,
  getSubTreeFromRoot,
} from '../../src/tide/utils';
import { ConstantDefinitionNode, ConstantNode, TideNode } from './cards';
import { BORDER_COLOR } from './cards/constant_definition';

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
  const { t } = useLocalTranslation(['tide']);
  const [openNameModal, setNameModalOpen] = useState(false);
  const { fitView } = useReactFlow();
  const { getNodes, setNodes, getEdges, setEdges, asSingleChange } = useStore(
    useShallow((state) => ({
      getNodes: state.getNodes,
      setNodes: state.setNodes,
      getEdges: state.getEdges,
      setEdges: state.setEdges,
      asSingleChange: state.asSingleChange,
    })),
  );

  useEffect(() => {
    if (click_outside && !openNameModal) {
      close();
    }
  });

  const extractAsConstant = useCallback(
    (name: string) => {
      asSingleChange(() => {
        const nodes = getNodes();
        const edges = getEdges();

        const descendants: string[] = getSubTreeFromRoot(nodes, edges, id);
        const descendants_nodes = descendants.map((v) => getNode(nodes, v)!);

        const existing_edge = edges.find((v) => v.source === id);

        const newNodeId = `${new Date().getTime()}-parent`;

        const newNode: ConstantDefinitionNode = {
          id: newNodeId,
          type: 'constant_definition',
          data: {
            input: name,
          },
          position: { x: 0, y: 0 },
          zIndex: -100,
        };

        // Place the use card below the whole extracted subtree, which is the
        // area the definition will be drawn around
        const subtree_bottom = Math.max(
          ...descendants_nodes.map(
            (v) => v.position.y + (v.measured?.height ?? 0),
          ),
        );

        const replacedByNodeId = `${new Date().getTime()}-replacement`;
        const replacedByNode: ConstantNode = {
          id: replacedByNodeId,
          type: 'constant',
          data: {
            input: name,
          },
          position: {
            x: getNode(nodes, id)!.position.x,
            y: subtree_bottom + 100, // 100px below the subtree
          },
        };

        setNodes(
          nodes
            .map((v) =>
              !descendants.includes(v.id)
                ? v
                : ({
                    ...v,
                    data: { ...v.data, parent: newNode.id },
                  } as TideNode),
            )
            .concat(replacedByNode, newNode),
        );

        setEdges(
          getEdges()
            .filter((v) => v.source !== id)
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

        setEdges(
          getEdges().concat([
            {
              id: `${id}-${newNode.id}-edge`,
              source: id,
              sourceHandle: 'output',
              target: newNode.id,
              targetHandle: 'output',
            },
          ]),
        );
      });
    },
    [asSingleChange, getNodes, getEdges, id, setNodes, setEdges],
  );

  const node = getNode(getNodes(), id);

  const constant_reference: string | undefined =
    node?.type === 'constant'
      ? getConstantDefinition(getNodes(), node?.data?.input)?.id
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
      // eslint-disable-next-line react/jsx-props-no-spreading
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
        {t('contextMenu.extractConstant')}
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

      <button
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'left',
          padding: '10px 20px',
        }}
        onClick={() => {
          asSingleChange(() => {
            setEdges(
              getEdges().filter((v) => !(v.source === id || v.target === id)),
            );
            setNodes(getNodes().filter((v) => v.id !== id));
          });
        }}
      >
        {t('contextMenu.deleteNode')}
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
          {t('contextMenu.goToConstantDefinition')}
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
          <DialogTitle>{t('contextMenu.createConstantTitle')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin='dense'
              id='name'
              name='name'
              label={t('contextMenu.constantName')}
              type='name'
              fullWidth
              variant='standard'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNameModalOpen(false)}>
              {t('contextMenu.cancel')}
            </Button>
            <Button type='submit'>{t('contextMenu.confirm')}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </div>
  );
}
