import Category from '@mui/icons-material/Category';
import Schema from '@mui/icons-material/Schema';
import Tune from '@mui/icons-material/Tune';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';

export const SHOW_DIAGRAM_KEY = 'diagram';
export const SHOW_OPTIONAL_KEY = 'optional';
export const SHOW_TYPES_KEY = 'types';

function tooltipMessageI18n(key: string, active: boolean) {
  const prefix = active ? 'hide' : 'show';
  const suffix =
    key === SHOW_DIAGRAM_KEY
      ? 'Diagram'
      : key === SHOW_OPTIONAL_KEY
        ? 'OptionalParams'
        : 'Types';
  return `${prefix}${suffix}`;
}

export default function ConfigButtons({ available }: { available: string[] }) {
  const { t } = useLocalTranslation();
  const { docsMetadata, setDocsMetadata } = useLocalProfile();
  const [optionsKeys, setOptionsKeys] = useState<string[]>([]);
  useEffect(() => {
    const newOptions = [];
    if (docsMetadata.showDiagram && available.includes(SHOW_DIAGRAM_KEY)) {
      newOptions.push(SHOW_DIAGRAM_KEY);
    }
    if (docsMetadata.showOptional && available.includes(SHOW_OPTIONAL_KEY)) {
      newOptions.push(SHOW_OPTIONAL_KEY);
    }
    if (docsMetadata.showTypes && available.includes(SHOW_TYPES_KEY)) {
      newOptions.push(SHOW_TYPES_KEY);
    }
    setOptionsKeys(newOptions);
  }, [docsMetadata, available]);
  const handleOptionsKeys = (
    ev: React.MouseEvent<HTMLElement>,
    value: string[],
  ) => {
    setOptionsKeys(value);
    setDocsMetadata({
      showDiagram: available.includes(SHOW_DIAGRAM_KEY)
        ? value.includes(SHOW_DIAGRAM_KEY)
        : docsMetadata.showDiagram,
      showOptional: available.includes(SHOW_OPTIONAL_KEY)
        ? value.includes(SHOW_OPTIONAL_KEY)
        : docsMetadata.showOptional,
      showTypes: available.includes(SHOW_TYPES_KEY)
        ? value.includes(SHOW_TYPES_KEY)
        : docsMetadata.showTypes,
    });
  };
  return (
    <ToggleButtonGroup
      sx={{ ml: 'auto', mt: -1, pb: 1 }}
      size='small'
      value={optionsKeys}
      onChange={handleOptionsKeys}
    >
      {available.map((key) => (
        <Tooltip
          key={key}
          title={t(tooltipMessageI18n(key, optionsKeys.includes(key)))}
          arrow
        >
          <ToggleButton value={key}>
            {key === SHOW_DIAGRAM_KEY && <Schema />}
            {key === SHOW_OPTIONAL_KEY && <Tune />}
            {key === SHOW_TYPES_KEY && <Category />}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
}
