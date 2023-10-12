import { HourglassBottom, Verified } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Button,
  Card, CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import router from 'next/router';
import { Activity, activityVariantId, canonicalVariantForLanguage } from '../src/schemas/activitySchema';
import { activityAssetPathname, activityPathname, activityVariantPathname } from '../src/urlUtils';

export const ANY_LANGUAGE = 'any';

const VISIBILITY_PRIORITY = {
  featured: 0,
  visible: 1,
  draft: 2,
  hidden: 4,
};

export default function ActivitiesGallery({
  activities, languageFilter = ANY_LANGUAGE, compactView = false,
} :
{ activities : Activity[],
  languageFilter?: string,
  compactView?: boolean
}) {
  activities.sort((a1, a2) => {
    if (a1.visibility !== a2.visibility) {
      // different visibility, featured before visible before draft before hidden
      return VISIBILITY_PRIORITY[a1.visibility] - VISIBILITY_PRIORITY[a2.visibility];
    }
    if (a1.variants.length !== a2.variants.length) {
      // same visibility, more variants first
      return Math.sign(a2.variants.length - a1.variants.length);
    }
    // same visibility, same number of variants, sort by slug
    return a1.slug < a2.slug ? -1 : 1;
  });

  return (
    <Grid container spacing={2}>
      {activities.map((activity) => {
        // get language-filtered variant (if cannot, get first)
        const langInfo = activity.languagesInfo.find(
          (i) => languageFilter === ANY_LANGUAGE
           || i.language.toLowerCase() === languageFilter.toLowerCase(),
        ) || activity.languagesInfo[0];
        const defaultVariant = canonicalVariantForLanguage(
          activity,
          langInfo.language,
        );
        if (defaultVariant === undefined) {
          throw new Error(`Latest version for activity ${activity.slug} in language ${languageFilter} not found`);
        }
        const isDraft = activity.visibility === 'draft';
        return (
          <Grid
            xs={12}
            sm={6}
            md={compactView ? 3 : 4}
            lg={compactView ? 2 : 3}
            key={activityVariantId(defaultVariant)}
          >
            <Paper elevation={8}>
              <Card>
                <CardActionArea
                  onClick={() => router.push(activityVariantPathname(defaultVariant))}
                  disabled={isDraft}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={activityAssetPathname(
                      activity.authorSlug,
                      activity.slug,
                      activity.previewImage.filename,
                    )}
                    alt={langInfo.title}
                    sx={{ padding: 1, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
                  />
                  { !compactView && (
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {langInfo.title}
                        {activity.visibility === 'featured'
                          && (
                          <Verified
                            sx={{ marginLeft: 1, color: 'primary.main' }}
                          />
                          )}
                        {isDraft
                          && (
                          <Chip
                            icon={<HourglassBottom />}
                            label="Coming soon"
                            sx={{ marginLeft: 2, textTransform: 'uppercase', fontWeight: 'bold' }}
                          />
                          )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {langInfo.description}
                      </Typography>
                    </CardContent>
                  )}
                </CardActionArea>
                { !compactView && (
                  <CardActions>
                    {activity.languagesInfo.map((info) => (
                      <Button
                        onClick={() => router.push(activityVariantPathname(
                          canonicalVariantForLanguage(activity, info.language),
                        ))}
                        size="small"
                        variant="outlined"
                        key={info.language}
                        disabled={isDraft}
                      >
                        {info.language}
                      </Button>
                    ))}
                    <Box sx={{ marginLeft: 'auto' }}>
                      <IconButton
                        size="small"
                        href={activityPathname(activity.authorSlug, activity.slug)}
                        component={Link}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                )}
              </Card>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
