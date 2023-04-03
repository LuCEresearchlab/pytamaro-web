import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CardActions,
  Paper,
  Typography,
  Button,
  Chip,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  ToggleButton,
  IconButton,
  Box,
} from '@mui/material';
import { HourglassBottom, Verified } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import {
  getActivity, Activity, NotebookVariant,
} from '../../../../src/Activities';
import NavigationBar from '../../../../components/NavigationBar';
import { activityAssetUrl, notebookVersionUrl } from '../../../../src/urlUtils';
import getLanguageDisplayName from '../../../../src/internationalization';
import { listAuthors } from '../../../../src/Authors';
import { getCurriculum, Curriculum } from '../../../../src/Curricula';

const VISIBILITY_PRIORITY = {
  featured: 0,
  visible: 1,
  draft: 2,
  hidden: 4,
};

export default function CurriculumPage({
  curriculum, activities,
}:
{ curriculum : Curriculum, activities: Activity[] }) {
  const router = useRouter();
  const { authorSlug } = router.query as { authorSlug: string };
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [compactView, setCompactView] = useState(false);

  // get all languages in set of activities
  const languages = new Set(
    activities.flatMap((activity) => activity.variants.map((avariant) => avariant.language)),
  );

  useEffect(() => {
    setFilteredActivities(
      activities.filter(
        (activity) => activity.visibility !== 'hidden'
        // language filter
        && activity.variants.some(
          (avariant) => !languageFilter
          || avariant.language.toLowerCase() === languageFilter.toLowerCase(),
        )
        // search by slug and by title and description of language-filtered variant
        && (activity.slug.toLowerCase().includes(search.toLowerCase())
        || activity.variants.some(
          (avariant) => (!languageFilter
          || avariant.language.toLowerCase() === languageFilter.toLowerCase())
          && (avariant.description.toLowerCase().includes(search.toLowerCase())
          || avariant.title.toLowerCase().includes(search.toLowerCase())),
        )),
      ),
    );
  }, [search, languageFilter, activities]);

  // Minimal sorting
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
    <Stack spacing={2}>
      <NavigationBar>
        <ToggleButton
          color="neutral"
          value="compact"
          selected={compactView}
          onChange={() => {
            setCompactView(!compactView);
          }}
        >
          <ViewCompactIcon />
        </ToggleButton>
      </NavigationBar>
      <Typography variant="h2" marginY={3} align="center">{curriculum.title}</Typography>
      <Grid container spacing={2}>
        <Grid xs={9}>
          <TextField
            fullWidth
            label="Search by title and description"
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid xs={3}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={languageFilter}
              label="Language"
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <MenuItem key="" value=""><em>All</em></MenuItem>
              {Array.from(languages).map((language) => (
                <MenuItem key={language} value={language}>
                  {getLanguageDisplayName(language)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {filteredActivities.map((activity) => {
          // get language-filtered variant (if cannot, get first)
          const variant = activity.variants.find(
            (v) => !languageFilter || v.language.toLowerCase() === languageFilter.toLowerCase(),
          ) || activity.variants[0] as NotebookVariant;
          function variantUrl(language: string) {
            return `${router.asPath}/${notebookVersionUrl(activity.slug, language, variant.latestVersion)}`;
          }
          const isDraft = activity.visibility === 'draft';
          return (
            <Grid md={compactView ? 3 : 4} lg={compactView ? 2 : 3} key={activity.slug}>
              <Paper elevation={8}>
                <Card>
                  <CardActionArea
                    onClick={() => router.push(variantUrl(variant.language))}
                    disabled={isDraft}
                  >
                    <CardMedia
                      component="img"
                      height="300"
                      image={activityAssetUrl(
                        authorSlug,
                        activity.slug,
                        activity.previewImage.filename,
                      )}
                      alt={variant.title}
                      sx={{ padding: 1, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
                    />
                    { !compactView && (
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {variant.title}
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
                        {variant.description}
                      </Typography>
                    </CardContent>
                    )}
                  </CardActionArea>
                  { !compactView && (
                  <CardActions>
                    {activity.variants.map((avariant) => (
                      <Button
                        onClick={() => router.push(variantUrl(avariant.language))}
                        size="small"
                        variant="outlined"
                        key={avariant.language}
                        disabled={isDraft}
                      >
                        {avariant.language}
                      </Button>
                    ))}
                    <Box sx={{ marginLeft: 'auto' }}>
                      <IconButton
                        size="small"
                        href={`${router.asPath}/${activity.slug}`}
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
    </Stack>
  );
}

export async function getStaticProps(
  context: { params: {
    authorSlug: string,
    curriculumSlug: string,
  } },
) {
  const {
    authorSlug, curriculumSlug,
  } = context.params;
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  const activities = await Promise.all(curriculum.activities
    .map((curriculumAct) => getActivity(authorSlug, curriculumAct.slug)));
  return {
    props: {
      curriculum,
      activities,
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthors();
  const paths = authors
    .flatMap((author) => author.curricula
      .map((curriculum) => `/curricula/${author.slug}/${curriculum.slug}`));
  return {
    paths,
    fallback: false,
  };
}
