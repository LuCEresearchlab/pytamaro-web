/* eslint-disable @next/next/no-img-element */
import {
  Link, useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import { activityVariantPathname } from '../src/urlUtils';
import { activityVariantFromId } from '../src/schemas/activitySchema';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';

export default function ActivityLink({ id, fragment = undefined, children }:
{ id: string, fragment?: string, children: React.ReactNode }) {
  const theme = useTheme();
  const router = useRouter();

  const variant = activityVariantFromId(id);

  const target = `${activityVariantPathname(
    variant.authorSlug,
    variant.activitySlug,
    variant.language,
    variant.version,
  )}${fragment ? `#${fragment}` : ''}`;

  const handleClick = () => {
    logAnalyticsEvent(AnalyticsEventName.ActivityLink, { variant, fragment });
    router.push(target);
    return false;
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
