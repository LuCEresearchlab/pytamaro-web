/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import {
  Box,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import {
  JudiciousConstant,
  JudiciousType,
} from '../../src/schemas/documentation';
import CodeElement from './CodeElement';
import ConfigButtons, { SHOW_TYPES_KEY } from './ConfigButtons';
import ConstantDiagram from './ConstantDiagram';
import { hoverProps, moduleId, nameId } from './utils';

export default function TypeConstantDocumentation({ element, module }
: { element: JudiciousConstant | JudiciousType, module: string }) {
  const [hoverElement, setHoverElement] = useState<string>('');
  const {
    name, description,
  } = element;
  const { docsMetadata } = useLocalProfile();
  return (
    <>
      <Box mb={1}>
        <Box sx={{ display: 'flex' }}>
          <span>
            <Typography color="primary" fontWeight="bold" component="span">{element.kind === 'constant' ? 'Constant' : 'Type'}</Typography>
            <Typography color="text.secondary" component="span" sx={{ whiteSpace: 'pre' }}>
              {' from '}
            </Typography>
            <Typography
              color="text.secondary"
              component="span"
              {...hoverProps(moduleId(), hoverElement, setHoverElement)}
            >
              {module === '.' ? 'your code' : `library ${module}`}
            </Typography>
          </span>
          <ConfigButtons available={element.kind === 'constant' ? [SHOW_TYPES_KEY] : []} />
        </Box>
        <Typography>
          <span {...hoverProps(nameId(), hoverElement, setHoverElement)}>
            <CodeElement bold>{name}</CodeElement>
          </span>
          {element.kind === 'constant' && docsMetadata.showTypes && (
            <>
              <CodeElement>:</CodeElement>
              <CodeElement>&nbsp;</CodeElement>
              <CodeElement type>{element.type}</CodeElement>
            </>
          )}
        </Typography>
      </Box>
      { element.kind === 'constant' && (
        <ConstantDiagram
          constant={element}
          module={module}
          hoverElement={hoverElement}
          setHoverElement={setHoverElement}
        />
      )}
      <Typography color="text.secondary">
        {description.p}
      </Typography>
    </>
  );
}
