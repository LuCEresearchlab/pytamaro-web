import { Verified, HourglassBottom } from '@mui/icons-material';
import {
  Paper, Card, CardActionArea, CardMedia, CardContent,
  Typography, Chip, CardActions, Button, Box, IconButton,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import router from 'next/router';
import InfoIcon from '@mui/icons-material/Info';
import { activityVariantPathname, activityAssetPathname, activityPathname } from '../src/urlUtils';
import { Activity, NotebookVariant } from '../src/schemas/activitySchema';

export default function ActivitiesGallery({
  activities, languageFilter, authorSlug, compactView,
} :
{ activities : Activity[], languageFilter : string, authorSlug: string, compactView: boolean }) {
  return (
    <Grid container spacing={2}>
      {activities.map((activity) => {
        // get language-filtered variant (if cannot, get first)
        const defaultVariant = activity.variants.find(
          (v) => !languageFilter || v.language.toLowerCase() === languageFilter.toLowerCase(),
        ) || activity.variants[0] as NotebookVariant;
        const variantPathname = (variant: NotebookVariant) => activityVariantPathname(
          authorSlug,
          activity.slug,
          variant.language,
          variant.latestVersion,
        );
        const isDraft = activity.visibility === 'draft';
        return (
          <Grid md={compactView ? 3 : 4} lg={compactView ? 2 : 3} key={activity.slug}>
            <Paper elevation={8}>
              <Card>
                <CardActionArea
                  onClick={() => router.push(variantPathname(defaultVariant))}
                  disabled={isDraft}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={activityAssetPathname(
                      authorSlug,
                      activity.slug,
                      activity.previewImage.filename,
                    )}
                    alt={defaultVariant.title}
                    sx={{ padding: 1, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
                  />
                  { !compactView && (
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {defaultVariant.title}
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
                    <Typography variant="body2" color="text.secondary">
                      {defaultVariant.description}
                    </Typography>
                  </CardContent>
                  )}
                </CardActionArea>
                { !compactView && (
                <CardActions>
                  {activity.variants.map((variant) => (
                    <Button
                      onClick={() => router.push(variantPathname(variant))}
                      size="small"
                      variant="outlined"
                      key={variant.language}
                      disabled={isDraft}
                    >
                      {variant.language}
                    </Button>
                  ))}
                  <Box sx={{ marginLeft: 'auto' }}>
                    <IconButton
                      size="small"
                      href={activityPathname(authorSlug, activity.slug)}
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
