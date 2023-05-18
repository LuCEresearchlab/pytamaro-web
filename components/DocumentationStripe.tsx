import { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
// eslint-disable-next-line import/no-relative-packages
import init, { imported_names } from '../src/parser/parser';
import { ActivityVariant } from '../src/schemas/activitySchema';
import PyTamaroAPI from './PyTamaroAPIDocs/PyTamaroAPI';
import PyTamaroNames from './PyTamaroAPIDocs/names';

export default function DocumentationStripe({ source, activityVariant } :
{ source: string, activityVariant: ActivityVariant }) {
  const [names, setNames] = useState<string[][] | undefined>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      await init();
      setLoaded(true);
    })();
  }, []);
  useEffect(() => {
    if (loaded) {
      try {
        setNames(imported_names(source));
      } catch {
        setNames(undefined);
      }
    }
  }, [loaded, source]);
  const moduleToLanguage: Record<string, string> = {
    // eslint-disable-next-line quote-props
    'pytamaro': 'en',
    'pytamaro.it': 'it',
    'pytamaro.de': 'de',
  };
  const key = (module: string, name: string) => `${moduleToLanguage[module]}.${name}`;
  const knownNames = names?.filter(([module]) => module in moduleToLanguage)
    .filter(([module, name]) => key(module, name) in PyTamaroNames);
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="baseline" sx={{ overflowX: 'auto' }} marginLeft={1}>
        {(knownNames?.length || 0) > 0 && (
          <Typography variant="body2">
            Docs:
          </Typography>
        )}
        {knownNames?.map(([module, name], idx) => (
          <PyTamaroAPI
              // eslint-disable-next-line react/no-array-index-key
            key={`${key(module, name)}-${idx}`}
            name={name}
            language={moduleToLanguage[module]}
            activityVariant={activityVariant}
            smallerFont
          />
        ))}
        {knownNames === undefined
          && <Typography variant="body2" sx={{ color: '#dddddd' }}>Syntax Error</Typography>}
      </Stack>
    </Box>
  );
}
