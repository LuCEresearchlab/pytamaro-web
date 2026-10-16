/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { toSpanAndCodeElements } from '../../src/basicMarkdown';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { JudiciousFunction } from '../../src/schemas/documentation';
import theme from '../../src/theme';
import CodeElement from './CodeElement';
import ConfigButtons, {
  SHOW_DIAGRAM_KEY,
  SHOW_OPTIONAL_KEY,
  SHOW_TYPES_KEY,
} from './ConfigButtons';
import DocumentationExample from './DocumentationExample';
import FunctionDiagram from './FunctionDiagram';
import SectionDivider from './SectionDivider';
import {
  hoverProps,
  moduleId,
  nameId,
  paramId,
  returnId,
  sentence,
  visibleParameters,
} from './utils';

export default function FunctionDocumentation({
  fn,
  module,
}: {
  fn: JudiciousFunction;
  module: string;
}) {
  const { t } = useLocalTranslation();
  const [hoverElement, setHoverElement] = useState<string>('');
  const { name, description, parameters, returnValue, examples } = fn;
  const { docsMetadata } = useLocalProfile();
  const params = visibleParameters(parameters, docsMetadata.showOptional);
  const hasOptionalParams = parameters.some(
    (param) => param.default !== undefined || param.variableLength,
  );
  const hasTypes =
    parameters.some((param) => param.type !== '') ||
    (returnValue && returnValue.type !== '');
  const hasExamplesUsingOptional =
    examples?.some((ex) => ex.usesOptional) || false;
  const availableOptions = [];
  if (hasOptionalParams || hasExamplesUsingOptional) {
    availableOptions.push(SHOW_OPTIONAL_KEY);
  }
  if (hasTypes) {
    availableOptions.push(SHOW_TYPES_KEY);
  }
  availableOptions.push(SHOW_DIAGRAM_KEY);

  const shownExamples =
    examples?.filter(
      (ex) =>
        !ex.usesOptional || (ex.usesOptional && docsMetadata.showOptional),
    ) || [];

  return (
    <>
      <Box
        sx={{
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ mr: 3 }}>
            <Typography
              color={theme.pytamaro.palette.red}
              component='span'
              sx={{
                fontWeight: 'bold',
              }}
            >
              {t('Function')}
            </Typography>
            &nbsp;
            <Typography
              component='span'
              {...hoverProps(moduleId(), hoverElement, setHoverElement)}
              sx={{
                color: 'text.secondary',
              }}
            >
              {module === '.'
                ? t('definedInYourCode', { context: 'female' })
                : t('definedInLibrary', { module, context: 'female' })}
            </Typography>
            {fn.sideEffects && (
              <Chip
                size='small'
                label={t('sideEffects')}
                color='error'
                variant='filled'
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <ConfigButtons available={availableOptions} />
        </Box>
        <Typography>
          <span {...hoverProps(nameId(), hoverElement, setHoverElement)}>
            <CodeElement bold>{name}</CodeElement>
          </span>
          <CodeElement>(</CodeElement>
          {params.map((param, i) => (
            <span key={i}>
              {i > 0 && (
                <>
                  <CodeElement>,</CodeElement>
                  <CodeElement>&nbsp;</CodeElement>
                </>
              )}
              <span {...hoverProps(paramId(i), hoverElement, setHoverElement)}>
                {param.variableLength && docsMetadata.showOptional && (
                  <CodeElement>*</CodeElement>
                )}
                <CodeElement>{param.name}</CodeElement>
                {param.type && docsMetadata.showTypes && (
                  <>
                    <CodeElement>:</CodeElement>
                    <CodeElement>&nbsp;</CodeElement>
                    <CodeElement type>{param.type}</CodeElement>
                  </>
                )}
                {param.default && (
                  <>
                    <CodeElement>&nbsp;</CodeElement>
                    <CodeElement>=</CodeElement>
                    <CodeElement>&nbsp;</CodeElement>
                    <CodeElement>{param.default}</CodeElement>
                  </>
                )}
              </span>
            </span>
          ))}
          <CodeElement>)</CodeElement>
          {returnValue?.type && docsMetadata.showTypes && (
            <Box
              component='span'
              {...hoverProps(returnId(), hoverElement, setHoverElement)}
            >
              <CodeElement>&nbsp;</CodeElement>
              <CodeElement type>→</CodeElement>
              <CodeElement>&nbsp;</CodeElement>
              <CodeElement type>{returnValue.type}</CodeElement>
            </Box>
          )}
        </Typography>
      </Box>
      {docsMetadata.showDiagram && (
        <FunctionDiagram
          fn={fn}
          module={module}
          hoverElement={hoverElement}
          setHoverElement={setHoverElement}
        />
      )}
      <Box sx={{ mt: 2 }} />
      {description.p.map((p, idx) => (
        <Typography
          key={idx}
          gutterBottom
          sx={{
            color: 'text.secondary',
          }}
        >
          {toSpanAndCodeElements(sentence(p))}
        </Typography>
      ))}
      {description.figure && (
        <Box
          sx={{
            mt: 2, // center
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={description.figure.url}
            alt={description.figure.caption}
            height={200}
            crossOrigin='anonymous'
          />
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              mt: 1,
            }}
          >
            {description.figure.caption}
          </Typography>
        </Box>
      )}
      {params.length > 0 &&
        params.some((param) => param.description.length > 0) && (
          <>
            <SectionDivider title={t('parameters')} />
            {params.map((param, i) => (
              <Typography
                key={i}
                {...hoverProps(paramId(i), hoverElement, setHoverElement)}
              >
                <CodeElement>{param.name}</CodeElement>
                <Typography
                  component='span'
                  sx={{
                    color: 'text.secondary',
                    ml: '1ch',
                  }}
                >
                  {toSpanAndCodeElements(param.description)}
                </Typography>
              </Typography>
            ))}
          </>
        )}
      {returnValue && returnValue.description.length > 0 && (
        <>
          <SectionDivider title={t('return')} />
          <Typography
            component='span'
            {...hoverProps(returnId(), hoverElement, setHoverElement)}
            sx={{
              color: 'text.secondary',
            }}
          >
            {toSpanAndCodeElements(sentence(returnValue.description))}
          </Typography>
        </>
      )}
      {shownExamples.length > 0 && (
        <>
          <SectionDivider title={t('examples')} />
          <Stack spacing={2}>
            {shownExamples.map((example, idx) => (
              <DocumentationExample example={example} key={idx} />
            ))}
          </Stack>
        </>
      )}
    </>
  );
}
