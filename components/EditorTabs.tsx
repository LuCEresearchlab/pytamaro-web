import { Close } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import type { ReactNode } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import theme from '../src/theme';

export type EditorViewToggle = {
  value: string;
  options: readonly {
    value: string;
    label: string;
    icon: ReactNode;
  }[];
  onChange: (value: string) => void;
};

export default function EditorTabs({
  fileNames,
  activeFile,
  runningFile,
  onSelect,
  onClose,
  viewToggle = undefined,
}: {
  fileNames: string[];
  activeFile: string;
  runningFile: string | null;
  onSelect: (name: string) => void;
  onClose: (name: string) => void;
  viewToggle?: EditorViewToggle;
}) {
  const { t } = useLocalTranslation(['ide']);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <Tabs
        value={activeFile}
        onChange={(_, value: string) => onSelect(value)}
        variant='scrollable'
        scrollButtons='auto'
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 36,
          '& .Mui-selected': {
            backgroundColor: theme.pytamaro.palette.background.light,
          },
        }}
        data-testid='editor-tabs'
      >
        {fileNames.map((name) => (
          <Tab
            key={name}
            value={name}
            component='div'
            onMouseUp={(e) => {
              if (e.button === 1 && runningFile !== name) {
                // Auxiliary button (mouse wheel): close tab
                e.stopPropagation();
                onClose(name);
              }
            }}
            sx={{
              minWidth: 0,
              minHeight: 36,
              textTransform: 'none',
              '&:not(:last-of-type)': {
                borderRight: `1px solid ${theme.palette.divider}`,
              },
            }}
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                  maxWidth: '100%',
                }}
              >
                <Box
                  component='span'
                  sx={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </Box>
                <IconButton
                  size='small'
                  aria-label={
                    name === runningFile
                      ? t('activeFileTab', { name })
                      : t('closeFileTab', { name })
                  }
                  disabled={name === runningFile}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(name);
                  }}
                  sx={{ padding: 0, marginLeft: 1, flexShrink: 0 }}
                >
                  {name === runningFile ? (
                    <CircularProgress
                      size={16}
                      color={activeFile === name ? undefined : 'inherit'}
                    />
                  ) : (
                    <Close fontSize='inherit' />
                  )}
                </IconButton>
              </Box>
            }
          />
        ))}
      </Tabs>
      {viewToggle !== undefined && (
        <ToggleButtonGroup
          exclusive
          size='small'
          value={viewToggle.value}
          onChange={(_, nextView: string | null) => {
            if (nextView !== null) {
              viewToggle.onChange(nextView);
            }
          }}
          data-testid='file-view-toggle'
          sx={{ flex: '0 0 auto', marginX: 1 }}
        >
          {viewToggle.options.map(({ value, label, icon }) => (
            <Tooltip key={value} arrow title={label}>
              <ToggleButton
                value={value}
                aria-label={label}
                data-testid={`file-view-${value}`}
              >
                {icon}
              </ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>
      )}
    </Box>
  );
}
