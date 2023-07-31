import { Route } from '@mui/icons-material';
import { Alert, AlertTitle, Typography } from '@mui/material';
import { Curriculum } from '../src/schemas/curriculumSchema';
import CurriculaList from './CurriculaList';

export default function GoToCurriculaBanner({ curricula } : { curricula: Curriculum[] }) {
  const single = curricula.length === 1;
  return curricula.length === 0 ? null : (
    <Alert icon={<Route />} severity="success" sx={{ my: 2 }}>
      <AlertTitle>
        {`This activity is part of ${single ? 'a curriculum' : 'multiple curricula'}.`}
      </AlertTitle>
      <Typography gutterBottom>
        While you can work through this activity right on this page,
        we recommend you start a curriculum now to get an optimal learning experience.
      </Typography>
      <CurriculaList curricula={curricula} />
    </Alert>
  );
}
