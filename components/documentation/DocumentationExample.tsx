/* eslint-disable no-nested-ternary */
import { useMonaco } from '@monaco-editor/react';
import Keyboard from '@mui/icons-material/Keyboard';
import { Badge, Box, Card, CardContent, Tooltip } from '@mui/material';
import { useEffect } from 'react';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { JudiciousExample } from '../../src/schemas/documentation';
import theme from '../../src/theme';
import {
  registerCustomPythonLanguage,
  STRICT_PYTHON3_LANG_ID,
} from '../editor/strictPython3';
import {
  COLORIZE_CLASSNAME,
  colorizeElements,
  configureEditor,
} from '../editor/utils';
import { OutputArea } from '../OutputArea';

configureEditor();

function RotatedHeading({
  children,
  tooltip,
}: {
  children: string;
  tooltip: string;
}) {
  return (
    <Box
      p={0.75}
      mr={1}
      sx={{
        fontVariant: 'all-small-caps',
        display: 'inline-block',
        writingMode: 'vertical-lr',
        rotate: '180deg',
        color: theme.palette.grey[600],
        verticalAlign: 'middle',
      }}
    >
      <Tooltip arrow title={tooltip} placement='left'>
        <span style={{ userSelect: 'none' }}>{children}</span>
      </Tooltip>
    </Box>
  );
}

export default function DocumentationExample({
  example,
}: {
  example: JudiciousExample;
}) {
  const monaco = useMonaco();

  const { t } = useLocalTranslation();

  useEffect(() => {
    if (monaco) {
      registerCustomPythonLanguage(monaco);
      colorizeElements(monaco);
    }
  }, [monaco]);

  return (
    <Card sx={{ height: '100%' }} variant='outlined'>
      <CardContent sx={{ padding: 0, '&:last-child': { pb: 0 } }}>
        <Box display='flex' alignItems='center'>
          <RotatedHeading tooltip={t('codeTooltip')}>
            {t('code')}
          </RotatedHeading>
          <Box
            className={COLORIZE_CLASSNAME}
            data-lang={STRICT_PYTHON3_LANG_ID}
            component={'code'}
            sx={{
              fontFamily: theme.pytamaro.monospaceFontFamily,
              whiteSpace: 'pre',
              overflowX: 'auto',
              fontVariantLigatures: 'none',
              display: 'inline-block',
              marginTop: theme.spacing(1),
              marginBottom: theme.spacing(1),
            }}
            translate='no'
          >
            {example.code}
          </Box>
        </Box>
        {(example.stdout || example.stdin) && (
          <Box
            display='flex'
            alignItems='center'
            sx={{ backgroundColor: theme.palette.grey[50] }}
          >
            <RotatedHeading tooltip={t('outputTooltip')}>
              {t(
                example.stdin && example.stdout
                  ? 'I/O'
                  : example.stdin
                    ? 'input'
                    : 'output',
              )}
            </RotatedHeading>
            {example.stdout && (
              <OutputArea
                data={example.stdout}
                sx={{
                  display: 'inline-block',
                  width: example.stdin ? 'auto' : '100%',
                  marginRight: example.stdin ? 0 : theme.spacing(1),
                }}
              />
            )}
            {example.stdin && (
              <Badge
                badgeContent={
                  <Keyboard
                    sx={{
                      position: 'absolute',
                      bottom: theme.spacing(1),
                      right: theme.spacing(-1),
                    }}
                  />
                }
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ display: 'inline-block' }}
              >
                <OutputArea
                  data={example.stdin}
                  sx={{
                    paddingLeft: theme.spacing(0.25),
                    paddingRight: theme.spacing(0.25),
                  }}
                  preStyle={{
                    marginTop: theme.spacing(0.5),
                    marginBottom: theme.spacing(0.5),
                    padding: theme.spacing(0.5),
                    border: `1px dashed ${theme.palette.grey[600]}`,
                  }}
                />
              </Badge>
            )}
          </Box>
        )}
        {example.result && (
          <Box
            display='flex'
            alignItems='center'
            sx={{ backgroundColor: theme.palette.grey[200] }}
          >
            <RotatedHeading tooltip={t('resultTooltip')}>
              {t('result')}
            </RotatedHeading>
            <OutputArea
              data={example.result}
              sx={{
                display: 'inline-block',
              }}
            />
          </Box>
        )}
        {example.error && (
          <Box
            display='flex'
            alignItems='center'
            sx={{
              // HACK: What's the proper way to introduce new colors?
              //.      (theme.palette.error.light looks bad)
              color: 'rgb(255, 0, 0)',
              backgroundColor: 'rgb(255, 245, 245)',
            }}
          >
            <RotatedHeading tooltip={t('errorTooltip')}>
              {t('error')}
            </RotatedHeading>
            <OutputArea
              data={example.error}
              sx={{
                display: 'inline-block',
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
