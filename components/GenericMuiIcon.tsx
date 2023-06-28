import * as Icons from '@mui/icons-material';

export default function GenericMuiIcon({ iconName }: { iconName: string }) {
  // @ts-ignore
  const Icon = Icons[iconName];
  if (!Icon) {
    throw new Error(`Icon "${iconName}" not found: double check that it is a valid Material UI icon name`);
  }
  return <Icon />;
}
