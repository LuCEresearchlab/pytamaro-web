import { Close, Code, PlayArrow } from '@mui/icons-material';
import { Button, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { compressCode } from '../../src/codeSharing';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  build_python_source,
  build_python_view,
  PythonLine,
  PythonToken,
} from '../../src/tide/python_view';
import { useStore } from '../../src/tide/store';
import { getMissingParameterDiv, getNodeDiv } from '../../src/tide/utils';
import { evaluatorPathname } from '../../src/urlUtils';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

const HIGHLIGHT_CLASS = 'python_view_highlight';

export default function PythonPanel() {
  const { t } = useLocalTranslation(['tide']);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const imported_definitions = useStore((state) => state.imported_definitions);

  const lines = useMemo(
    () => build_python_view(nodes, edges, imported_definitions),
    [edges, imported_definitions, nodes],
  );

  const open_in_evaluator = useCallback(
    async (line: PythonLine) => {
      // Open the new tab synchronously, within the user gesture, so that
      // browsers do not block it while the code is being compressed.
      const target = window.open('', '_blank');

      const source = build_python_source(lines, line.root_id);
      if (source === undefined) {
        target?.close();
        return;
      }

      try {
        const compressed = await compressCode(source);

        if (target) {
          const url = new URL(evaluatorPathname(), window.location.href);
          url.searchParams.set('c', compressed);
          target.opener = null;
          target.location.replace(url.toString());
        } else {
          await router.push({
            pathname: evaluatorPathname(),
            query: { c: compressed },
          });
        }
      } catch {
        target?.close();
      }
    },
    [lines, router],
  );

  const clear_highlight = useCallback(() => {
    document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((element) => {
      element.classList.remove(HIGHLIGHT_CLASS);
    });
  }, []);

  const highlight = useCallback(
    (token: PythonToken) => {
      clear_highlight();
      if (token.node_id === undefined) return;

      if (token.parameter !== undefined) {
        const missing_parameter = getMissingParameterDiv(
          token.node_id,
          token.parameter,
        );
        if (missing_parameter !== undefined) {
          missing_parameter.classList.add(HIGHLIGHT_CLASS);
          return;
        }
      }

      getNodeDiv(token.node_id)?.classList.add(HIGHLIGHT_CLASS);
    },
    [clear_highlight],
  );

  useEffect(() => clear_highlight, [clear_highlight]);

  const handle_open_change = useCallback(
    (next_open: boolean) => {
      if (!next_open) clear_highlight();
      setOpen(next_open);
    },
    [clear_highlight],
  );

  if (lines.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <Popover
        placement='top-start'
        open={open}
        onOpenChange={handle_open_change}
      >
        <PopoverTrigger onClick={() => handle_open_change(!open)}>
          <Tooltip
            arrow
            title={t(open ? 'pythonPanel.hide' : 'pythonPanel.show')}
            placement='right'
          >
            <Button
              size='small'
              sx={{
                pointerEvents: 'auto',
                textTransform: 'none',
                fontWeight: 'bold',
                color: 'gray',
                backgroundColor: '#eee',
                border: '1px solid gray',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#ddd' },
              }}
              startIcon={<Code />}
              aria-expanded={open}
            >
              Python
            </Button>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: 'max-content',
              maxWidth: 'min(560px, 90vw)',
              maxHeight: '55vh',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px 6px 14px',
                borderBottom: '1px solid #ddd',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Code color='primary' fontSize='small' />
              <Typography
                variant='subtitle2'
                sx={{ flex: 1, fontWeight: 'bold' }}
              >
                {t('pythonPanel.title')}
              </Typography>
              <Tooltip arrow title={t('pythonPanel.hide')} placement='top'>
                <IconButton
                  size='small'
                  aria-label={t('pythonPanel.hide')}
                  onClick={() => handle_open_change(false)}
                >
                  <Close fontSize='small' />
                </IconButton>
              </Tooltip>
            </div>

            <div
              style={{
                padding: '10px 14px',
                overflow: 'auto',
                color: '#1b1b1b',
                backgroundColor: '#f8fafc',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {lines.map((line) => (
                <div
                  key={line.root_id}
                  className={`python_view_line${line.kind === 'expression' ? ' python_view_line_expression' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    minHeight: '1.5em',
                  }}
                >
                  <code
                    className='python_view_line_code'
                    style={{
                      flex:
                        line.kind === 'expression' ? '0 1 auto' : '1 1 auto',
                      minWidth: 0,
                    }}
                  >
                    {line.tokens.map((token, token_index) => {
                      const token_key = `${line.root_id}_${token_index}`;
                      return (
                        <span
                          key={token_key}
                          className='python_view_token'
                          data-node-id={token.node_id}
                          style={
                            token.missing === true
                              ? {
                                  borderRadius: 3,
                                  padding: '1px 0',
                                  color: '#999',
                                  fontStyle: 'italic',
                                }
                              : { borderRadius: 3, padding: '1px 0' }
                          }
                          onMouseEnter={() => highlight(token)}
                          onMouseLeave={clear_highlight}
                        >
                          {token.text}
                        </span>
                      );
                    })}
                  </code>
                  {line.kind === 'expression' && (
                    <Tooltip
                      arrow
                      title={t('pythonPanel.openInEvaluator')}
                      placement='right'
                    >
                      <IconButton
                        size='small'
                        color='primary'
                        className='python_view_open'
                        aria-label={t('pythonPanel.openInEvaluator')}
                        sx={{ padding: '2px', marginLeft: 'auto' }}
                        onClick={() => void open_in_evaluator(line)}
                      >
                        <PlayArrow fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '6px 14px 8px',
                color: '#777',
                fontSize: '0.8rem',
                borderTop: '1px solid #eee',
              }}
            >
              {t('pythonPanel.hint')}
            </div>
          </Paper>
        </PopoverContent>
      </Popover>
    </div>
  );
}
