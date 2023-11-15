import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import {
  Box, Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack, TextField,
  ToggleButton, Tooltip, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ActivitiesGallery, { ANY_LANGUAGE } from '../../../components/ActivitiesGallery';
import NavigationBar from '../../../components/NavigationBar';
import { listActivitiesAllAuthors, listAuthorsProfiles } from '../../../src/fs-content/authors';
import getLanguageDisplayName, { format } from '../../../src/internationalization';
import { Activity } from '../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../src/schemas/authorSchema';
import { translationProps } from '../../../src/serverSideTranslationProps';
import theme from '../../../src/theme';
import { activitiesByAuthorPathname } from '../../../src/urlUtils';

export default function ActivitiesPage({ defaultAuthorSlug, activities, authorsProfiles }:
{ defaultAuthorSlug: string,
  activities: Activity[],
  authorsProfiles: AuthorProfile[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState(ANY_LANGUAGE);
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [filteredAuthors, setFilteredAuthors] = useState<string[]>([defaultAuthorSlug]);
  const [compactView, setCompactView] = useState(false);

  // get all languages in set of activities
  const languages = new Set(
    activities.flatMap(
      (activity) => activity.variants.map(
        (avariant) => avariant.language,
      ),
    ),
  );

  useEffect(() => {
    setFilteredActivities(
      activities
        .filter((activity) => filteredAuthors.includes(activity.authorSlug))
        .filter((activity) => activity.visibility !== 'hidden')
        .filter((activity) => activity.variants.some(
          (avariant) => languageFilter === ANY_LANGUAGE
            || avariant.language.toLowerCase() === languageFilter.toLowerCase(),
        ))
        .filter((activity) => (
          // search by slug and by title and description of language-filtered variant
          (activity.slug.toLowerCase().includes(search.toLowerCase())
          || activity.languagesInfo.some(
            (info) => (languageFilter === ANY_LANGUAGE
            || info.language.toLowerCase() === languageFilter.toLowerCase())
            && (info.description.toLowerCase().includes(search.toLowerCase())
            || info.title.toLowerCase().includes(search.toLowerCase())),
          ))
        )),
    );
  }, [search, languageFilter, activities, filteredAuthors]);

  const handleAuthorsFilterChange = (event: SelectChangeEvent<typeof filteredAuthors>) => {
    const {
      target: { value },
    } = event;
    const authors = typeof value === 'string' ? value.split(',') : value; // don't ask: on autofill we get a stringified value
    setFilteredAuthors(authors);
    if (authors.length === 1) {
      router.push(activitiesByAuthorPathname(authors[0]), undefined, { shallow: true });
    }
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const authorName = (slug: string) => authorsProfiles.find((author) => author.slug === slug)?.name;

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
        <Grid xs={12} lg={8}>
          <TextField
            fullWidth
            label="Search by title and description"
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid xs={6} lg={2}>
          <FormControl fullWidth>
            <InputLabel id="authors-select-label">Authors</InputLabel>
            <Select
              labelId="authors-select-label"
              id="authors-select"
              multiple
              value={filteredAuthors}
              onChange={handleAuthorsFilterChange}
              input={<OutlinedInput id="select-multiple-authors" label="Authors" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={authorName(value)} size="small" />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {authorsProfiles.map((author) => (
                <MenuItem
                  key={author.slug}
                  value={author.slug}
                  style={{
                    fontWeight: filteredAuthors.indexOf(author.slug) === -1
                      ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
                  }}
                >
                  {author.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={6} lg={2}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={languageFilter}
              label="Language"
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <MenuItem key={ANY_LANGUAGE} value={ANY_LANGUAGE}><em>All Languages</em></MenuItem>
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
      />
      <Typography color="textSecondary" textAlign="center" paddingTop={2}>
        {`${format(filteredActivities.length, 'activity matches', 'activities match')} the search criteria`}
      </Typography>
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
      defaultAuthorSlug: authorSlug,
      authorsProfiles: await listAuthorsProfiles(),
      activities: await listActivitiesAllAuthors(),
      ...await translationProps(),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsProfiles();
  const paths = authors.map((a) => activitiesByAuthorPathname(a.slug));
  return {
    paths,
    fallback: false,
  };
}
