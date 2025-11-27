/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import { Box, Stack, Typography } from '@mui/material';
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
import ConstantDiagram from './ConstantDiagram';
import DocumentationExample from './DocumentationExample';
import SectionDivider from './SectionDivider';
import { hoverProps, moduleId, nameId, sentence } from './utils';

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
  const isConstant = element.kind === 'constant';
  if (isConstant) {
    const hasType = element.type !== '';
    if (hasType) {
      availableOptions.push(SHOW_TYPES_KEY);
    }
    availableOptions.push(SHOW_DIAGRAM_KEY);
  }
  const gender = isConstant ? 'female' : 'male';
  return (
    <>
      <Box mb={1}>
        <Box sx={{ display: 'flex' }} minHeight='2em'>
          <span>
            <Typography
              color={isConstant ? 'primary' : 'warning'}
              fontWeight='bold'
              component='span'
            >
              {t(isConstant ? 'Constant' : 'Type')}
            </Typography>
            &nbsp;
            <Typography
              color='text.secondary'
              component='span'
              {...hoverProps(moduleId(), hoverElement, setHoverElement)}
            >
              {module === '.'
                ? t('definedInYourCode', {
                    context: gender,
                  })
                : t('definedInLibrary', {
                    module,
                    context: gender,
                  })}
            </Typography>
          </span>
          <ConfigButtons available={availableOptions} />
        </Box>
        <Typography>
          <span {...hoverProps(nameId(), hoverElement, setHoverElement)}>
            <CodeElement bold>{name}</CodeElement>
          </span>
          {isConstant && docsMetadata.showTypes && (
            <>
              <CodeElement>:</CodeElement>
              <CodeElement>&nbsp;</CodeElement>
              <CodeElement type>{element.type}</CodeElement>
            </>
          )}
        </Typography>
      </Box>
      {isConstant && docsMetadata.showDiagram && (
        <ConstantDiagram
          constant={element}
          module={module}
          hoverElement={hoverElement}
          setHoverElement={setHoverElement}
        />
      )}
      {description.p.map((p, idx) => (
        <Typography key={idx} color='text.secondary' gutterBottom>
          {sentence(p)}
        </Typography>
      ))}
      {examples && examples.length > 0 && (
        <>
          <SectionDivider title={t('examples')} />
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
