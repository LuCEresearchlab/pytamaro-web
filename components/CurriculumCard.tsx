import {
  Box,
  Card, CardActionArea, CardContent, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useRouter } from 'next/router';
import { shuffle } from 'lodash';
import { useEffect, useState } from 'react';
import { Curriculum, CurriculumActivity } from '../src/schemas/curriculumSchema';
import { curriculumPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';

export default function CurriculumCard({ curriculum, authorSlug }:
{ curriculum: Curriculum, authorSlug: string }) {
  const [randomActivities, setRandomActivities] = useState<CurriculumActivity[]>([]);
  useEffect(() => {
    const activities = curriculum.units.flatMap((unit) => unit.steps.flatMap(
      (step) => step.activities,
    ));
    setRandomActivities(shuffle(activities));
  }, [curriculum]);

  const router = useRouter();
  const clickable = curriculum.visibility === 'featured' || curriculum.visibility === 'visible';
  const handleClick = () => {
    if (clickable) {
      router.push(curriculumPathname(authorSlug, curriculum.slug));
    }
  };
  return (
    <Card sx={{ display: 'flex' }}>
      <CardActionArea onClick={handleClick} sx={{ display: 'flex' }}>
        <CardContent sx={{ flex: '1 0 auto', maxWidth: '70vw' }}>
          <Typography component="div" variant="h5" gutterBottom>
            {curriculum.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {curriculum.description}
          </Typography>
        </CardContent>
        <Box sx={{ width: '200rem' }}>
          <Grid container>
            {randomActivities.slice(0, 4).map((activity) => (
              <Grid md={6} key={activity.id}>
                <ActivityCardMedia
                  activity={activity.activity}
                  variant={activity.variant}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardActionArea>
    </Card>
  );
}
