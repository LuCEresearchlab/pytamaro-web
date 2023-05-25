import { useState, useEffect } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack, TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  ToggleButton, Tooltip, SelectChangeEvent, OutlinedInput, Box, Chip,
} from '@mui/material';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import { useRouter } from 'next/router';
import theme from '../../../src/theme';
import NavigationBar from '../../../components/NavigationBar';
import ActivitiesGallery, { ANY_LANGUAGE } from '../../../components/ActivitiesGallery';
import getLanguageDisplayName from '../../../src/internationalization';
import { listAuthorsProfiles, listAuthorsWithContent } from '../../../src/fs-content/authors';
import { AuthorActivities, AuthorProfile } from '../../../src/schemas/authorSchema';
import { activitiesByAuthorPathname } from '../../../src/urlUtils';

const VISIBILITY_PRIORITY = {
  featured: 0,
  visible: 1,
  draft: 2,
  hidden: 4,
};

export default function ActivitiesPage({ defaultAuthorSlug, authorsActivities, authorsProfiles }:
{ defaultAuthorSlug: string,
  authorsActivities: AuthorActivities[],
  authorsProfiles: AuthorProfile[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState(ANY_LANGUAGE);
  const [filteredActivities, setFilteredActivities] = useState(authorsActivities);
  const [filteredAuthors, setFilteredAuthors] = useState<string[]>([defaultAuthorSlug]);
  const [compactView, setCompactView] = useState(false);

  // get all languages in set of activities
  const languages = new Set(
    authorsActivities.flatMap(
      (authorActivities) => authorActivities.activities.flatMap(
        (activity) => activity.variants.map(
          (avariant) => avariant.language,
        ),
      ),
    ),
  );

  useEffect(() => {
    setFilteredActivities(
      authorsActivities.filter((author) => filteredAuthors.includes(author.authorSlug))
        .map((authorActivities) => ({
          authorSlug: authorActivities.authorSlug,
          activities: authorActivities.activities.filter((activity) => (
            activity.visibility !== 'hidden'
          // language filter
          && activity.variants.some(
            (avariant) => languageFilter === ANY_LANGUAGE
            || avariant.language.toLowerCase() === languageFilter.toLowerCase(),
          )
          // search by slug and by title and description of language-filtered variant
          && (activity.slug.toLowerCase().includes(search.toLowerCase())
          || activity.variants.some(
            (avariant) => (languageFilter === ANY_LANGUAGE
            || avariant.language.toLowerCase() === languageFilter.toLowerCase())
            && (avariant.description.toLowerCase().includes(search.toLowerCase())
            || avariant.title.toLowerCase().includes(search.toLowerCase())),
          ))
          )),
        })),
    );
  }, [search, languageFilter, authorsActivities, filteredAuthors]);

  // Minimal sorting
  authorsActivities.flatMap((authorActivities) => authorActivities.activities).sort((a1, a2) => {
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
        authorsActivities={filteredActivities}
        compactView={compactView}
        languageFilter={languageFilter}
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
      defaultAuthorSlug: authorSlug,
      authorsProfiles: await listAuthorsProfiles(),
      authorsActivities: (await listAuthorsWithContent()).map(
        (author) => ({ authorSlug: author.slug, activities: author.activities }),
      ),
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
