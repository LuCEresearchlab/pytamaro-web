import {
  Box,
  Container,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';
import ActivitiesCompetenciesMatrix from '../../../../components/ActivitiesCompetenciesMatrix';
import AttributionInfo from '../../../../components/AttributionInfo';
import CompetenciesList from '../../../../components/CompetenciesList';
import CurriculumCard from '../../../../components/CurriculumCard';
import NavigationBar from '../../../../components/navbar/NavigationBar';
import PageTitle from '../../../../components/PageTitle';
import {
  getAuthorProfile,
  listAuthorsWithContent,
} from '../../../../src/fs-content/authors';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import useLocalTranslation from '../../../../src/localStorage/useLocalTranslation';
import { AuthorProfile } from '../../../../src/schemas/authorSchema';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { translationProps } from '../../../../src/serverSideTranslationProps';
import { curriculumInfoPathname } from '../../../../src/urlUtils';

export default function CurriculumInfoPage({
  curriculum,
  author,
}: {
  curriculum: Curriculum;
  author: AuthorProfile;
}) {
  const { t } = useLocalTranslation(['curriculum']);
  const { title } = curriculum;
  const pageTitle = `${title} - PyTamaro`;

  const [showMatrix, setShowMatrix] = useState(false);

  const handleShowMatrixChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setShowMatrix(event.target.checked);
  };

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar />
        <Container>
          <PageTitle>{`${t('curriculumInformation')} - ${title}`}</PageTitle>
          <CurriculumCard curriculum={curriculum} />
          <Typography variant='h4' marginY={3}>
            {t('authorLicense')}
          </Typography>
          <AttributionInfo
            type='curriculum'
            author={author}
            derivedFrom={curriculum.derivedFrom}
          />
          {curriculum.competencies.length > 0 && (
            <>
              <Box display='flex' alignItems='baseline' marginY={3}>
                <Typography variant='h4'>{t('competencies')}</Typography>
                <Box marginLeft='auto'>
                  <FormControlLabel
                    control={
                      <Switch
                        color='primary'
                        checked={showMatrix}
                        onChange={handleShowMatrixChange}
                      />
                    }
                    label={
                      <Typography color='text.secondary'>
                        {t('showMatrix')}
                      </Typography>
                    }
                    labelPlacement='start'
                  />
                </Box>
              </Box>
              {showMatrix && (
                <Box mb={6}>
                  <ActivitiesCompetenciesMatrix curriculum={curriculum} />
                </Box>
              )}
              <CompetenciesList curriculum={curriculum} />
            </>
          )}
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps(context: {
  params: {
    authorSlug: string;
    curriculumSlug: string;
  };
}) {
  const { authorSlug, curriculumSlug } = context.params;
  const author = await getAuthorProfile(authorSlug);
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      author,
      curriculum,
      ...(await translationProps(['curriculum'])),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsWithContent();
  const paths = authors.flatMap((author) =>
    author.curricula.map((curriculum) =>
      curriculumInfoPathname(author.slug, curriculum.slug),
    ),
  );
  return {
    paths,
    fallback: false,
  };
}
