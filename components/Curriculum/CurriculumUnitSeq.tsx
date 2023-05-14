import { styled } from '@mui/material/styles';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  IconButtonProps,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { CurriculumUnit } from '../../src/schemas/curriculumSchema';
import ActivityCard from '../ActivityCard';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function CurriculumUnitSeq({ unit, completedActivityVariantIds }
: { unit : CurriculumUnit, completedActivityVariantIds : string[] }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const sortedActivities = unit.activities
    .map((activity) => {
      const isCompleted = completedActivityVariantIds.includes(activity.id);
      const isUnlocked = activity.activityRequirements.every(
        (asum) => asum.some(
          (aterm) => completedActivityVariantIds.includes(aterm),
        ),
      );
      return {
        ...activity,
        isCompleted,
        isUnlocked,
      };
    })
    .sort((a, b) => {
      if (a.isCompleted) {
        return -1;
      }
      if (b.isCompleted) {
        return 1;
      }
      if (a.isUnlocked) {
        return -1;
      }
      if (b.isUnlocked) {
        return 1;
      }
      return 0;
    });

  return (
    <Card sx={{ paddingX: 2 }}>
      <CardActions disableSpacing>
        <Typography variant="h4">
          {unit.title}
        </Typography>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Grid container spacing={2}>
            {sortedActivities.map((activity) => (
              <Grid md={4} lg={3} key={activity.id}>
                <ActivityCard
                  id={activity.id}
                  activity={activity.activity}
                  variant={activity.variant}
                  isCompleted={activity.isCompleted}
                  isUnlocked={activity.isUnlocked}
                  width={undefined}
                  height={undefined}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
}
