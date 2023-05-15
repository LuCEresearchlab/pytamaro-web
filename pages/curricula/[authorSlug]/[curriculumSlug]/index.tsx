import {
  Stack,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import NavigationBar from '../../../../components/NavigationBar';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { curriculumPathname } from '../../../../src/urlUtils';
import listAuthors from '../../../../src/fs-content/authors';
import CurriculumFlow from '../../../../components/Curriculum/CurriculumFlow';
import CurriculumSeq from '../../../../components/Curriculum/CurriculumSeq';
import { METADATA_KEY, getDefaultMetadata } from '../../../../src/localStorage/schema';

export default function CurriculumPage({ curriculum }:
{ curriculum : Curriculum }) {
  const [compactView, setCompactView] = useState(false);
  const [metadata] = useLocalStorageState(METADATA_KEY, {
    defaultValue: getDefaultMetadata(),
  });
  const completedActivityVariantIds = metadata.activities
    .filter((a) => a.completed)
    .map((a) => a.id);

  return (
    <Stack spacing={2}>
      <NavigationBar>
        <Tooltip title="Compact View">
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
      <Typography variant="h2" marginY={3} align="center">{curriculum.title}</Typography>
      <Typography variant="h5" marginY={3} align="center">{curriculum.description}</Typography>
      {compactView && (
        <CurriculumSeq
          units={curriculum.units}
          completedActivityVariantIds={completedActivityVariantIds}
        />
      )}
      {!compactView && (
        <CurriculumFlow
          units={curriculum.units}
          completedActivityVariantIds={completedActivityVariantIds}
        />
      )}
    </Stack>
  );
}

export async function getStaticProps(
  context: { params: {
    authorSlug: string,
    curriculumSlug: string,
  } },
) {
  const {
    authorSlug, curriculumSlug,
  } = context.params;
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      curriculum,
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthors();
  const paths = authors
    .flatMap((author) => author.curricula.map(
      (curriculum) => curriculumPathname(author.slug, curriculum.slug),
    ));
  return {
    paths,
    fallback: false,
  };
}
