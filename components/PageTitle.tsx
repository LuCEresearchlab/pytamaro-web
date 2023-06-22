import { Typography } from '@mui/material';

export default function PageTitle({ children } : { children: React.ReactNode }) {
  return <Typography variant="h3" align="center" marginTop={3} marginBottom={6}>{children}</Typography>;
}
