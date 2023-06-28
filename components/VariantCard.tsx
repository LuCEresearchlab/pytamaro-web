import {
  Box,
  Card, CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import getLanguageDisplayName from '../src/internationalization';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import {
  Activity, ActivityVariant,
  languageInfoForVariant,
} from '../src/schemas/activitySchema';
import { activityVariantPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';
import ActivityStatusBadge, { activityVariantStatus } from './ActivityStatusBadge';

function MaybeActionArea({ disabled, children, onClick }:
{ disabled: boolean, children: JSX.Element, onClick: () => void }) {
  if (disabled) {
    return children;
  }
  return (
    <CardActionArea onClick={onClick}>
      {children}
    </CardActionArea>
  );
}

export default function VariantCard({
  activityWithVariant, noVariantInfo = false, noInProgress = false, clickingDisabled = false, width = '100%',
} :
{ activityWithVariant : {
  activity: Activity,
  variant: ActivityVariant,
},
noVariantInfo?: boolean,
noInProgress?: boolean,
clickingDisabled?: boolean,
width?: string,
}) {
  const { metadata } = useLocalProfile();
  const router = useRouter();
  const handleClick = (variant: ActivityVariant) => {
    router.push(activityVariantPathname(variant));
  };
  const { activity, variant } = activityWithVariant;
  const langInfo = languageInfoForVariant(activity, variant);
  return (
    <Box sx={{ width }}>
      <ActivityStatusBadge
        status={activityVariantStatus(metadata.activities, variant)}
        small
        noInProgress={noInProgress}
      >
        <Card
          sx={{
            width, height: '100%',
          }}
        >
          <MaybeActionArea disabled={clickingDisabled} onClick={() => handleClick(variant)}>
            <>
              <ActivityCardMedia activity={activity} variant={variant} />
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {langInfo.title}
                </Typography>
                {!noVariantInfo && (
                <Typography variant="body2" color="text.secondary">
                  {`${getLanguageDisplayName(variant.language)} - ${variant.version}`}
                </Typography>
                )}
              </CardContent>
            </>
          </MaybeActionArea>
        </Card>
      </ActivityStatusBadge>
    </Box>
  );
}
