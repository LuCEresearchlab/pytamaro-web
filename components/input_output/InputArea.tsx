import { Keyboard } from '@mui/icons-material';
import { Badge, Box, Tooltip } from '@mui/material';
import { useEffect, useRef } from 'react';
import theme from '../../src/theme';

export default function InputArea({
  initialContent = null,
  onSubmit = undefined,
  forceBadge = false,
}: {
  initialContent?: string | null;
  onSubmit?: (input: string) => void | undefined;
  forceBadge?: boolean;
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
        <Badge
          sx={{
            verticalAlign: 'baseline',
            '& .MuiBadge-badge': {
              bgcolor: theme.palette.grey[600],
              color: theme.palette.common.white,
              right: 0,
              bottom: 2,
              paddingLeft: 0.75,
              paddingRight: 0.75,
              display: forceBadge || editable ? 'inline-flex' : 'none',
            },
          }}
          badgeContent={
            <Box
              sx={{
                padding: 0.25,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 1,
                  width: 24,
                  height: 14,
                  zIndex: 0,
                }}
              />
              <Keyboard
                fontSize='small'
                sx={{ position: 'relative', zIndex: 1 }}
              />
            </Box>
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <pre
            ref={inputRef}
            style={{
              border: `1px dashed ${theme.palette.grey[600]}`,
              margin: 0,
              marginLeft: `calc(-1 * (1px + ${theme.spacing(0.5)}))`, // 1px for the border, 0.5 to compensate the left padding
              paddingLeft: theme.spacing(0.5),
              paddingRight: theme.spacing(0.5 + (editable ? 6 : 0)),
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
        </Badge>
      </Tooltip>
    </Box>
  );
}
