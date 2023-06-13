import { TipsAndUpdates } from '@mui/icons-material';
import {
  Alert,
  Box,
  Container,
  Link,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';
import ToolboxFunctionsList from '../components/ToolboxFunctionsList';
import VariantsGallery from '../components/VariantsGallery';
import { listActivitiesAllAuthors } from '../src/fs-content/authors';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { Activity, activityVariantId } from '../src/schemas/activitySchema';

export default function MyProgress({ activities } : { activities: Activity[] }) {
  const { metadata } = useLocalProfile();
  const cellsModifiedActivityVariantIds = metadata.activities
    .filter((a) => a.cellsModified)
    .map((a) => a.id);
  const completedActivityVariantIds = metadata.activities
    .filter((a) => a.completed)
    .map((a) => a.id);

  const activitiesWithVariants = activities.flatMap(
    (a) => a.variants.flatMap((v) => ({ activity: a, variant: v })),
  );
  const completedActivityVariants = activitiesWithVariants.filter(
    ({ variant }) => completedActivityVariantIds.includes(activityVariantId(variant)),
  );
  const inProgressActivityVariants = activitiesWithVariants.filter(
    ({ variant }) => cellsModifiedActivityVariantIds.includes(activityVariantId(variant))
     && !completedActivityVariantIds.includes(activityVariantId(variant)),
  );
  return (
    <div>
      <Head>
        <title>My Progress - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography variant="h3" align="center" marginTop={3}>My Progress</Typography>
          <Alert
            iconMapping={{
              success: <TipsAndUpdates fontSize="inherit" />,
            }}
            sx={{ mt: 3 }}
          >
            Do you want to export/import your data? Review or change your privacy settings?
            Visit the
            {' '}
            <Link href="/my-data">My Data</Link>
            {' '}
            page.
          </Alert>
          <Typography variant="h5" marginTop={6} marginBottom={3}>Completed Activities</Typography>
          <VariantsGallery
            activitiesWithVariants={completedActivityVariants}
          />
          <Typography variant="h5" marginTop={6} marginBottom={3}>In-Progress Activities</Typography>
          <VariantsGallery
            activitiesWithVariants={inProgressActivityVariants}
          />
          <div id="toolbox" className="anchor">
            <Typography variant="h5" marginTop={6} marginBottom={3}>Toolbox Functions</Typography>
            <ToolboxFunctionsList />
          </div>
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  const activities = await listActivitiesAllAuthors();
  return {
    props: {
      activities,
    },
  };
}
