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
import { DragEvent, useCallback, useEffect, useState } from 'react';
import useJudiciousDocData from '../../src/documentation';
import TamaroCard from '../TamaroCard';
import { TamaroLiteralCard } from './cards/literal';
import { useStore } from './store';

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

  const number_input =
    filter_input.trim() === '' ||
    filter_input.match(/[^0-9]/g) ||
    isNaN(Number.parseFloat(filter_input.trim()))
      ? undefined
      : Number.parseFloat(filter_input.trim());

  const documentation = useJudiciousDocData(modules);

  const getUpdatedFilterCache = useCallback(() => {
    return documentation
      .filter((v) => {
        return moduleFilter === undefined || v.module === moduleFilter;
      })
      .map((mod) => mod.elements.map((v) => ({ ...v, module: mod.module })))
      .reduce((a, b) => a.concat(b), [])
      .filter((v) =>
        v.name
          .toLowerCase()
          .replaceAll(/[\t ]/g, '')
          .includes(filter_input.toLowerCase().replaceAll(/[\t ]/g, '')),
      );
  }, [documentation, filter_input, moduleFilter]);

  const [filteredCache, setFilteredCache] = useState(getUpdatedFilterCache());
  const { setDragged } = useStore();

  useEffect(() => {
    if (refresh) {
      setFilteredCache(getUpdatedFilterCache());
      setTimeout(() => setRefreshing(false), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  let timeout: NodeJS.Timeout;
  useEffect(() => {
    if (timeout) clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    timeout = setTimeout(() => setRefreshing(true), 400);
  }, [filter_input, moduleFilter]);

  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    type: string,
    data: Record<string, unknown>,
  ) => {
    setDragged({ type, data });
    // eslint-disable-next-line no-param-reassign
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
                onDragStart(e, el.kind, {
                  module: el.module,
                  name: el.name,
                  value: el,
                } as Record<string, unknown>);
              }}
              draggable
              key={el.module + '$' + el.name}
            >
              <div style={{ pointerEvents: 'none' }}>
                <TamaroCard el={el} module={el.module} show_handles={false} />
              </div>
            </div>
          ))}

        {number_input != null && (
          <div
            className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
            style={{ userSelect: 'none' }}
            onDragStart={(e) => {
              onDragStart(e, 'literal', {
                literal_type: 'float',
                value: number_input,
              });
            }}
            draggable
          >
            <TamaroLiteralCard
              data={
                {
                  literal_type: 'float',
                  value: number_input,
                } as Record<string, unknown>
              }
              hide_handles
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          onKeyDown={(e) => e.stopPropagation()}
        />
        <div style={{ flexGrow: '1' }}></div>
        <IconButton disabled={refresh} onClick={() => setRefreshing(true)}>
          <Refresh />
        </IconButton>
      </CardActions>
    </Card>
  );
}
