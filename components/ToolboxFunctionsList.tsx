import {
  Button, Card, CardActions, Stack, Typography,
} from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { useEffect } from 'react';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import { ToolboxFunction } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import scrollToAnchor from '../src/scrollToAnchor';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import theme from '../src/theme';
import { toolboxFunctionAnchor } from '../src/urlUtils';
import EditToolboxFunctionButton from './EditToolboxFunctionButton';
import ToolboxFunctionCardContent from './documentation/ToolboxFunctionCardContent.tsx';

export default function ToolboxFunctionsList({ filterNameDesc }: { filterNameDesc: string }) {
  const { metadata } = useLocalProfile();
  const { list, deleteFunction } = useLocalToolbox();
  const confirm = useConfirm();

  const functions = list();

  useEffect(() => {
    scrollToAnchor();
  }, [functions]);

  const filteredFunctions = functions.filter((fn) => {
    const search = filterNameDesc.toLowerCase();
    return fn.name.toLowerCase().includes(search) || fn.description.toLowerCase().includes(search);
  });

  const askDeleteFunction = (fn: ToolboxFunction) => {
    confirm({
      description:
  <>
    <Typography gutterBottom>
      Deleting the function
      {' '}
      <Typography fontFamily={theme.pytamaro.monospaceFontFamily} component="span">{fn.name}</Typography>
      {' '}
      will break every activity and every other toolbox function that imports it.
    </Typography>
    <Typography gutterBottom>
      If no activity and no other toolbox function uses this function,
      then it is perfectly fine to delete it.
    </Typography>
    <Typography gutterBottom>
      You can change all the details of this function (except for its name) using the Edit button.
    </Typography>
  </>,
      title: 'Are you sure you want to delete this function?',
      confirmationText: 'I understand, Delete',

    }).then(() => {
      logAnalyticsEvent(AnalyticsEventName.DeleteToolboxFunction, { name: fn.name });
      storeDbEvent(EventName.DeleteToolboxFunction, metadata, { fn });
      deleteFunction(fn);
    });
  };

  return (
    // eslint-disable-next-line no-nested-ternary
    functions.length === 0 ? (
      <Typography variant="body1" marginY={3}>
        The toolbox is still empty.
      </Typography>
    ) : (
      filteredFunctions.length === 0 ? (
        <Typography variant="body1" marginY={3}>
          No function matches the search criteria.
        </Typography>
      ) : (
        <Stack
          direction="column"
          spacing={3}
        >
          {filteredFunctions.map((fn) => (
            <Card key={fn.name} id={toolboxFunctionAnchor(fn.name)} className="anchor" sx={{ overflow: 'visible' }}>
              <ToolboxFunctionCardContent fn={fn} />
              <CardActions sx={{ justifyContent: 'center' }}>
                <EditToolboxFunctionButton toolboxFunction={fn} />
                <Button
                  onClick={() => askDeleteFunction(fn)}
                  color="error"
                  variant="contained"
                >
                  Delete Function
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )
    ));
}
