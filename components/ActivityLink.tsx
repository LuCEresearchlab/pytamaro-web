/* eslint-disable @next/next/no-img-element */
import {
  Link, useTheme,
} from '@mui/material';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import { activityVariantFromId } from '../src/schemas/activitySchema';
import { activityVariantPathname } from '../src/urlUtils';

export default function ActivityLink({ id, fragment = undefined, children }:
{ id: string, fragment?: string, children: React.ReactNode }) {
  const theme = useTheme();
  const variant = activityVariantFromId(id);
  const target = `${activityVariantPathname(variant)}${fragment ? `#${fragment}` : ''}`;

  const handleClick = () => {
    logAnalyticsEvent(AnalyticsEventName.ActivityLink, { variant, fragment });
    return true;
  };

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
      <Link
        href={target}
        underline="none"
        onClick={handleClick}
        style={{
          color: theme.pytamaro.redColor,
          fontSize: '1em',
          fontWeight: 'bold',
        }}
      >
        {children}
      </Link>
    </span>
  );
}
