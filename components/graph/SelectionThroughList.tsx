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
import { JudiciousElement } from '../../src/schemas/documentation';

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

  const { node_filter } = useStore();
  const getUpdatedFilterCache = useCallback(() => {
    const module_name = moduleFilter || 'pytamaro';
    const jud_module = documentation.find((doc) => doc.module === module_name);
    if (!jud_module) return [];
    const values = node_filter
      .filter((v) => v.module === module_name)
      .map((v) =>
        v.name === '*' ? jud_module.elements.map((el) => el.name) : [v.name],
      )
      .reduce((a, b) => a.concat(b), []);
    const filtered_values = values.filter((v) => v.includes(filter_input));

    return filtered_values
      .map((v) => jud_module.elements.find((o) => o.name === v))
      .filter((v) => v)
      .map((v) => ({ ...(v as JudiciousElement), module: module_name }));
  }, [documentation, filter_input, moduleFilter, node_filter]);

  const [filteredCache, setFilteredCache] = useState(getUpdatedFilterCache());
  const { setDragged } = useStore();

  const available_modules = node_filter
    .map((v) => v.module)
    .reduce((a, b) => a.add(b), new Set<string>());

  useEffect(() => {
    setFilteredCache(getUpdatedFilterCache());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node_filter]);

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
        {available_modules.size > 1 && (
          <div>
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
              {Array.from(available_modules.entries()).map(([v]) => (
                <MenuItem value={v} key={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </div>
        )}

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
