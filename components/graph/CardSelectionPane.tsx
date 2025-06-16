import { ExpandMore } from '@mui/icons-material';
import { Card, CardHeader, Collapse, IconButton } from '@mui/material';
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
        <Collapse in={collapsed} orientation='horizontal' unmountOnExit>
          <SelectionThroughList />
        </Collapse>
      </Collapse>
    </Card>
  );
}
