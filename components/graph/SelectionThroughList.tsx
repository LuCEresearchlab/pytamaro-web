'use client';

import { Refresh } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { node_types } from './cards';
import useJudiciousDocData from '../../src/documentation';
import {
  JudiciousElement,
  JudiciousFunction,
} from '../../src/schemas/documentation';
import TamaroCard from '../TamaroCard';
import { useDnD } from '../../pages/graph/DnDContext';

const modules = [
  'builtins',
  'functools',
  'math',
  'pytamaro',
  'random',
  'string',
];

export default function SelectionByGroup() {
  const [refresh, setRefreshing] = useState(false);
  const [nodeType, setNodeType] = useState(undefined as string | undefined);
  const [filter_input, setFilterInput] = useState('');

  const documentation = useJudiciousDocData(modules);

  function getUpdatedFilterCache() {
    return documentation
      .map((mod) => mod.elements.map((v) => ({ ...v, module: mod.module })))
      .reduce((a, b) => a.concat(b))
      .filter((v) =>
        v.name
          .toLowerCase()
          .replaceAll(/[\t ]/g, '')
          .includes(filter_input.toLowerCase().replaceAll(/[\t ]/g, '')),
      )
      .filter((v) => (nodeType ? v.kind === nodeType : true));
  }

  const [filteredCache, setFilteredCache] = useState(getUpdatedFilterCache());

  const card_type = Object.keys(node_types);

  useEffect(() => {
    if (refresh) {
      setFilteredCache(getUpdatedFilterCache());
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [refresh]);

  let timeout: any;
  useEffect(() => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => setRefreshing(true), 400);
  }, [filter_input, nodeType]);

  const [nodeData, setNodeData] = useDnD() as any;
  const onDragStart = (
    event: any,
    el: JudiciousElement & { module: string },
  ) => {
    setNodeData(el);
    event.dataTransfer!.effectAllowed = 'move';
  };

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '5px',
          maxHeight: '30vh',
          overflow: 'scroll',
          width: '40vw',
        }}
      >
        {filteredCache
          .filter((el) => el.kind === 'function' || el.kind === 'constant')
          .toSorted((v1, v2) => v1.name.localeCompare(v2.name))
          .map((el) => (
            <div
              className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
              style={{ userSelect: 'none' }}
              onDragStart={(e) => {
                onDragStart(e, el);
              }}
              draggable
              key={el.module + '$' + el.name}
            >
              <TamaroCard el={el} module={el.module} show_handles={false} />
            </div>
          ))}
      </CardContent>
      <CardActions sx={{ display: 'flex', flexGrow: '1', width: '100%' }}>
        <InputLabel id='node_type'>Node type : </InputLabel>
        <Select
          labelId='node_type'
          sx={{
            minWidth: '150px',
          }}
          value={nodeType}
          onChange={(e) => {
            return setNodeType(e.target.value);
          }}
        >
          {card_type.map((v) => (
            <MenuItem value={v} key={v}>
              {v}
            </MenuItem>
          ))}
          <MenuItem value={undefined}>
            <span style={{ visibility: 'hidden' }}>Undefined</span>
          </MenuItem>
        </Select>

        <InputLabel id='research' style={{ margin: '0px 15px' }}>
          Filter :{' '}
        </InputLabel>
        <Input
          type='text'
          aria-labelledby='research'
          defaultValue={filter_input}
          onChange={(e) => setFilterInput(e.currentTarget.value)}
        />
        <div style={{ flexGrow: '1' }}></div>
        <IconButton disabled={refresh} onClick={() => setRefreshing(true)}>
          <Refresh />
        </IconButton>
      </CardActions>
    </Card>
  );
}
