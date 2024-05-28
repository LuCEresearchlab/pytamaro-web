import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import {
  Stack,
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
import capitalizedLocalizedLanguageDisplayName, { format } from '../../../src/internationalization';
import { knownConcepts } from '../../../src/schemas/activityConcepts';
import { BasicActivity } from '../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../src/schemas/authorSchema';
import { translationProps } from '../../../src/serverSideTranslationProps';
import { activitiesByAuthorPathname, authorPathname, conceptPathname } from '../../../src/urlUtils';

export default function ActivitiesPage({ defaultAuthorSlug, activities, authorsProfiles }:
{ defaultAuthorSlug: string,
  activities: BasicActivity[],
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

  // Find languages used in any activity
  const languages = new Set(
    activities.flatMap(
      (activity) => activity.variants.map((variant) => variant.language),
    ),
  );

  const languageOptions = Array.from(languages).map((language) => ({
    id: language,
    label: capitalizedLocalizedLanguageDisplayName(language),
  }));

  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [allowedAuthors, setAllowedAuthors] = useState<string[]>([defaultAuthorSlug]);
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>(Array.from(languages));
  const [allowedConcepts, setAllowedConcepts] = useState<string[]>(Object.keys(knownConcepts));
  const [compactView, setCompactView] = useState(false);

  useEffect(() => {
    setFilteredActivities(
      activities
        .filter((activity) => allowedAuthors.includes(activity.authorSlug))
        .filter((activity) => (
          activity.variants.some((variant) => allowedLanguages.includes(variant.language))))
        .filter((activity) => (
          activity.concepts.some((concepts) => allowedConcepts.includes(concepts))
          || (activity.concepts.length === 0 && allowedConcepts.length === 0)
        )),
    );
  }, [activities, allowedLanguages, allowedConcepts, allowedAuthors]);

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
        <Grid xs={12} lg={6}>
          <SelectAll
            title="Concepts"
            placeholder="Concept"
            options={conceptsOptions}
            initialSelection={conceptsOptions}
            onSelectionChange={setAllowedConcepts}
            maxTagsShown={5}
          />
        </Grid>
        <Grid xs={12} lg={3}>
          <SelectAll
            title="Authors"
            placeholder="Author"
            options={authorOptions}
            initialSelection={authorOptions.filter((author) => author.id === defaultAuthorSlug)}
            onSelectionChange={setAllowedAuthors}
            maxTagsShown={2}
          />
        </Grid>
        <Grid xs={12} lg={3}>
          <SelectAll
            title="Languages"
            placeholder="Language"
            options={languageOptions}
            onSelectionChange={setAllowedLanguages}
            maxTagsShown={2}
          />
        </Grid>
      </Grid>
      <ActivitiesGallery
        activities={filteredActivities}
        compactView={compactView}
        preferredLanguage={allowedLanguages.length === 1 ? allowedLanguages[0] : undefined}
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
