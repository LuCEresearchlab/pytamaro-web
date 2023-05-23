/* Adapted from https://github.com/mui/material-ui/blob/6444a85dc811caac6232ba00230a93b31074fc40/docs/src/modules/components/AppTableOfContents.js */

/* eslint-disable react/no-danger */
import * as React from 'react';
import throttle from 'lodash/throttle';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

const Nav = styled('nav')(({ theme }) => ({
  top: theme.spacing(8),
  position: 'sticky',
  paddingTop: theme.spacing(1),
  paddingRight: theme.spacing(2),
  display: 'block',
}));

const NavLabel = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  paddingLeft: theme.spacing(1.4),
  fontSize: theme.typography.pxToRem(11),
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'uppercase',
  letterSpacing: '.08rem',
  color: theme.palette.grey[600],
}));

const NavList = styled(Typography)({
  padding: 0,
  margin: 0,
  listStyle: 'none',
});

const NavItem = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean, theme: any }>(({ active, theme }) => {
  const activeStyles = {
    borderLeftColor: theme.pytamaro.redColor,
    color: theme.pytamaro.redColor,
    '&:hover': {
      borderLeftColor: theme.palette.primary,
      color: theme.palette.primary,
    },
  };
  return [
    {
      fontSize: theme.typography.pxToRem(13),
      padding: theme.spacing(0, 1, 0, 1),
      margin: theme.spacing(0.5, 0, 1, 0),
      borderLeft: '1px solid transparent',
      boxSizing: 'border-box',
      fontWeight: 500,
      textDecoration: 'none',
      webkitBoxDecorationBreak: 'clone',
      boxDecorationBreak: 'clone',
      '&:hover': {
        borderLeftColor: theme.palette.grey[400],
        color: theme.palette.grey[600],
      },
      ...(!active && {
        color: theme.palette.text.primary,
      }),
      ...(active && activeStyles),
      '&:active': activeStyles,
    },
  ];
});

const noop = () => {};

function useThrottledOnScroll(callback: any, delay: number) {
  const throttledCallback = React.useMemo(
    () => (callback ? throttle(callback, delay) : noop),
    [callback, delay],
  );

  React.useEffect(() => {
    if (throttledCallback === noop) {
      return undefined;
    }

    window.addEventListener('scroll', throttledCallback);
    return () => {
      window.removeEventListener('scroll', throttledCallback);
      // @ts-ignore
      throttledCallback.cancel();
    };
  }, [throttledCallback]);
}

interface TOCItem {
  text: string;
  hash: string;
}

export default function TableOfContents() {
  const [items, setItems] = React.useState<TOCItem[]>([]);
  React.useEffect(() => {
    const headings = Array.from(document.querySelectorAll('h2[id], h3[id]')).map((heading) => ({
      text: heading.textContent || '',
      hash: heading.id,
    }));
    setItems(headings);
  }, []);

  const [activeState, setActiveState] = React.useState<string | null>(null);
  const clickedRef = React.useRef(false);
  const unsetClickedRef = React.useRef(null);
  const findActiveIndex = React.useCallback(() => {
    // Don't set the active index based on scroll if a link was just clicked
    if (clickedRef.current) {
      return;
    }

    let active;
    for (let i = items.length - 1; i >= 0; i -= 1) {
      // No hash if we're near the top of the page
      if (document.documentElement.scrollTop < 200) {
        active = { hash: null };
        break;
      }

      const item = items[i];
      const node = document.getElementById(item.hash);

      if (
        node
        && node.offsetTop
          < document.documentElement.scrollTop + document.documentElement.clientHeight / 8
      ) {
        active = item;
        break;
      }
    }

    if (active && activeState !== active.hash) {
      setActiveState(active.hash);
    }
  }, [activeState, items]);

  // Corresponds to 10 frames at 60 Hz
  useThrottledOnScroll(items.length > 0 ? findActiveIndex : null, 166);

  const handleClick = (hash: string) => () => {
    // Used to disable findActiveIndex if the page scrolls due to a click
    clickedRef.current = true;
    // @ts-ignore
    unsetClickedRef.current = setTimeout(() => {
      clickedRef.current = false;
    }, 1000);

    if (activeState !== hash) {
      setActiveState(hash);
    }
  };

  React.useEffect(
    () => () => {
      // @ts-ignore
      clearTimeout(unsetClickedRef.current);
    },
    [],
  );

  const itemLink = (item: TOCItem) => (
    // @ts-ignore
    <NavItem
      href={`#${item.hash}`}
      onClick={handleClick(item.hash)}
      active={activeState === item.hash}
    >
      <span dangerouslySetInnerHTML={{ __html: item.text }} />
    </NavItem>
  );

  return (
    <Nav>
      {items.length > 0 ? (
        <>
          <NavLabel gutterBottom>Table Of Contents</NavLabel>
          <NavList>
            {items.map((item) => (
              <li key={item.text}>
                {itemLink(item)}
              </li>
            ))}
          </NavList>
        </>
      ) : null}
    </Nav>
  );
}
