import {
  Card, CardActionArea, CardContent, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { shuffle } from 'lodash';
import { MDXRemote } from 'next-mdx-remote';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { allActivities, findUserCompetencies } from '../src/curriculumCompetencies';
import { ActivityVariantMetadata } from '../src/localStorage/schema';
import { Curriculum, CurriculumActivity } from '../src/schemas/curriculumSchema';
import theme from '../src/theme';
import { curriculumPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';
import UserCompetenciesStack from './UserCompetenciesStack';

function CurriculumDescriptionTypography({ children = null }: { children?: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" color="text.secondary" component="div">
      {children}
    </Typography>
  );
}

export default function CurriculumCard({ curriculum, userActivities = undefined }:
{ curriculum: Curriculum, userActivities?: ActivityVariantMetadata[] }) {
  const [randomActivities, setRandomActivities] = useState<CurriculumActivity[]>([]);
  useEffect(() => {
    const activities = allActivities(curriculum);
    setRandomActivities(shuffle(activities));
  }, [curriculum]);
  const userCompetencies = findUserCompetencies(curriculum, userActivities || []);

  const router = useRouter();
  const clickable = curriculum.visibility === 'featured' || curriculum.visibility === 'visible';
  const handleClick = () => {
    if (clickable) {
      router.push(curriculumPathname(curriculum.authorSlug, curriculum.slug));
    }
  };
  return (
    <Card>
      <CardActionArea onClick={handleClick}>
        <Grid container>
          <Grid xs={9}>
            <CardContent>
              <Typography component="div" variant="h5" gutterBottom>
                {curriculum.title}
              </Typography>
              <MDXRemote
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...curriculum.description}
                components={{ p: CurriculumDescriptionTypography }}
              />
            </CardContent>
          </Grid>
          <Grid xs={3}>
            <Grid container>
              {randomActivities.slice(0, 4).map((activity) => (
                <Grid
                  md={6}
                  key={activity.id}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <ActivityCardMedia
                    activity={activity.activity}
                    variant={activity.variant}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardActionArea>
      {userCompetencies.length > 0 && (
        <CardContent sx={{ backgroundColor: theme.palette.grey[100] }}>
          <UserCompetenciesStack
            curriculum={curriculum}
            userCompetencies={userCompetencies}
            direction="row"
          />
        </CardContent>
      )}
    </Card>
  );
}
