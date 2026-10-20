import { Close, ExpandMore, Search, Style } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { sortBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { JudiciousElement } from '../../src/schemas/documentation';
import { synchronous_phases } from '../../src/tide/evaluation';
import {
  TideJudiciousMetadata,
  toTideConstant,
  toTideFunction,
} from '../../src/tide/judiciours_to_tide';
import { ImportedDefinition } from '../../src/tide/language/definitions';
import { useStore } from '../../src/tide/store';
import { KNOWN_JUDICIOUS_MODULES } from '../documentation/utils';
import {
  CONSTANT_LIBRARY,
  LITERALS_LIBRARY,
  TidePalettePane,
} from './TidePalettePane';

export type JudiciousModuleElement = JudiciousElement & { module: string };

const isSpecial = (library: string) =>
  library === LITERALS_LIBRARY || library === CONSTANT_LIBRARY;

export default function TidePalette() {
  const [collapsed, setCollasped] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState('pytamaro');

  const { judicious, setConfiguration } = useStore();

  const orderedModules = sortBy(
    KNOWN_JUDICIOUS_MODULES,
    (module) =>
      module === 'pytamaro' ? 0 : module.startsWith('pytamaro.') ? 1 : 2,
    (module) => module,
  );

  const allDefinitions = useMemo(() => {
    const definitions = sortBy(judicious, (m) =>
      orderedModules.indexOf(m.module),
    )
      .flatMap(({ module, elements }) =>
        elements
          .filter(
            (element) =>
              element.kind === 'constant' || element.kind === 'function',
          )
          .filter(
            (element) => !(module === 'builtins' && element.name === 'input'),
          )
          .map((element) => ({ module, element })),
      )
      .map(({ module, element }) => {
        try {
          return element.kind === 'constant'
            ? toTideConstant(element, module)
            : toTideFunction(element, module);
        } catch {
          return undefined;
        }
      })
      .filter((definition) => definition !== undefined);

    return sortBy(
      definitions,
      (definition) => (definition.kind === 'constant_definition' ? 0 : 1),
      (definition) =>
        definition.kind === 'function_definition'
          ? definition.location.name
          : '',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [judicious]);

  const availableDefinitions = useMemo(
    () =>
      synchronous_phases({
        imported_definitions: allDefinitions,
        expressions: [],
        local_definitions: [],
      }).imported_definitions as ImportedDefinition<
        TideJudiciousMetadata,
        'evaluated'
      >[],
    [allDefinitions],
  );

  const libraries = useMemo(() => {
    const nonEmpty = new Set(allDefinitions.map((d) => d.location.module));
    return [
      LITERALS_LIBRARY,
      CONSTANT_LIBRARY,
      ...orderedModules.filter(
        (module) => nonEmpty.has(module) || module === selectedLibrary,
      ),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDefinitions, selectedLibrary]);

  useEffect(() => {
    setConfiguration({ imported_definitions: availableDefinitions });
  }, [availableDefinitions, setConfiguration]);

  const values = useMemo(
    () =>
      allDefinitions.filter(
        (definition) => selectedLibrary === definition.location.module,
      ) as unknown as ImportedDefinition<TideJudiciousMetadata, 'evaluated'>[],
    [allDefinitions, selectedLibrary],
  );

  return (
    <Card id='card_selection_pane'>
      <CardHeader
        sx={{ gap: '10px', minWidth: '200px' }}
        subheader={
          <Stack direction='row' spacing={4} sx={{ alignItems: 'center' }}>
            <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
              <Style />
              <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                Cards Palette
              </Typography>
            </Stack>
            {collapsed && (
              <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                <TextField
                  select
                  variant='standard'
                  value={selectedLibrary}
                  slotProps={{
                    select: {
                      sx: isSpecial(selectedLibrary)
                        ? { fontStyle: 'italic', color: 'primary.main' }
                        : undefined,
                    },
                  }}
                  onChange={(event) => {
                    setSelectedLibrary(event.target.value);
                    setFilter('');
                  }}
                >
                  {libraries.map((module) => (
                    <MenuItem
                      value={module}
                      key={module}
                      sx={
                        isSpecial(module) ? { fontStyle: 'italic' } : undefined
                      }
                      divider={module === CONSTANT_LIBRARY}
                    >
                      {module}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  variant='standard'
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder='Search...'
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Search />
                        </InputAdornment>
                      ),
                      endAdornment: filter !== '' && (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='Clear search'
                            edge='end'
                            size='small'
                            onClick={() => setFilter('')}
                          >
                            <Close fontSize='small' />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            )}
          </Stack>
        }
        action={
          <IconButton onClick={() => setCollasped(!collapsed)}>
            <ExpandMore
              sx={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: (t) => t.transitions.create('transform'),
              }}
            />
          </IconButton>
        }
      />
      <Collapse in={collapsed} orientation='vertical' unmountOnExit>
        <div className='card_selection_content'>
          <TidePalettePane
            values={values}
            filter={filter}
            library={selectedLibrary}
          />
        </div>
      </Collapse>
    </Card>
  );
}
