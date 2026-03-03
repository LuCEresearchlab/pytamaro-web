import { Box, Tooltip } from '@mui/material';
import { useEffect, useRef } from 'react';
import theme from '../../src/theme';

const COMPACT_INPUT_AREA_BACKGROUND_COLOR = theme.palette.grey[300];

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
    <Box sx={{ display: 'inline-block' }}>
      <Tooltip
        arrow
        placement={editable ? 'bottom' : 'right'}
        title={editable ? 'Type your input and press Enter' : 'User input'}
      >
        <pre
          ref={inputRef}
          style={{
            outline: 'none',
            borderBottom:
              '1px solid ' +
              (editable ? theme.palette.primary.main : theme.palette.grey[500]),
            backgroundColor: COMPACT_INPUT_AREA_BACKGROUND_COLOR,
            margin: 0,
            minWidth: editable ? '3ch' : undefined,
          }}
          contentEditable={editable ? 'plaintext-only' : false}
          onInput={() => {
            if (inputRef.current) {
              const text = inputRef.current.innerText;
              const eolIndex = text.indexOf('\n');
              if (eolIndex !== -1) {
                inputRef.current.innerText = text.slice(0, eolIndex);
              }
            }
          }}
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
      </Tooltip>
    </Box>
  );
}
