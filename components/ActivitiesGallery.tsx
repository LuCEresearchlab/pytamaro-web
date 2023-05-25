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
import { NotebookVariant } from '../src/schemas/activitySchema';
import { AuthorActivities } from '../src/schemas/authorSchema';

export const ANY_LANGUAGE = 'any';

export default function ActivitiesGallery({
  authorsActivities, languageFilter, compactView,
} :
{ authorsActivities : AuthorActivities[],
  languageFilter : string, compactView: boolean }) {
  if (authorsActivities.flatMap((a) => a.activities).length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ marginTop: 4, fontStyle: 'italic' }}>
        No activities match your searching criteria.
      </Typography>
    );
  }
  return (
    <Grid container spacing={2}>
      {authorsActivities.flatMap(
        (authorActivities) => authorActivities.activities.map((activity) => {
          // get language-filtered variant (if cannot, get first)
          const defaultVariant = activity.variants.find(
            (v) => languageFilter === ANY_LANGUAGE
           || v.language.toLowerCase() === languageFilter.toLowerCase(),
          ) || activity.variants[0] as NotebookVariant;
          const variantPathname = (variant: NotebookVariant) => activityVariantPathname(
            authorActivities.authorSlug,
            activity.slug,
            variant.language,
            variant.latestVersion,
          );
          const isDraft = activity.visibility === 'draft';
          return (
            <Grid
              xs={12}
              sm={6}
              md={compactView ? 3 : 4}
              lg={compactView ? 2 : 3}
              key={activity.slug}
            >
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
                        authorActivities.authorSlug,
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
                        href={activityPathname(authorActivities.authorSlug, activity.slug)}
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
        }),
      )}
    </Grid>
  );
}
