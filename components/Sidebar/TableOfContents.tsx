/* Adapted from https://github.com/mui/material-ui/blob/6444a85dc811caac6232ba00230a93b31074fc40/docs/src/modules/components/AppTableOfContents.js */

/* eslint-disable react/no-danger */
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import throttle from 'lodash/throttle';
import Link from 'next/link';
import * as React from 'react';
import { RefObject } from 'react';
import SidebarTitle from './SidebarTitle';

const Nav = styled('nav')(({ theme }) => ({
  top: theme.spacing(8),
  position: 'sticky',
  paddingTop: theme.spacing(1),
  paddingRight: theme.spacing(2),
  display: 'block',
  float: 'right',
}));

const NavLabel = styled(SidebarTitle)(({ theme }) => ({
  paddingLeft: `calc(1px + ${theme.spacing(1)})`,
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

export default function TableOfContents({
  elementRef, selector, title, initialized,
} :
{ elementRef: RefObject<HTMLElement>, selector: string, title: string, initialized: boolean }) {
  const [items, setItems] = React.useState<TOCItem[]>([]);
  React.useEffect(() => {
    if (elementRef.current && initialized) {
      const headings = Array.from(elementRef.current.querySelectorAll(selector)).map((heading) => ({
        text: heading.textContent || '',
        hash: heading.id,
      }));
      setItems(headings);
    }
  }, [elementRef, selector, initialized]);

  const [activeState, setActiveState] = React.useState<string | null>(null);
  const clickedRef = React.useRef(false);
  const unsetClickedRef = React.useRef(null);
  const findActiveIndex = React.useCallback(() => {
    // Don't set the active index based on scroll if a link was just clicked
    if (clickedRef.current) {
      return;
    }

    let active;
    for (let i = 0; i < items.length; i += 1) {
      // No hash if we're near the top of the page
      if (document.documentElement.scrollTop < 200) {
        active = { hash: null };
        break;
      }

      const item = items[i];
      const node = document.getElementById(item.hash);

      if (
        node
        && node.getBoundingClientRect().top > -document.documentElement.clientHeight / 4
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
          <NavLabel>{title}</NavLabel>
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
