import { Chip, Stack, Tooltip } from '@mui/material';
import { Dictionary, sortBy } from 'lodash';
import { useRouter } from 'next/router';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { knownConcepts } from '../src/schemas/activityConcepts';
import { conceptPathname } from '../src/urlUtils';

export default function ActivityConcepts({
  concepts,
  conceptsFrequency = undefined,
  small = false,
}: {
  concepts: string[];
  conceptsFrequency?: Dictionary<number>;
  small?: boolean;
}) {
  const router = useRouter();
  const { t } = useLocalTranslation(['concepts']);
  // Keep only known concepts
  const validConcepts = concepts.filter((concept) => concept in knownConcepts);

  // Sort alphabetically, or by frequency if provided
  const sortedConcepts = sortBy(validConcepts, (concept) =>
    conceptsFrequency === undefined ? concept : conceptsFrequency[concept],
  );

  return (
    <Stack
      direction='row'
      spacing={1}
      useFlexGap
      sx={{
        flexWrap: 'wrap',
      }}
    >
      {sortedConcepts.map((concept) => (
        <Tooltip
          key={concept}
          title={t(`${concept}.description`, {
            defaultValue: knownConcepts[concept].description,
          })}
          arrow
        >
          <Chip
            size={small ? 'small' : 'medium'}
            variant={small ? 'outlined' : 'filled'}
            color='primary'
            label={t(`${concept}.title`, {
              defaultValue: knownConcepts[concept].title,
            })}
            onClick={() => {
              router.push(conceptPathname(concept));
            }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
}
