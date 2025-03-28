import Grid from '@mui/material/Unstable_Grid2';

export default function CentralContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Grid xs={12} lg={8}>
      {children}
    </Grid>
  );
}
