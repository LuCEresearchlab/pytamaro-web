import {
  Card,
  CardContent,
} from '@mui/material';
import {
  JudiciousElement,
} from '../../src/schemas/documentation';
import FunctionDocumentation from './FunctionDocumentation';
import TypeConstantDocumentation from './TypeConstantDocumentation';

export default function DocElementCard({ module, element, elevation = 0 } :
{ module: string, element: JudiciousElement, elevation?: number }) {
  return (
    <Card elevation={elevation} sx={{ pb: 1, minWidth: '60ch', maxWidth: '90ch' }} data-toc-indent="true" data-toc-title={element.name} id={`${module}.${element.name}`} className="anchor">
      <CardContent sx={{ pb: 1, minWidth: '60ch', maxWidth: '90ch' }}>
        {element.kind === 'function'
          ? <FunctionDocumentation fn={element} module={module} />
          : <TypeConstantDocumentation element={element} module={module} />}
      </CardContent>
    </Card>
  );
}
