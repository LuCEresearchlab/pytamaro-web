import Grid from '@mui/material/Grid2';

export default function CentralContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Grid size={{ xs: 12, lg: 8 }}>{children}</Grid>;
}
