import {
  Button, Card, CardActions, Stack, Typography,
} from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { ToolboxFunction } from '../src/localStorage/schema';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import theme from '../src/theme';
import ToolboxFunctionSummary from './ToolboxFunctionCard';

export default function ToolboxFunctionsList() {
  const { list, deleteFunction } = useLocalToolbox();
  const confirm = useConfirm();

  const functions = list();

  const askDeleteFunction = (fn: ToolboxFunction) => {
    confirm({
      description:
  <>
    <Typography component="p">
      Deleting the function
      {' '}
      <Typography fontFamily={theme.pytamaro.monospaceFontFamily} component="span">{fn.name}</Typography>
      {' '}
      will break every activity and every other toolbox function that imports it.
    </Typography>
    <Typography component="p">
      If no activity and no other toolbox function uses this function,
      then it is perfectly fine to delete it.
    </Typography>
    <Typography component="p">
      You
      {' '}
      <strong>can</strong>
      {' '}
      replace this function by deleting it and then saving a new function with
      the same name and parameters. Any activities and other toolbox functions
      that used this function will automatically use your newly saved function.
    </Typography>
  </>,
      title: 'Are you sure you want to delete this function?',
      confirmationText: 'I understand, Delete',

    }).then(() => {
      deleteFunction(fn);
    });
  };

  return (
    functions.length === 0 ? (
      <Typography variant="body1" marginY={3}>
        The toolbox is still empty.
      </Typography>
    ) : (
      <Stack
        direction="column"
        spacing={2}
      >
        {functions.map((fn) => (
          <Card key={fn.name}>
            <ToolboxFunctionSummary fn={fn} sourceHidden={false} />
            <CardActions>
              <Button
                onClick={() => askDeleteFunction(fn)}
                color="primary"
                variant="contained"
                sx={{ ml: 1 }}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    ));
}
