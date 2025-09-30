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
import { useMemo, useState } from 'react';
import { JudiciousElement } from '../../src/schemas/documentation';
import { useStore } from '../../src/tide/store';
import { ImportReference } from './cards';
import { TidePalettePane } from './TidePalettePane';

export type JudiciousModuleElement = JudiciousElement & { module: string };
const N_LIMIT = 10;

export function getModules(values: ImportReference[]): string[] {
  return Array.from(new Set(values.map((v) => v.module)));
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

export default function TidePalette() {
  const [collapsed, setCollasped] = useState(false);

  const { imported_definitions: values } = useStore();

  const modules = useMemo(
    () => Array.from(new Set(values.map((v) => v.location.module))),
    [values],
  );

  const [tab, setTab] = useState(
    values.length === 0 ? '' : (values[0].location.module as string),
  );
  const N = values.length;

  return (
    <Card id='card_selection_pane'>
      <CardHeader
        sx={{ gap: '10px', minWidth: '200px' }}
        subheader='Cards Palette'
        action={
          <IconButton onClick={() => setCollasped(!collapsed)}>
            <ExpandMore></ExpandMore>
          </IconButton>
        }
      />
      <Collapse in={collapsed} orientation='vertical'>
        <Collapse in={collapsed} orientation='horizontal' unmountOnExit>
          <div className='card_selection_content' style={{}}>
            {N < N_LIMIT ||
            new Set(values.map((v) => v.location.module)).size === 1 ? (
              <>
                <TidePalettePane values={values} />
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
                      <TidePalettePane
                        values={values.filter((o) => o.location.module === v)}
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
