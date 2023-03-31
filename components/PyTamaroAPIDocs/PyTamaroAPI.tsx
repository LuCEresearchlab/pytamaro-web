/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
import {
  Container, Popover, Typography, useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import logEvent, { EventName } from '../../src/AnalyticsEvent';
import names from './names';

export default function PyTamaroAPI({ name, lang } : { name: string, lang: string }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout>>();

  const nameWithLang = `${lang}.${name}`;
  const nameInfo = (names as any)[nameWithLang];

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // When the popover is open for at least 2 seconds, track the event.
    setTimeoutId(setTimeout(() => {
      logEvent(EventName.APIDocsPopover, { name: nameWithLang });
    }, 2000));
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const open = Boolean(anchorEl);

  const { isLoading, error, data } = useQuery({
    queryKey: [`docs-${nameWithLang}`],
    queryFn: () => axios.get(`https://readthedocs.org/api/v3/embed/?${new URLSearchParams({
      url: `https://pytamaro.readthedocs.io/en/stable/${nameInfo.url}.html`,
    })}`)
      .then((response) => {
        // We climb up the DOM tree one level to find the element that contains both
        // <dt> and <dd> (term and description).
        const tmpElement = document.createElement('div');
        tmpElement.innerHTML = response.data.content;
        const node = tmpElement.querySelector(`[id="${nameInfo.fqname}"]`)?.parentElement;
        return node?.outerHTML || '';
      }),
  });

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      flexWrap: 'wrap',
    }}
    >
      <img
        src="/favicon.ico"
        style={{
          height: '1em', width: 'auto', display: 'inline-block', transform: 'translateY(.2em)', paddingRight: '.1em',
        }}
        alt="PyTamaro icon"
      />
      <Typography
        component="span"
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        style={{
          color: theme.pytamaro.redColor,
          fontFamily: theme.pytamaro.monospaceFontFamily,
        }}
      >
        {name}
      </Typography>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
          ml: 0.5,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {isLoading ? <Typography component="span">Loading the documentation...</Typography> : null}
        {error ? <Typography component="span">Failed to load the documentation.</Typography> : null}
        {data ? <Container disableGutters maxWidth="md" className="rst-content" sx={{ p: 1 }} dangerouslySetInnerHTML={{ __html: data }} /> : null}
      </Popover>
    </span>
  );
}
