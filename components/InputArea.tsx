import { Keyboard } from '@mui/icons-material';
import { Badge } from '@mui/material';
import { useEffect, useRef } from 'react';
import theme from '../src/theme';

export default function InputArea({
  onSubmit,
}: {
  onSubmit: (input: string) => void;
}) {
  const inputRef = useRef<HTMLPreElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
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
      <pre
        ref={inputRef}
        style={{
          margin: 0,
          padding: theme.spacing(0.5),
          border: `1px dashed ${theme.palette.grey[600]}`,
          paddingRight: '2ch',
          minWidth: '6ch',
        }}
        contentEditable={true}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const inputText = e.currentTarget.innerText;
            onSubmit(inputText);
          }
        }}
      />
    </Badge>
  );
}
