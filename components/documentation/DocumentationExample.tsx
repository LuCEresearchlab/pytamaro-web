import { Box, Card, CardContent, Tooltip } from '@mui/material';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import useMonacoColorizer, {
  COLORIZE_CLASSNAME,
} from '../../src/monacoColorizer';
import { JudiciousExample } from '../../src/schemas/documentation';
import theme from '../../src/theme';
import { STRICT_PYTHON3_LANG_ID } from '../editor/strictPython3';
import InputArea from '../input_output/InputArea';
import { OutputArea } from '../input_output/OutputArea';

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
        <span style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
          {children}
        </span>
      </Tooltip>
    </Box>
  );
}

export default function DocumentationExample({
  example,
}: {
  example: JudiciousExample;
}) {
  const { t } = useLocalTranslation();

  useMonacoColorizer();

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
                  overflowX: 'auto',
                }}
              />
            )}
            {example.stdin && (
              <InputArea initialContent={example.stdin} forceBadge={true} />
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
                overflowX: 'auto',
              }}
            />
          </Box>
        )}
        {example.error && (
          <Box
            display='flex'
            alignItems='center'
            sx={{
              color: 'red',
              backgroundColor: theme.pytamaro.palette.background.errorRed,
            }}
          >
            <RotatedHeading tooltip={t('errorTooltip')}>
              {t('error')}
            </RotatedHeading>
            <OutputArea
              data={example.error}
              sx={{
                display: 'inline-block',
                overflowX: 'auto',
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
