import { Button } from '@mui/material';
import { playgroundPathname } from '../src/urlUtils';
import { joinLines } from '../src/sourceUtils';
import { PlayCircle } from '@mui/icons-material';

export default function TryItButton({ code }: { code: string[] | string }) {
  const rawCode = typeof code === 'string' ? code : joinLines(code);
  return (
    <Button
      variant='outlined'
      size='small'
      href={playgroundPathname(rawCode)}
      endIcon={<PlayCircle />}
    >
      Try it!
    </Button>
  );
}
