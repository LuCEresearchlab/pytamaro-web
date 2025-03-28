/* Adapted from https://github.com/mui/material-ui/blob/6444a85dc811caac6232ba00230a93b31074fc40/docs/src/modules/components/AppTableOfContents.js */

/* eslint-disable react/no-danger */
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import throttle from 'lodash/throttle';
import Link from 'next/link';
import * as React from 'react';
import { RefObject } from 'react';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import SidebarItem from './SidebarItem';

const NavList = styled(Typography)({
  padding: 0,
  margin: 0,
  listStyle: 'none',
  marginLeft: `calc(-1 * (1px + ${theme.spacing(1)}))`,
});

const NavItem = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'indent',
})<{ active: boolean; indent: boolean }>(({ active, indent }) => {
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
      padding: theme.spacing(0, 1, 0, indent ? 2.5 : 1),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      if ('cancel' in throttledCallback) {
        throttledCallback.cancel();
      }
    };
  }, [throttledCallback]);
}

interface TOCItem {
  text: string;
  hash: string;
  indent: boolean;
}

export default function TableOfContents({
  elementRef,
  selector,
  titleKey,
  initialized,
}: {
  elementRef: RefObject<HTMLElement>;
  selector: string;
  titleKey: string;
  initialized: boolean;
}) {
  const { t } = useLocalTranslation();
  const [items, setItems] = React.useState<TOCItem[]>([]);
  React.useEffect(() => {
    if (elementRef.current && initialized) {
      const elements = Array.from(
        elementRef.current.querySelectorAll<HTMLElement>(selector),
      ).map((element) => ({
        text: element.dataset.tocTitle || element.textContent || '',
        hash: element.id,
        indent:
          element.dataset.tocIndent === 'true' ||
          (element.tagName[0] === 'H' && parseInt(element.tagName[1], 10) >= 3),
      }));
      setItems(elements);
    }
  }, [elementRef, selector, initialized]);

  const [activeState, setActiveState] = React.useState<string | null>(null);
  const clickedRef = React.useRef(false);
  const unsetClickedRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
        node &&
        node.getBoundingClientRect().top >
          -document.documentElement.clientHeight / 4
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
    unsetClickedRef.current = setTimeout(() => {
      clickedRef.current = false;
    }, 1000);

    if (activeState !== hash) {
      setActiveState(hash);
    }
  };

  React.useEffect(
    () => () => {
      if (unsetClickedRef.current) {
        clearTimeout(unsetClickedRef.current);
      }
    },
    [],
  );

  const itemLink = (item: TOCItem) => (
    <NavItem
      href={`#${item.hash}`}
      onClick={handleClick(item.hash)}
      active={activeState === item.hash}
      indent={item.indent}
    >
      <span dangerouslySetInnerHTML={{ __html: item.text }} />
    </NavItem>
  );

  return items.length > 0 ? (
    <SidebarItem title={t(titleKey)}>
      <NavList>
        {items.map((item) => (
          <li key={item.text}>{itemLink(item)}</li>
        ))}
      </NavList>
    </SidebarItem>
  ) : null;
}
