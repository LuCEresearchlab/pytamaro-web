import { Box } from '@mui/material';
import theme from '../../src/theme';

export default function CodeElement({
  children,
  type = false,
  bold = false,
}: {
  children: string;
  type?: boolean;
  bold?: boolean;
}) {
  const isSpace = children.trim().length === 0;
  const noMonospace = type || isSpace;
  return (
    <Box
      component={noMonospace ? 'span' : 'code'}
      sx={{ display: 'inline-block' }}
      fontFamily={noMonospace ? undefined : theme.pytamaro.monospaceFontFamily}
      fontWeight={bold ? 'bold' : 'normal'}
      fontStyle={type ? 'italic' : 'normal'}
      translate='no'
    >
      {children}
    </Box>
  );
}
