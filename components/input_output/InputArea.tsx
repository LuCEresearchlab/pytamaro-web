import { Keyboard } from '@mui/icons-material';
import { Badge, Box, Tooltip } from '@mui/material';
import { useEffect, useRef } from 'react';
import theme from '../../src/theme';
import { OUTPUT_AREA_BACKGROUND_COLOR } from './OutputArea';

export const INPUT_BEGIN = '@@@PYTAMARO_INPUT_BEGIN@@@';
export const INPUT_END = '@@@PYTAMARO_INPUT_END@@@';

export default function InputArea({
  initialContent = '',
  onSubmit = undefined,
}: {
  initialContent?: string;
  onSubmit?: (input: string) => void | undefined;
}) {
  const editable = onSubmit !== undefined;
  const inputRef = useRef<HTMLPreElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <Box sx={{ display: 'inline-block' }}>
      <Tooltip
        arrow
        placement='right'
        title={editable ? 'Type your input and press Enter' : 'User input'}
      >
        <Badge
          sx={{
            verticalAlign: 'baseline',
            '& .MuiBadge-badge': {
              right: 0,
              bottom: 2,
              paddingLeft: 0.75,
              paddingRight: 0.75,
            },
          }}
          badgeContent={
            <Box sx={{
              padding: 0.25,
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  width: 24,
                  height: 16,
                  zIndex: 0,
                }}
              />
              <Keyboard fontSize='small' sx={{ position: 'relative', zIndex: 1, }} />
            </Box>
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <pre
            ref={inputRef}
            style={{
              border: `1px dashed ${theme.palette.grey[600]}`,
              margin: 0,
              paddingLeft: theme.spacing(0.5),
              paddingRight: theme.spacing(2),
              minWidth: '5ch',
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
            {initialContent}
          </pre>
        </Badge>
      </Tooltip>
    </Box>
  );
}
