import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Card,
  CardHeader,
  Collapse,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import { useState } from 'react';
import { useStore } from './store';
import { CardTabSelectionPane } from './CardTabSelectionPange';
import useJudiciousDocData from '../../src/documentation';
import {
  JudiciousElement,
  JudiciousModule,
} from '../../src/schemas/documentation';
import { ImportReference } from './cards';

export type JudiciousModuleElement = JudiciousElement & { module: string };
const N_LIMIT = 10;

export function getModules(values: ImportReference[]): string[] {
  return Array.from(new Set(values.map((v) => v.module)));
}

function filterByImports(
  values: ImportReference[],
  modules: JudiciousModule[],
  functional_nodes_only: boolean,
): JudiciousModuleElement[] {
  const element_map = new Map<string, JudiciousModuleElement>();

  const fully_imported = values
    .filter((v) => v.name === '*')
    .map((v) => v.module);

  const not_fully_imported = modules.filter(
    (v) => !fully_imported.includes(v.module),
  );

  not_fully_imported
    .map((v) =>
      v.elements.map(
        (el): JudiciousModuleElement => ({ ...el, module: v.module }),
      ),
    )
    .reduce((a, b) => a.concat(b), [])
    .forEach((v) => {
      element_map.set(`${v.module}|${v.name}`, v);
    });

  function orderingByKind(a: 'constant' | 'type' | 'function') {
    return a === 'type' ? -1 : a === 'constant' ? 0 : 1;
  }

  const raw_returns = modules
    .filter((v) => fully_imported.includes(v.module))
    .map((module) =>
      module.elements
        .map((el): JudiciousModuleElement => ({ ...el, module: module.module }))
        .toSorted((a, b) => orderingByKind(a.kind) - orderingByKind(b.kind)),
    )
    .reduce((a, b) => a.concat(b), [])
    .concat(
      values
        .map((v) => element_map.get(`${v.module}|${v.name}`))
        .filter(Boolean)
        .map((v) => v as JudiciousModuleElement),
    );

  return !functional_nodes_only
    ? raw_returns
    : raw_returns.filter((v) => {
        if (v.kind === 'function') {
          return (
            !v.sideEffects &&
            !v.parameters
              .filter((v) => !v.default)
              .map((v) => v.type)
              .concat(v.returnValue?.type || 'float')
              .find(
                (v) =>
                  !JSON.stringify({
                    Graphic: {
                      en: 'Graphic',
                      it: 'Grafica',
                      de: 'Grafik',
                      fr: 'Graphique',
                    },
                    Color: {
                      en: 'Color',
                      it: 'Colore',
                      de: 'Farbe',
                      fr: 'Couleur',
                    },
                    Point: {
                      en: 'Point',
                      it: 'Punto',
                      de: 'Punkt',
                      fr: 'Point',
                    },
                    float: {},
                    str: {},
                  }).includes(`"${v}"`),
              )
          );
        }

        return true;
      });
}

interface TabPanelProps {
  index: string;
  value: string;
}

function TabPanel(props: React.PropsWithChildren<TabPanelProps>) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

export default function CardSelectionPane() {
  const [collapsed, setCollasped] = useState(false);

  const { node_filter, functional_nodes_only } = useStore();
  const modules = getModules(node_filter);
  const [tab, setTab] = useState(modules[0]);
  const values = filterByImports(
    node_filter,
    useJudiciousDocData(modules),
    functional_nodes_only,
  );

  console.log(values);

  const N = values.length;

  return (
    <Card id='card_selection_pane'>
      <CardHeader
        sx={{ gap: '10px' }}
        subheader='Card Selection Menu'
        action={
          <IconButton onClick={() => setCollasped(!collapsed)}>
            <ExpandMore></ExpandMore>
          </IconButton>
        }
      />
      <Collapse in={collapsed} orientation='vertical'>
        <Collapse in={collapsed} orientation='horizontal' unmountOnExit>
          <div className='card_selection_content' style={{}}>
            {N < N_LIMIT || modules.length === 1 ? (
              <>
                <CardTabSelectionPane values={values} />
              </>
            ) : (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    aria-label='lab API tabs example'
                  >
                    {modules.map((v) => (
                      <Tab label={v} value={v} key={v} />
                    ))}
                  </Tabs>
                </Box>
                {modules.map((v) => {
                  return (
                    <TabPanel value={tab} index={v} key={v}>
                      <CardTabSelectionPane
                        values={values.filter((o) => o.module === v)}
                      />
                    </TabPanel>
                  );
                })}
              </>
            )}
          </div>
        </Collapse>
      </Collapse>
    </Card>
  );
}
