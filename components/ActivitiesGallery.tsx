import { HourglassBottom, Verified } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { countBy, orderBy, sortBy } from 'lodash';
import Link from 'next/link';
import {
  BasicActivity,
  activityVariantId,
  canonicalVariantForLanguage,
} from '../src/schemas/activitySchema';
import { activityPathname, activityVariantPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';
import ActivityConcepts from './ActivityConcepts';

const VISIBILITY_PRIORITY = {
  featured: 0,
  visible: 1,
  draft: 2,
  hidden: 4,
};

export type CompactMode = 'normal' | 'compact' | 'no-cards';

export default function ActivitiesGallery({
  activities,
  preferredLanguage = undefined,
  compactView = 'normal',
}: {
  activities: BasicActivity[];
  preferredLanguage?: string;
  compactView?: CompactMode;
}) {
  // Order by visibility (lowest priority first),
  // then number of variants (highest first),
  // then slug (alphabetic order).
  const sortedActivities = orderBy(
    activities,
    [
      (a) => VISIBILITY_PRIORITY[a.visibility],
      (a) => a.variants.length,
      (a) => a.slug,
    ],
    ['asc', 'desc', 'asc'],
  );

  const conceptsFrequency = countBy(
    sortedActivities.flatMap((a) => a.concepts),
  );

  const compact = compactView !== 'normal';

  return (
    <Grid container spacing={compactView === 'no-cards' ? 0.2 : 2}>
      {sortedActivities.map((activity) => {
        // Get available canonical variants for this activity,
        // trying to match the preferred language first.
        const canonicalVariants = sortBy(activity.languagesInfo, (i) =>
          i.language === preferredLanguage ? 0 : 1,
        ).map((i) => canonicalVariantForLanguage(activity, i.language));
        // Use the first one that was found. Produce an error if none is available.
        const seletectedVariant = canonicalVariants.find(
          (v) => v !== undefined,
        );
        const selectedLangInfo = activity.languagesInfo.find(
          (i) =>
            i.language === seletectedVariant?.language &&
            i.latestVersion === seletectedVariant?.version,
        );
        if (seletectedVariant === undefined || selectedLangInfo === undefined) {
          throw new Error(
            `Cannot find a valid language/version for activity ${activity.slug}`,
          );
        }
        const isDraft = activity.visibility === 'draft';
        return (
          <Grid
            xs={12}
            sm={6}
            md={compact ? 3 : 4}
            lg={compact ? 2 : 3}
            key={activityVariantId(seletectedVariant)}
          >
            {compactView === 'no-cards' ? (
              <ActivityCardMedia
                activity={activity}
                variant={seletectedVariant}
                height='300'
                padding={1}
              />
            ) : (
              <Card elevation={8} sx={{ height: '100%' }}>
                <CardActionArea
                  href={activityVariantPathname(seletectedVariant)}
                  disabled={isDraft}
                >
                  <ActivityCardMedia
                    activity={activity}
                    variant={seletectedVariant}
                    height='300'
                    padding={1}
                  />
                  {!compact && (
                    <CardContent sx={{ pb: 0 }}>
                      <Typography
                        gutterBottom
                        variant='h5'
                        component='span'
                        sx={{ display: 'flex' }}
                      >
                        {selectedLangInfo.title}
                        {activity.visibility === 'featured' && (
                          <Verified
                            sx={{ marginLeft: 1, color: 'primary.main' }}
                          />
                        )}
                        {isDraft && (
                          <Chip
                            icon={<HourglassBottom />}
                            label='Coming soon'
                            sx={{
                              marginLeft: 2,
                              textTransform: 'uppercase',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                      </Typography>
                    </CardContent>
                  )}
                </CardActionArea>
                {!compact && (
                  <CardActions>
                    <ActivityConcepts
                      concepts={activity.concepts}
                      conceptsFrequency={conceptsFrequency}
                      small
                    />
                    <Box style={{ marginLeft: 'auto' }} component='span'>
                      <IconButton
                        size='small'
                        href={activityPathname(
                          activity.authorSlug,
                          activity.slug,
                        )}
                        component={Link}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                )}
              </Card>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}
