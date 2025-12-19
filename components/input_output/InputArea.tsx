import { Keyboard } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { useEffect, useRef } from 'react';
import theme from '../../src/theme';

export const INPUT_BEGIN = '@@@PYTAMARO_INPUT_BEGIN@@@';
export const INPUT_END = '@@@PYTAMARO_INPUT_END@@@';

export default function InputArea({
  initialContent = null,
  onSubmit = undefined,
}: {
  initialContent?: string | null;
  onSubmit?: (input: string) => void | undefined;
}) {
  const editable = onSubmit !== undefined;
  const inputRef = useRef<HTMLPreElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  // When this inputArea is non-editable, we need to ensure that the string is not empty
  // to avoid collapsing the pre element and keep the alignment on the baseline.
  let shownContent = initialContent;
  if (!editable && !shownContent) {
    shownContent = '\u200B'; // zero-width space
  }
  return (
    <Box sx={{
      display: 'inline-block',
      border: `1px dashed ${theme.palette.grey[600]}`,
      marginTop: theme.spacing(0.05),
      marginBottom: theme.spacing(0.05),
    }}>
      <Tooltip
        arrow
        placement='right'
        title={editable ? 'Type your input and press Enter' : 'User input'}
      >
        <Box sx={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: theme.spacing(0.5),
          paddingRight: theme.spacing(0.5),
        }}>
          <pre
            ref={inputRef}
            style={{
              margin: 0,
              minWidth: editable ? '5ch' : undefined,
            }}
            contentEditable={editable}
            onKeyDown={
              editable
                ? (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputText = e.currentTarget.innerText;
                    onSubmit(inputText);
                  }
                }
                : undefined
            }
          >
            {shownContent}
          </pre>
          <Keyboard
            fontSize='small'
            sx={{
              marginLeft: theme.spacing(0.5),
              color: theme.palette.common.white,
              backgroundColor: theme.palette.grey[600],
              borderRadius: '0.5em',
              paddingLeft: theme.spacing(0.75),
              paddingRight: theme.spacing(0.75),
              width: `calc(1em + ${theme.spacing(1.5)})`,
            }} />
        </Box>
      </Tooltip>
    </Box>
  );
}
