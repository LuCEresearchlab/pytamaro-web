import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import getLanguageDisplayName from '../src/internationalization';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import {
  ActivityVariant,
  BasicActivity,
  languageInfoForVariant,
} from '../src/schemas/activitySchema';
import { activityVariantPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';
import ActivityStatusBadge, {
  activityVariantStatus,
} from './ActivityStatusBadge';

export default function VariantCard({
  activityWithVariant,
  noVariantInfo = false,
  noInProgress = false,
  width = '100%',
}: {
  activityWithVariant: {
    activity: BasicActivity;
    variant: ActivityVariant;
  };
  noVariantInfo?: boolean;
  noInProgress?: boolean;
  width?: string;
}) {
  const { metadata } = useLocalProfile();
  const { activity, variant } = activityWithVariant;
  const langInfo = languageInfoForVariant(activity, variant);
  const status = activityVariantStatus(metadata.activities, variant);
  return (
    <Box sx={{ width }}>
      <ActivityStatusBadge status={status} small noInProgress={noInProgress}>
        <Card
          sx={{
            width,
            height: '100%',
          }}
        >
          <CardActionArea
            disabled={status === 'initial'}
            href={activityVariantPathname(variant)}
            sx={{ height: '100%' }}
          >
            <>
              <ActivityCardMedia activity={activity} variant={variant} />
              <CardContent sx={{ height: '100%' }}>
                <Typography gutterBottom variant='h6'>
                  {langInfo.title}
                </Typography>
                {!noVariantInfo && (
                  <Typography variant='body2' color='text.secondary'>
                    {`${getLanguageDisplayName(variant.language)} - ${variant.version}`}
                  </Typography>
                )}
              </CardContent>
            </>
          </CardActionArea>
        </Card>
      </ActivityStatusBadge>
    </Box>
  );
}
