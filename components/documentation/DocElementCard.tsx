import { Card, CardContent } from '@mui/material';
import { CSSProperties } from 'react';
import { JudiciousElement } from '../../src/schemas/documentation';
import FunctionDocumentation from './FunctionDocumentation';
import TypeConstantDocumentation from './TypeConstantDocumentation';

export default function DocElementCard({
  module,
  element,
  elevation = 0,
  sx = {},
}: {
  module: string;
  element: JudiciousElement;
  elevation?: number;
  sx?: CSSProperties;
}) {
  return (
    <Card elevation={elevation} sx={{ maxWidth: 'min(90ch, 95vw)', ...sx }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        {element.kind === 'function' ? (
          <FunctionDocumentation fn={element} module={module} />
        ) : (
          <TypeConstantDocumentation element={element} module={module} />
        )}
      </CardContent>
    </Card>
  );
}
