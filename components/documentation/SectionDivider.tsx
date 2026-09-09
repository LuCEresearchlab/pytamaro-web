import { Divider, Typography } from '@mui/material';

export default function SectionDivider({ title }: { title: string }) {
  return (
    <Divider sx={{ mt: 1.5, mb: 1 }}>
      <Typography
        component={'span'}
        variant='body2'
        sx={{
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {title}
      </Typography>
    </Divider>
  );
}
