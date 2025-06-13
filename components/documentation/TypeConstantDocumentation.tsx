/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  JudiciousConstant,
  JudiciousType,
} from '../../src/schemas/documentation';
import CodeElement from './CodeElement';
import ConfigButtons, {
  SHOW_DIAGRAM_KEY,
  SHOW_OPTIONAL_KEY,
  SHOW_TYPES_KEY,
} from './ConfigButtons';
import DocumentationExample from './DocumentationExample';
import { hoverProps, moduleId, nameId, sentence } from './utils';
import { ConstantTamaroCard, ProceduralHoverStyles } from '../TamaroCard';

export default function TypeConstantDocumentation({
  element,
  module,
}: {
  element: JudiciousConstant | JudiciousType;
  module: string;
}) {
  const [hoverElement, setHoverElement] = useState<string>('');
  const { name, description, examples } = element;
  const { docsMetadata } = useLocalProfile();
  const { t } = useLocalTranslation();
  const hasExamplesUsingOptional =
    examples?.some((ex) => ex.usesOptional) || false;
  const availableOptions = [];
  if (hasExamplesUsingOptional) {
    availableOptions.push(SHOW_OPTIONAL_KEY);
  }
  if (element.kind === 'constant') {
    const hasType = element.type !== '';
    if (hasType) {
      availableOptions.push(SHOW_TYPES_KEY);
    }
    availableOptions.push(SHOW_DIAGRAM_KEY);
  }
  return (
    <>
      <ProceduralHoverStyles groups={['output', 'library', 'constant']} />
      <Box mb={1}>
        <Box sx={{ display: 'flex' }}>
          <span>
            <Typography color='primary' fontWeight='bold' component='span'>
              {t(element.kind === 'constant' ? 'Constant' : 'Type')}
            </Typography>
            &nbsp;
            <Typography
              color='text.secondary'
              component='span'
              className='hovergroup hovergroup_marker'
              data-hovergroup={'library'}
            >
              {module === '.'
                ? t('fromYourCode')
                : t('fromLibrary', { module })}
            </Typography>
          </span>
          <ConfigButtons available={availableOptions} />
        </Box>
        <Typography>
          <span
            data-hovergroup={'constant'}
            className='hovergroup hovergroup_marker'
          >
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
      {element.kind === 'constant' && docsMetadata.showDiagram && (
        <Box
          className='hide_handles'
          sx={{ display: 'flex', justifyContent: 'center', margin: '20px 0px' }}
        >
          <ConstantTamaroCard el={element} module={module} />
        </Box>
      )}
      {description.p.map((p, idx) => (
        <Typography key={idx} color='text.secondary' gutterBottom>
          {sentence(p)}
        </Typography>
      ))}
      {examples && examples.length > 0 && (
        <>
          <Divider sx={{ mt: 3, mb: 1 }}>{t('examples')}</Divider>
          <Stack spacing={2}>
            {examples.map((example, idx) => (
              <DocumentationExample example={example} key={idx} />
            ))}
          </Stack>
        </>
      )}
    </>
  );
}
