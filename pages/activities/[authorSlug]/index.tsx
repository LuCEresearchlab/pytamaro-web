import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import {
  Stack, TextField,
  ToggleButton, Tooltip, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { countBy, orderBy } from 'lodash';
import { useEffect, useState } from 'react';
import ActivitiesGallery from '../../../components/ActivitiesGallery';
import NavigationBar from '../../../components/NavigationBar';
import SelectAll from '../../../components/SelectAll';
import { visibleActivities } from '../../../src/fs-content/activities';
import { listActivitiesAllAuthors, listAuthorsProfiles } from '../../../src/fs-content/authors';
import { format } from '../../../src/internationalization';
import { knownConcepts } from '../../../src/schemas/activityConcepts';
import { Activity } from '../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../src/schemas/authorSchema';
import { translationProps } from '../../../src/serverSideTranslationProps';
import { activitiesByAuthorPathname, authorPathname, conceptPathname } from '../../../src/urlUtils';

export default function ActivitiesPage({ defaultAuthorSlug, activities, authorsProfiles }:
{ defaultAuthorSlug: string,
  activities: Activity[],
  authorsProfiles: AuthorProfile[] }) {
  const authorOptions = authorsProfiles.map((author) => ({
    id: author.slug,
    label: author.name,
    url: authorPathname(author.slug),
  }));

  // Show concepts sorted by frequency of use (most used first)
  const conceptsFrequency = countBy(activities.flatMap((a) => a.concepts));
  const conceptsOptions = orderBy(Object.keys(knownConcepts), (t) => conceptsFrequency[t], ['desc']).map((concepts) => ({
    id: concepts,
    label: knownConcepts[concepts].title,
    url: conceptPathname(concepts),
  }));

  const [search, setSearch] = useState('');
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [allowedAuthors, setAllowedAuthors] = useState<string[]>([defaultAuthorSlug]);
  const [allowedConcepts, setAllowedConcepts] = useState<string[]>(Object.keys(knownConcepts));
  const [compactView, setCompactView] = useState(false);

  useEffect(() => {
    setFilteredActivities(
      activities
        .filter((activity) => allowedAuthors.includes(activity.authorSlug))
        .filter((activity) => (
          activity.concepts.every((concepts) => allowedConcepts.includes(concepts))
        ))
        .filter((activity) => (
          // search by slug and by title of any language
          (activity.slug.toLowerCase().includes(search.toLowerCase())
          || activity.languagesInfo.some(
            (info) => info.title.toLowerCase().includes(search.toLowerCase()),
          ))
        )),
    );
  }, [search, activities, allowedConcepts, allowedAuthors]);

  return (
    <Stack spacing={2}>
      <NavigationBar>
        <Tooltip arrow title="Compact View">
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
        <Grid xs={12} lg={4}>
          <TextField
            fullWidth
            label="Search by title"
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid xs={12} lg={4}>
          <SelectAll
            title="Allowed Concepts"
            placeholder="Concept"
            options={conceptsOptions}
            initialSelection={conceptsOptions}
            onSelectionChange={setAllowedConcepts}
          />
        </Grid>
        <Grid xs={12} lg={4}>
          <SelectAll
            title="Authors"
            placeholder="Author"
            options={authorOptions}
            initialSelection={authorOptions.filter((author) => author.id === defaultAuthorSlug)}
            onSelectionChange={setAllowedAuthors}
          />
        </Grid>
      </Grid>
      <ActivitiesGallery
        activities={filteredActivities}
        compactView={compactView}
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
      activities: visibleActivities(await listActivitiesAllAuthors()),
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
