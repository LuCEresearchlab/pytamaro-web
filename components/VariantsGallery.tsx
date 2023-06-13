import {
  Card, CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { sortBy } from 'lodash';
import { useRouter } from 'next/router';
import getLanguageDisplayName from '../src/internationalization';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { isPlayground } from '../src/playground';
import {
  Activity, ActivityVariant, activityVariantId, languageInfoForVariant,
} from '../src/schemas/activitySchema';
import { isSpecialActivity } from '../src/specialActivities';
import { activityVariantPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';
import ActivityStatusBadge, { activityVariantStatus } from './ActivityStatusBadge';

export default function VariantsGallery({
  activitiesWithVariants,
} :
{ activitiesWithVariants : {
  activity: Activity,
  variant: ActivityVariant,
}[]
}) {
  const { metadata } = useLocalProfile();
  const router = useRouter();
  const handleClick = (v: ActivityVariant) => {
    router.push(activityVariantPathname(
      v.authorSlug,
      v.activitySlug,
      v.language,
      v.version,
    ));
  };
  const relevantActivitiesWithVariants = activitiesWithVariants.filter(
    ({ variant: v }) => (
      !isPlayground(v.authorSlug, v.activitySlug, v.language, v.version)
      && !isSpecialActivity(v.authorSlug, v.activitySlug, v.language, v.version)
    ),
  );
  if (relevantActivitiesWithVariants.length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ marginTop: 4, fontStyle: 'italic' }}>
        No activities found.
      </Typography>
    );
  }
  const sortedActivities = sortBy(relevantActivitiesWithVariants, ({ variant }) => {
    const status = activityVariantStatus(metadata.activities, variant);
    if (status === 'completed') {
      return 1;
    }
    if (status === 'in-progress') {
      return 0;
    }
    return 2;
  });
  return (
    <Grid container spacing={2} rowSpacing={4}>
      {sortedActivities.map(({ activity, variant }) => {
        const langInfo = languageInfoForVariant(activity, variant);
        const status = activityVariantStatus(metadata.activities, variant);
        if (status === 'initial') {
          return null;
        }
        return (
          <Grid
            xs={12}
            sm={6}
            lg={4}
            key={activityVariantId(variant)}
          >
            <ActivityStatusBadge status={activityVariantStatus(metadata.activities, variant)}>
              <Card
                sx={{
                  width: '100%', height: '100%',
                }}
              >
                <CardActionArea onClick={() => handleClick(variant)}>
                  <ActivityCardMedia activity={activity} variant={variant} />
                  <CardContent>
                    <Typography gutterBottom variant="h6">
                      {langInfo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {`${getLanguageDisplayName(variant.language)} - ${variant.version}`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </ActivityStatusBadge>
          </Grid>
        );
      })}
    </Grid>
  );
}
