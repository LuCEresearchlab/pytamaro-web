import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Box, Button, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { countBy, orderBy } from 'lodash';
import { useEffect, useState } from 'react';
import ActivitiesGallery, {
  CompactMode,
} from '../../../components/ActivitiesGallery';
import NavBarButton from '../../../components/navbar/NavBarButton';
import NavigationBar from '../../../components/navbar/NavigationBar';
import SelectAll from '../../../components/SelectAll';
import { visibleActivities } from '../../../src/fs-content/activities';
import {
  listActivitiesAllAuthors,
  listAuthorsProfiles,
} from '../../../src/fs-content/authors';
import capitalizedLocalizedLanguageDisplayName from '../../../src/internationalization';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import { knownConcepts } from '../../../src/schemas/activityConcepts';
import { BasicActivity } from '../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../src/schemas/authorSchema';
import { translationProps } from '../../../src/serverSideTranslationProps';
import theme from '../../../src/theme';
import {
  activitiesByAuthorPathname,
  authorPathname,
  conceptPathname,
} from '../../../src/urlUtils';

export default function ActivitiesPage({
  defaultAuthorSlug,
  activities,
  authorsProfiles,
}: {
  defaultAuthorSlug: string;
  activities: BasicActivity[];
  authorsProfiles: AuthorProfile[];
}) {
  const { t, i18n } = useLocalTranslation(['activity', 'concepts']);
  const authorOptions = authorsProfiles.map((author) => ({
    id: author.slug,
    label: author.name,
    url: authorPathname(author.slug),
  }));

  // Show concepts sorted by frequency of use (most used first)
  const conceptsFrequency = countBy(activities.flatMap((a) => a.concepts));
  const conceptsOptions = orderBy(
    Object.keys(knownConcepts),
    (conceptId) => conceptsFrequency[conceptId],
    ['desc'],
  ).map((conceptId) => ({
    id: conceptId,
    label: t(`concepts:${conceptId}.title`, {
      defaultValue: knownConcepts[conceptId].title,
    }),
    url: conceptPathname(conceptId),
  }));

  // Find languages used in any activity
  const languages = new Set(
    activities.flatMap((activity) =>
      activity.variants.map((variant) => variant.language),
    ),
  );

  const languageOptions = Array.from(languages).map((language) => ({
    id: language,
    label: capitalizedLocalizedLanguageDisplayName(language),
  }));

  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [allowedAuthors, setAllowedAuthors] = useState<string[]>([
    defaultAuthorSlug,
  ]);
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>(
    Array.from(languages),
  );
  const [allowedConcepts, setAllowedConcepts] = useState<string[]>(
    Object.keys(knownConcepts),
  );
  const [compactView, setCompactView] = useState<CompactMode>('normal');
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>(
    Object.keys(knownConcepts),
  );
  const [conceptsFilterVersion, setConceptsFilterVersion] = useState(0);
  const initialConcepts = conceptsOptions.filter((option) =>
    selectedConceptIds.includes(option.id),
  );

  useEffect(() => {
    setFilteredActivities(
      activities
        .filter((activity) => allowedAuthors.includes(activity.authorSlug))
        .filter((activity) =>
          activity.variants.some((variant) =>
            allowedLanguages.includes(variant.language),
          ),
        )
        .filter(
          (activity) =>
            activity.concepts.some((concepts) =>
              allowedConcepts.includes(concepts),
            ) ||
            (activity.concepts.length === 0 && allowedConcepts.length === 0),
        ),
    );
  }, [activities, allowedLanguages, allowedConcepts, allowedAuthors]);

  return (
    <Stack spacing={2}>
      <NavigationBar>
        <NavBarButton
          label={
            compactView === 'normal'
              ? t('switchToCompactView')
              : t('switchToNormalView')
          }
          onClick={(ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
            setCompactView((current) => {
              if (current === 'normal') {
                return ev.shiftKey ? 'no-cards' : 'compact';
              }
              return 'normal';
            });
          }}
        >
          {compactView === 'normal' ? (
            <ViewModuleIcon sx={{ color: theme.palette.text.primary }} />
          ) : (
            <ViewCompactIcon sx={{ color: theme.palette.text.primary }} />
          )}
        </NavBarButton>
      </NavigationBar>
      <Grid container spacing={2} sx={{ padding: 1 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SelectAll
            key={`${i18n.language}-${conceptsFilterVersion}`}
            title={t('concepts')}
            placeholder={t('concept')}
            options={conceptsOptions}
            initialSelection={initialConcepts}
            onSelectionChange={(selection) => {
              setAllowedConcepts(selection);
              setSelectedConceptIds(selection);
            }}
            maxTagsShown={5}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <SelectAll
            title={t('authors')}
            placeholder={t('author')}
            options={authorOptions}
            initialSelection={authorOptions.filter(
              (author) => author.id === defaultAuthorSlug,
            )}
            onSelectionChange={setAllowedAuthors}
            maxTagsShown={2}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <SelectAll
            title={t('languages')}
            placeholder={t('language')}
            options={languageOptions}
            onSelectionChange={setAllowedLanguages}
            maxTagsShown={2}
          />
        </Grid>
      </Grid>
      <ActivitiesGallery
        activities={filteredActivities}
        compactView={compactView}
        preferredLanguage={
          allowedLanguages.length === 1 ? allowedLanguages[0] : undefined
        }
      />
      <Typography
        color='textSecondary'
        sx={{
          textAlign: 'center',
          paddingTop: 2,
        }}
      >
        {t('activityMatches', { count: filteredActivities.length })}
      </Typography>
      {filteredActivities.length === 0 &&
        allowedConcepts.length > 0 &&
        allowedAuthors.length > 0 &&
        allowedLanguages.length > 0 && (
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Typography gutterBottom>
              {t('activitiesMaybeNotTagged')}
            </Typography>
            <Button
              variant='contained'
              onClick={() => {
                setSelectedConceptIds([]);
                setAllowedConcepts([]);
                setConceptsFilterVersion((version) => version + 1);
              }}
            >
              {t('removeConceptFilter')}
            </Button>
          </Box>
        )}
    </Stack>
  );
}

export async function getStaticProps(context: {
  params: { authorSlug: string };
}) {
  const { authorSlug } = context.params;
  return {
    props: {
      defaultAuthorSlug: authorSlug,
      authorsProfiles: await listAuthorsProfiles(),
      activities: visibleActivities(await listActivitiesAllAuthors()),
      ...(await translationProps(['activity', 'concepts'])),
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
