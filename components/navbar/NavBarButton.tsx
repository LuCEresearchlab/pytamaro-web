import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import theme from '../../src/theme';

export default function NavBarButton({
  children,
  label,
  onClick = undefined,
  disabled = false,
  testId = undefined,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: IconButtonProps['onClick'];
  disabled?: boolean;
  testId?: string;
}) {
  // <div>s are necessary for Tooltip to work properly in all cases
  return (
    <div>
      <Tooltip arrow title={label}>
        <div>
          <IconButton
            data-testid={testId}
            sx={{
              color: disabled
                ? theme.palette.text.disabled
                : theme.palette.text.primary,
            }}
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </IconButton>
        </div>
      </Tooltip>
    </div>
  );
}
