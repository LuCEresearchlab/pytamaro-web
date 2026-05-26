/* eslint-disable @next/next/no-img-element */
import { Typography } from '@mui/material';
import { useState } from 'react';
import logAnalyticsEvent, {
  AnalyticsEventName,
} from '../../src/analyticsEvent';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import { ActivityVariant } from '../../src/schemas/activitySchema';
import { JudiciousElement } from '../../src/schemas/documentation';
import { EventName, storeDbEvent } from '../../src/storeDbEvent';
import theme from '../../src/theme';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import DocElementCard from './DocElementCard';
import { iconPath } from './utils';

export default function DocElement({
  module,
  element,
  activityVariant,
  smallerFont,
  highlighted = false,
}: {
  module: string;
  element: JudiciousElement;
  activityVariant: ActivityVariant;
  smallerFont: boolean;
  highlighted?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const { metadata } = useLocalProfile();

  const handleClick = () => {
    logAnalyticsEvent(AnalyticsEventName.APIDocsPopover, {
      name: `${module}.${element.name}`,
    });
    storeDbEvent(EventName.APILookup, metadata, {
      activityVariant,
      name: element.name,
      module,
    });
  };

  const size = smallerFont ? '0.8em' : '1em';

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return element ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        borderRadius: '0.5em',
        backgroundColor: highlighted
          ? theme.palette.action.selected
          : hover
            ? theme.palette.action.hover
            : 'transparent',
        cursor: 'pointer',
        lineHeight: 1,
        paddingLeft: theme.spacing(0.25),
        paddingRight: theme.spacing(0.25),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Popover placement='right'>
        <PopoverTrigger onClick={handleClick} asChild>
          <span>
            <img
              src={iconPath(module)}
              style={{
                height: size,
                width: size,
                display: 'inline-block',
                transform: `translateY(.${smallerFont ? '1' : '2'}em)`,
                marginRight: '0.1em',
                userSelect: 'none',
              }}
              alt='Module logo'
            />
            <Typography
              component='span'
              style={{
                color: theme.pytamaro.palette.darkerBlue,
                fontSize: smallerFont
                  ? '0.8em'
                  : `${theme.pytamaro.monospaceFontSizeRatio}em`,
                fontFamily: theme.pytamaro.monospaceFontFamily,
              }}
              translate='no'
            >
              {element.name}
            </Typography>
          </span>
        </PopoverTrigger>
        <PopoverContent>
          <DocElementCard
            module={module}
            element={element}
            sx={{ maxHeight: '95vh', overflowY: 'auto' }}
          />
        </PopoverContent>
      </Popover>
    </span>
  ) : null;
}
