import {
  Card, CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useRouter } from 'next/router';
import getLanguageDisplayName from '../src/internationalization';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import {
  Activity, ActivityVariant, activityVariantId, languageInfoForVariant,
} from '../src/schemas/activitySchema';
import { activityVariantPathname } from '../src/urlUtils';
import ActivityCardMedia from './ActivityCardMedia';
import ActivityStatusBadge, { activityVariantStatus } from './ActivityStatusBadge';

function MaybeActionArea({ disabled, children, onClick }:
{ disabled: boolean, children: JSX.Element, onClick: () => void }) {
  if (disabled) {
    return children;
  }
  return (
    <CardActionArea onClick={onClick}>
      {children}
    </CardActionArea>
  );
}

export default function VariantsGallery({
  activitiesWithVariants, noVariantInfo = false, noInProgress = false, clickingDisabled = false,
} :
{ activitiesWithVariants : {
  activity: Activity,
  variant: ActivityVariant,
}[],
noVariantInfo?: boolean,
noInProgress?: boolean,
clickingDisabled?: boolean,
}) {
  const { metadata } = useLocalProfile();
  const router = useRouter();
  const handleClick = (variant: ActivityVariant) => {
    router.push(activityVariantPathname(variant));
  };
  return (
    <Grid container spacing={2} rowSpacing={4}>
      {activitiesWithVariants.map(({ activity, variant }) => {
        const langInfo = languageInfoForVariant(activity, variant);
        return (
          <Grid
            xs={12}
            sm={6}
            lg={4}
            key={activityVariantId(variant)}
          >
            <ActivityStatusBadge
              status={activityVariantStatus(metadata.activities, variant)}
              small
              noInProgress={noInProgress}
            >
              <Card
                sx={{
                  width: '100%', height: '100%',
                }}
              >
                <MaybeActionArea disabled={clickingDisabled} onClick={() => handleClick(variant)}>
                  <>
                    <ActivityCardMedia activity={activity} variant={variant} />
                    <CardContent>
                      <Typography gutterBottom variant="h6">
                        {langInfo.title}
                      </Typography>
                      {!noVariantInfo && (
                      <Typography variant="body2" color="text.secondary">
                        {`${getLanguageDisplayName(variant.language)} - ${variant.version}`}
                      </Typography>
                      )}
                    </CardContent>
                  </>
                </MaybeActionArea>
              </Card>
            </ActivityStatusBadge>
          </Grid>
        );
      })}
    </Grid>
  );
}
