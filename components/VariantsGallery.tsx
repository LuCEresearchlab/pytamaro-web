import {
  Card, CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useRouter } from 'next/router';
import getLanguageDisplayName from '../src/internationalization';
import { isPlayground } from '../src/playground';
import { Activity, ActivityVariant, languageInfoForVariant } from '../src/schemas/activitySchema';
import { isSpecialActivity } from '../src/specialActivities';
import { activityVariantPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';

export default function VariantsGallery({
  activitiesWithVariants,
} :
{ activitiesWithVariants : {
  activity: Activity,
  variant: ActivityVariant,
}[]
}) {
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
  return (
    <Grid container spacing={2}>
      {relevantActivitiesWithVariants.map(({ activity, variant }) => {
        const langInfo = languageInfoForVariant(activity, variant);
        return (
          <Grid
            xs={12}
            sm={6}
            lg={4}
            key={activity.slug}
          >
            <Card>
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
          </Grid>
        );
      })}
    </Grid>
  );
}
