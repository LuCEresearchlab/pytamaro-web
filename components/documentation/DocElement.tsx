/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import logAnalyticsEvent, { AnalyticsEventName } from '../../src/analyticsEvent';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import { ActivityVariant } from '../../src/schemas/activitySchema';
import { JudiciousConstant, JudiciousFunction, JudiciousType } from '../../src/schemas/documentation';
import { EventName, storeDbEvent } from '../../src/storeDbEvent';
import theme from '../../src/theme';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import FunctionDocumentation from './FunctionDocumentation';
import TypeConstantDocumentation from './TypeConstantDocumentation';
import { iconPath } from './utils';

export default function DocElement({
  module, element, activityVariant, smallerFont,
} :
{ module: string, element: JudiciousFunction | JudiciousConstant | JudiciousType,
  activityVariant: ActivityVariant, smallerFont: boolean }) {
  const [hover, setHover] = useState(false);
  const { metadata } = useLocalProfile();

  const handleClick = () => {
    logAnalyticsEvent(AnalyticsEventName.APIDocsPopover, { name: `${module}.${element.name}` });
    storeDbEvent(EventName.APILookup, metadata, {
      activityVariant, name: element.name, module,
    });
  };

  return (element ? (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        borderRadius: '0.5em',
        backgroundColor: hover ? theme.palette.action.hover : 'transparent',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Popover placement="right">
        <PopoverTrigger onClick={handleClick}>
          <img
            src={iconPath(module)}
            style={{
              height: smallerFont ? '0.8em' : '1em', width: 'auto', display: 'inline-block', transform: `translateY(.${smallerFont ? '1' : '2'}em)`, marginRight: '0.1em',
            }}
            alt="Module logo"
          />
          <Typography
            component="span"
            style={{
              color: theme.pytamaro.redColor,
              fontSize: smallerFont ? '0.8em' : '1em',
              fontFamily: theme.pytamaro.monospaceFontFamily,
            }}
            translate="no"
          >
            {element.name}
          </Typography>
        </PopoverTrigger>
        <PopoverContent>
          <Card elevation={0}>
            <CardContent sx={{ pb: 1, minWidth: '60ch', maxWidth: '90ch' }}>
              {element.kind === 'function'
                ? <FunctionDocumentation fn={element} module={module} />
                : <TypeConstantDocumentation element={element} module={module} />}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  ) : null
  );
}
