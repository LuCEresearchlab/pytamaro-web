import {
  Button, Card, CardActions, Stack, Typography,
} from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { ToolboxFunction } from '../src/localStorage/schema';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import theme from '../src/theme';
import ToolboxFunctionSummary from './ToolboxFunctionSummary';

export default function ToolboxFunctionsList() {
  const { list, deleteFunction } = useLocalToolbox();
  const confirm = useConfirm();

  const functions = list();

  const askDeleteFunction = (fn: ToolboxFunction) => {
    confirm({
      description:
  <Typography component="span">
    Are you sure you want to delete the function
    {' '}
    <Typography fontFamily={theme.pytamaro.monospaceFontFamily} component="span">{fn.name}</Typography>
    {' '}
    from your toolbox?
  </Typography>,
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
