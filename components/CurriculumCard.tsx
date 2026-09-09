import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { concat, shuffle } from 'lodash';
import { MDXRemote } from 'next-mdx-remote';
import { useEffect, useState } from 'react';
import { allActivities } from '../src/curricula';
import { findUserCompetencies } from '../src/curriculumCompetencies';
import { ActivityVariantMetadata } from '../src/localStorage/schema';
import {
  Curriculum,
  CurriculumActivity,
} from '../src/schemas/curriculumSchema';
import theme from '../src/theme';
import { curriculumPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';
import UserCompetenciesStack from './UserCompetenciesStack';

function CurriculumDescriptionTypography({
  children = null,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Typography
      variant='subtitle1'
      component='div'
      sx={{
        color: 'text.secondary',
      }}
    >
      {children}
    </Typography>
  );
}

function CurriculumDescriptionListItem({
  children = null,
}: {
  children?: React.ReactNode;
}) {
  return (
    <li>
      <CurriculumDescriptionTypography>
        {children}
      </CurriculumDescriptionTypography>
    </li>
  );
}

export default function CurriculumCard({
  curriculum,
  userActivities = undefined,
  alwaysClickable = false,
  compact = false,
}: {
  curriculum: Curriculum;
  userActivities?: ActivityVariantMetadata[];
  alwaysClickable?: boolean;
  compact?: boolean;
}) {
  const [previewActivities, setPreviewActivities] = useState<
    CurriculumActivity[]
  >([]);
  useEffect(() => {
    const activities = allActivities(curriculum);
    const fixedActivities = curriculum.activitiesPreviewImage
      .map((activityId) => activities.find((a) => a.id === activityId))
      .filter((a) => a !== undefined) as CurriculumActivity[];
    const otherActivities = shuffle(
      allActivities(curriculum).filter(
        (a) => !curriculum.activitiesPreviewImage.includes(a.id),
      ),
    );
    setPreviewActivities(concat(fixedActivities, otherActivities));
  }, [curriculum]);
  const userCompetencies = findUserCompetencies(
    curriculum,
    userActivities || [],
  );
  const clickable =
    alwaysClickable ||
    curriculum.visibility === 'featured' ||
    curriculum.visibility === 'visible';
  return (
    <Card>
      <CardActionArea
        disabled={!clickable}
        href={curriculumPathname(curriculum.authorSlug, curriculum.slug)}
      >
        <Grid container>
          <Grid size={9}>
            <CardContent>
              <Typography component='div' variant='h5' gutterBottom>
                {curriculum.title}
              </Typography>
              <Box
                sx={{
                  overflow: 'hidden',
                  lineClamp: compact ? 5 : 10,
                  WebkitLineClamp: compact ? 5 : 10,
                  WebkitBoxOrient: 'vertical',
                  display: '-webkit-box',
                }}
              >
                <MDXRemote
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...curriculum.description}
                  components={{
                    p: CurriculumDescriptionTypography,
                    li: CurriculumDescriptionListItem,
                  }}
                />
              </Box>
            </CardContent>
          </Grid>
          <Grid
            size={3}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* <div> needed so that the inner Grid does not inherit from the outer one */}
            <div>
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                }}
              >
                {previewActivities.slice(0, 4).map((activity) => (
                  <Grid size={{ xs: 12, md: 6 }} key={activity.id}>
                    <ActivityCardMedia
                      activity={activity.activity}
                      variant={activity.variant}
                    />
                  </Grid>
                ))}
              </Grid>
            </div>
          </Grid>
        </Grid>
      </CardActionArea>
      {userCompetencies.length > 0 && (
        <CardContent sx={{ backgroundColor: theme.palette.grey[100] }}>
          <UserCompetenciesStack
            curriculum={curriculum}
            userCompetencies={userCompetencies}
            direction='row'
          />
        </CardContent>
      )}
    </Card>
  );
}
