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
import { node_types, Wrap } from './cards';
import useJudiciousDocData from '../../src/documentation';
import {
  JudiciousElement,
  JudiciousFunction,
} from '../../src/schemas/documentation';
import TamaroCard from '../TamaroCard';
import { useDnD } from '../../pages/graph/DnDContext';
import { TamaroLiteralCard } from './cards/literal';

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
  const [moduleFilter, setModuleFilter] = useState('pytamaro');
  const [filter_input, setFilterInput] = useState('');

  const documentation = useJudiciousDocData(modules);

  function getUpdatedFilterCache() {
    return documentation
      .filter((v) => {
        return moduleFilter === undefined || v.module === moduleFilter;
      })
      .map((mod) => mod.elements.map((v) => ({ ...v, module: mod.module })))
      .reduce((a, b) => a.concat(b))
      .filter((v) =>
        v.name
          .toLowerCase()
          .replaceAll(/[\t ]/g, '')
          .includes(filter_input.toLowerCase().replaceAll(/[\t ]/g, '')),
      );
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
  }, [filter_input, moduleFilter]);

  const [nodeData, setNodeData] = useDnD() as any;
  const onDragStart = (event: any, type: string, value: any) => {
    setNodeData({ type, value });
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
                onDragStart(e, 'judicious', el);
              }}
              draggable
              key={el.module + '$' + el.name}
            >
              <TamaroCard el={el} module={el.module} show_handles={false} />
            </div>
          ))}

        {(filter_input.trim() === '' ||
          !isNaN(Number.parseFloat(filter_input.trim()))) && (
          <div
            className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
            style={{ userSelect: 'none' }}
            onDragStart={(e) => {
              onDragStart(
                e,
                'literal',
                filter_input.trim() === ''
                  ? undefined
                  : Number.parseFloat(filter_input.trim()),
              );
            }}
            draggable
          >
            <TamaroLiteralCard
              data={
                {
                  literal_type: 'float',
                  wrap: new Wrap(
                    filter_input.trim() === ''
                      ? undefined
                      : Number.parseFloat(filter_input.trim()),
                  ),
                } as any
              }
              hide_handles
              {...({} as any)}
            />
          </div>
        )}
      </CardContent>
      <CardActions sx={{ display: 'flex', flexGrow: '1', width: '100%' }}>
        <InputLabel id='node_type'>Node type : </InputLabel>
        <Select
          labelId='node_type'
          sx={{
            minWidth: '150px',
          }}
          value={moduleFilter}
          onChange={(e) => {
            return setModuleFilter(e.target.value);
          }}
        >
          {modules.map((v) => (
            <MenuItem value={v} key={v}>
              {v}
            </MenuItem>
          ))}
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
