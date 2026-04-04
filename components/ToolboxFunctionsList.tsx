import { Button, Card, CardActions, Stack, Typography } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { Trans } from 'next-i18next';
import { useEffect, useState } from 'react';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import { ToolboxFunction } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import scrollToAnchor from '../src/scrollToAnchor';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import theme from '../src/theme';
import { toolboxFunctionAnchor } from '../src/urlUtils';
import EditToolboxFunctionButton from './EditToolboxFunctionButton';
import ToolboxFunctionCardContent from './ToolboxFunctionCardContent';

export default function ToolboxFunctionsList({
  filterNameDesc,
}: {
  filterNameDesc: string;
}) {
  const { t } = useLocalTranslation();
  const { metadata } = useLocalProfile();
  const { list, deleteFunction } = useLocalToolbox();
  const confirm = useConfirm();
  const [scrolled, setScrolled] = useState(false);

  const functions = list();

  useEffect(() => {
    if (functions !== undefined && !scrolled) {
      scrollToAnchor();
      setScrolled(true);
    }
  }, [scrolled, functions]);

  const filteredFunctions = functions.filter((fn) => {
    const search = filterNameDesc.toLowerCase();
    return (
      fn.name.toLowerCase().includes(search) ||
      fn.description.toLowerCase().includes(search)
    );
  });

  const askDeleteFunction = (fn: ToolboxFunction) => {
    confirm({
      description: (
        <>
          <Typography gutterBottom>
            <Trans
              t={t}
              i18nKey={'toolbox.deleteWarningBreak'}
              values={{ name: fn.name }}
              components={{
                code: (
                  <Typography
                    fontFamily={theme.pytamaro.monospaceFontFamily}
                    component='span'
                  />
                ),
              }}
            />
          </Typography>
          <Typography gutterBottom>{t('toolbox.deleteWarningFine')}</Typography>
          <Typography gutterBottom>{t('toolbox.deleteWarningEdit')}</Typography>
        </>
      ),
      title: t('toolbox.deleteAreYouSure'),
      confirmationText: t('toolbox.deleteConfirm'),
      cancellationText: t('confirmCancel'),
    }).then(({ confirmed }) => {
      if (confirmed) {
        logAnalyticsEvent(AnalyticsEventName.DeleteToolboxFunction, {
          name: fn.name,
        });
        storeDbEvent(EventName.DeleteToolboxFunction, metadata, { fn });
        deleteFunction(fn);
      }
    });
  };

  return functions.length === 0 ? (
    <Typography variant='body1' marginY={3}>
      {t('toolbox.toolboxEmpty')}
    </Typography>
  ) : filteredFunctions.length === 0 ? (
    <Typography variant='body1' marginY={3}>
      {t('toolbox.noFunctionSearch')}
    </Typography>
  ) : (
    <Stack direction='column' spacing={3}>
      {filteredFunctions.map((fn) => (
        <Card
          key={fn.name}
          id={toolboxFunctionAnchor(fn.name)}
          className='anchor'
          sx={{ overflow: 'visible' }}
        >
          <ToolboxFunctionCardContent fn={fn} />
          <CardActions sx={{ justifyContent: 'center' }}>
            <EditToolboxFunctionButton toolboxFunction={fn} />
            <Button
              onClick={() => askDeleteFunction(fn)}
              color='error'
              variant='contained'
            >
              {t('toolbox.deleteFunction')}
            </Button>
          </CardActions>
        </Card>
      ))}
    </Stack>
  );
}
