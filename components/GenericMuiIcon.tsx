import { Icon } from '@mui/material';
import { snakeCase } from 'lodash';

// This component "loads" an arbitrary Material icon by name using the font
// (which is less ideal than using SVG icons, but avoids importing and bundling
// all of them).

export default function GenericMuiIcon({
  iconName,
  fontSize,
  color = 'inherit',
}: {
  iconName: string;
  fontSize: string;
  color?: 'inherit' | 'primary' | 'secondary';
}) {
  return (
    <Icon color={color} sx={{ fontSize }}>
      {snakeCase(iconName)}
    </Icon>
  );
}
