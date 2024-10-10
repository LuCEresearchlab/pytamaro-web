import {
  Card,
  Chip,
  Stack, TablePagination,
} from '@mui/material';
import { useState } from 'react';
import { ToolboxFunction } from '../../src/localStorage/schema';
import useLocalToolbox from '../../src/localStorage/useLocalToolbox';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import { toolboxFunctionPathname } from '../../src/urlUtils';
import useWindowSize from '../../src/useWindowSize';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import ToolboxFunctionCardContent from '../ToolboxFunctionCardContent';
import { SIDEBAR_CHIPS_FONT_SIZE, SIDEBAR_CHIPS_WIDTH } from './Sidebar';
import SidebarItem from './SidebarItem';

function SidebarToolboxFunction({ fn, skipPopup }: { fn: ToolboxFunction, skipPopup: boolean }) {
  const handleClick = () => {
    if (skipPopup) window.open(toolboxFunctionPathname(fn.name));
  };
  const element = (
    <Chip
      label={fn.name}
      size="small"
      variant="filled"
      sx={{
        width: SIDEBAR_CHIPS_WIDTH,
        fontFamily: theme.pytamaro.monospaceFontFamily,
        fontSize: SIDEBAR_CHIPS_FONT_SIZE,
      }}
      clickable
      onClick={handleClick}
    />
  );

  if (skipPopup) {
    return element;
  }
  return (
    <Popover placement="right">
      <PopoverTrigger>
        {element}
      </PopoverTrigger>
      <PopoverContent>
        <Card>
          <ToolboxFunctionCardContent fn={fn} summary />
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export default function ToolboxListSidebar({ skipPopup = false } : { skipPopup?: boolean }) {
  const { list } = useLocalToolbox();
  const { height } = useWindowSize();
  const { t } = useLocalTranslation();
  const [page, setPage] = useState(0);
  const fnsPerPage = height <= 1080 ? 10 : 20;
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const toolboxFunctions = list();
  return toolboxFunctions.length > 0 ? (
    <SidebarItem title={t('myToolbox')}>
      <Stack
        spacing={1}
      >
        {toolboxFunctions.slice(fnsPerPage * page, fnsPerPage * (page + 1)).map((fn) => (
          <SidebarToolboxFunction key={fn.name} fn={fn} skipPopup={skipPopup} />
        ))}
      </Stack>
      {toolboxFunctions.length > fnsPerPage ? (
        <TablePagination
          component="div"
          count={toolboxFunctions.length}
          page={page}
          rowsPerPageOptions={[]}
          onPageChange={handleChangePage}
          rowsPerPage={fnsPerPage}
          sx={{
            '& .MuiTablePagination-spacer': {
              display: 'none',
            },
          }}
        />
      ) : null}
    </SidebarItem>
  ) : null;
}
