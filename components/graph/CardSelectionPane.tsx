import { Expand, ExpandMore } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  Collapse,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';
import SelectionThroughList from './SelectionThroughList';

export default function CardSelectionPane() {
  const [collapsed, setCollasped] = useState(false);
  return (
    <Card>
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
        <Collapse in={collapsed} unmountOnExit orientation='horizontal'>
          <SelectionThroughList />
        </Collapse>
      </Collapse>
    </Card>
  );
}
