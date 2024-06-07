import {
  AvatarGroup,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { findStepIdx, findUnitIdx } from '../../src/curricula';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { getVariantTitle } from '../../src/schemas/activitySchema';
import { Curriculum, CurriculumActivity } from '../../src/schemas/curriculumSchema';
import theme from '../../src/theme';
import {
  activityAssetPathname,
  activityVariantWithCurriculum,
} from '../../src/urlUtils';
import ActivityStatusBadge, { ActivityStatus } from '../ActivityStatusBadge';
import CompetencyAvatar from '../CompetencyAvatar';

export default function ActivityCard({
  curriculumActivity,
  curriculum,
  status,
  isUnlocked,
  id,
  width = undefined,
  height = undefined,
}: {
  curriculumActivity: CurriculumActivity,
  curriculum: Curriculum,
  status: ActivityStatus,
  isUnlocked: boolean,
  id: string,
  width?: number | undefined,
  height?: number | undefined,
}) {
  const { t } = useLocalTranslation(['curriculum']);
  const { activity, variant } = curriculumActivity;
  const title = getVariantTitle(activity, variant);

  const avatarFontSize = theme.typography.pxToRem(16);

  const COMPACT_MAX_COMPETENCIES_SHOWN = 4;
  const EXPANDED_MAX_COMPETENCIES_SHOWN = 20;
  const [maxCompetenciesShown, setMaxCompetenciesShown] = useState(COMPACT_MAX_COMPETENCIES_SHOWN);

  const unitIdx = findUnitIdx(curriculum, curriculumActivity.variant);
  const stepIdx = findStepIdx(curriculum.units[unitIdx], curriculumActivity.variant);
  const firstStep = unitIdx === 0 && stepIdx === 0;

  return (
    <Box
      id={id}
      sx={{
        width: width || '100%',
        height: height || '100%',
        opacity: isUnlocked ? 1 : 0.38,
        position: 'relative',
        cursor: isUnlocked ? 'auto' : 'not-allowed',
        scrollMarginTop: 'calc(64px + 20px + 0.5vh)',
      }}
    >
      <ActivityStatusBadge status={status} locked={!isUnlocked}>
        <Card
          sx={{
            width: '100%', height: '100%', paddingBottom: 0,
          }}
        >
          <Tooltip arrow title={isUnlocked ? t('openActivity') : t(`unlockBy${firstStep ? 'Starting' : 'Completing'}`)} followCursor placement="top">
            <span>
              <CardActionArea
                href={activityVariantWithCurriculum(variant, curriculum)}
                disabled={!isUnlocked}
              >
                <CardMedia
                  component="img"
                  height={height ? 0.82 * height : '82%'}
                  color="red"
                  image={activityAssetPathname(
                    variant.authorSlug,
                    variant.activitySlug,
                    activity.previewImage.filename,
                  )}
                  alt={title}
                  sx={{ padding: 1, objectFit: 'contain', backgroundColor: activity.previewImage.backgroundColor }}
                />
                <CardContent sx={{
                  paddingY: { xs: 0, sm: 1 },
                  height: height ? 0.18 * height : '18%',
                  display: 'flex',
                  alignItems: 'baseline',
                  paddingRight: 0.5,
                }}
                >
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      fontSize: {
                        xs: '1rem', sm: '1.2rem', textOverflow: 'ellipsis',
                      },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flexShrink: 0,
                      flexGrow: 1,
                      flexBasis: 0,
                      minWidth: 0,
                    }}
                  >
                    {title}
                  </Typography>
                  <AvatarGroup
                    max={maxCompetenciesShown}
                    sx={{
                      marginLeft: 'auto',
                      flexShrink: 1,
                      flexGrow: 0,
                      '& .MuiAvatarGroup-avatar': {
                        width: 24,
                        height: 24,
                        fontSize: avatarFontSize,
                      },
                    }}
                    onMouseOver={() => setMaxCompetenciesShown(EXPANDED_MAX_COMPETENCIES_SHOWN)}
                    onMouseLeave={() => setMaxCompetenciesShown(COMPACT_MAX_COMPETENCIES_SHOWN)}
                  >
                    {curriculumActivity.learningObjectives.map((objective) => {
                      const competency = curriculum.competencies.find((c) => c.id === objective);
                      return competency ? (
                        <CompetencyAvatar
                          key={competency.id}
                          competency={competency}
                          fontSize={avatarFontSize}
                        />
                      ) : null;
                    })}
                  </AvatarGroup>
                </CardContent>
              </CardActionArea>
            </span>
          </Tooltip>
        </Card>
      </ActivityStatusBadge>
    </Box>
  );
}
