import { Box, Chip, Divider } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

type Option = {
  id: string;
  label: string;
  url?: string;
  all?: boolean;
};

export default function SelectAll({
  title, placeholder, options, maxTagsShown, initialSelection = options, onSelectionChange,
} :
{ title: string, placeholder: string, options: Option[], maxTagsShown: number,
  initialSelection?: Option[], onSelectionChange: (selectedIds: string[]) => void }) {
  const [selectedOptions, setSelectedOptions] = useState(initialSelection);
  const router = useRouter();
  const { t } = useLocalTranslation();
  return (
    <Autocomplete
      multiple
      value={selectedOptions}
      filterOptions={(opts, params) => {
        const filter = createFilterOptions<Option>();
        const filtered = filter(opts, params);
        return [{
          label: t('selectAll'), id: '__ALL__', url: '', all: true,
        }, ...filtered];
      }}
      limitTags={maxTagsShown}
      renderTags={(value, getConceptProps) => value.map((option, index) => {
        const { key, ...customConceptProps } = getConceptProps({ index });
        return (
          <Chip
            key={key}
            label={option.label}
            onClick={(e) => { if (option.url) { e.stopPropagation(); router.push(option.url); } }}
            size="medium"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...customConceptProps}
          />
        );
      })}
      onChange={(_event, newSelectedOptions) => {
        let selectedConsideringAll = newSelectedOptions;
        if (newSelectedOptions.find((option) => option.all)) {
          selectedConsideringAll = selectedOptions.length === options.length ? [] : options;
        }
        setSelectedOptions(selectedConsideringAll);
        onSelectionChange(selectedConsideringAll.filter((v) => !v.all).map((v) => v.id));
      }}
      options={options}
      disableCloseOnSelect
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option, { selected }) => (
        <Box key={option.id}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <li {...props}>
            <Checkbox
              checked={option.all ? !!(selectedOptions.length === options.length) : selected}
              indeterminate={option.all && selectedOptions.length > 0
                                        && selectedOptions.length < options.length}
            />
            {option.label}
          </li>
          {option.all && <Divider />}
        </Box>
      )}
      renderInput={(params) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TextField {...params} label={title} placeholder={placeholder} />
      )}
    />
  );
}
