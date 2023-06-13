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
import { Activity } from '../src/schemas/activitySchema';

export default function MyProgress({ activities } : { activities: Activity[] }) {
  const activitiesWithVariants = activities.flatMap(
    (a) => a.variants.flatMap((v) => ({ activity: a, variant: v })),
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
          <Typography variant="h5" marginTop={6} marginBottom={3}>My Activities</Typography>
          <VariantsGallery
            activitiesWithVariants={activitiesWithVariants}
          />
          <Typography variant="h5" marginTop={6} marginBottom={3}>My Toolbox</Typography>
          <ToolboxFunctionsList />
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
