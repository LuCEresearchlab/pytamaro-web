import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack, TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  ToggleButton, Tooltip,
} from '@mui/material';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import NavigationBar from '../../../components/NavigationBar';
import { activitiesByAuthorPathname } from '../../../src/urlUtils';
import getLanguageDisplayName from '../../../src/internationalization';
import ActivitiesGallery from '../../../components/ActivitiesGallery';
import { Activity } from '../../../src/schemas/activitySchema';
import { listActivities } from '../../../src/fs-content/activities';
import listAuthors from '../../../src/fs-content/authors';

const VISIBILITY_PRIORITY = {
  featured: 0,
  visible: 1,
  draft: 2,
  hidden: 4,
};

export default function ActivitiesPage({ activities }: { activities: Activity[] }) {
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
        <Tooltip title="Compact View">
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
        </Tooltip>
      </NavigationBar>
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
      <ActivitiesGallery
        activities={filteredActivities}
        compactView={compactView}
        languageFilter={languageFilter}
        authorSlug={authorSlug}
      />
    </Stack>
  );
}

export async function getStaticProps(
  context: { params: { authorSlug: string } },
) {
  const {
    authorSlug,
  } = context.params;
  return {
    props: {
      activities: await listActivities(authorSlug),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthors();
  const paths = authors.map((a) => activitiesByAuthorPathname(a.slug));
  return {
    paths,
    fallback: false,
  };
}
