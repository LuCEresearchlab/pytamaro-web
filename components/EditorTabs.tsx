import { Close } from '@mui/icons-material';
import { Box, IconButton, Tab, Tabs } from '@mui/material';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import theme from '../src/theme';

export default function EditorTabs({
  fileNames,
  activeFile,
  onSelect,
  onClose,
}: {
  fileNames: string[];
  activeFile: string;
  onSelect: (name: string) => void;
  onClose: (name: string) => void;
}) {
  const { t } = useLocalTranslation(['common']);

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
            sx={{
              minHeight: 36,
              textTransform: 'none',
              '&:not(:last-of-type)': {
                borderRight: `1px solid ${theme.palette.divider}`,
              },
            }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {name}
                <IconButton
                  size='small'
                  aria-label={t('closeFileTab', { name })}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(name);
                  }}
                  sx={{ padding: 0, marginLeft: 1 }}
                >
                  <Close fontSize='inherit' />
                </IconButton>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
