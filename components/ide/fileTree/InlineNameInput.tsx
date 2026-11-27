import { Description, InsertDriveFile } from '@mui/icons-material';
import { SvgIcon, TextField } from '@mui/material';
import { useState } from 'react';
import { isPythonFileName } from '../../../src/ide/files';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import PythonSvg from '../../icons/PythonSvg';

function PythonFileIcon() {
  return (
    <SvgIcon fontSize='small'>
      <PythonSvg />
    </SvgIcon>
  );
}

/**
 * The icon the tree shows next to a file, chosen by its kind and extension.
 */
export function fileIcon(name: string, binary: boolean) {
  return binary
    ? InsertDriveFile
    : isPythonFileName(name)
      ? PythonFileIcon
      : Description;
}

/**
 * The inline text field used both to create a new file / folder and to rename
 * an existing one.
 */
export function InlineNameInput({
  initialName = '',
  placeholder,
  onSubmit,
  onCancel,
  onNameChange = undefined,
}: {
  initialName?: string;
  placeholder: string;
  onSubmit: (name: string) => boolean;
  onCancel: () => void;
  onNameChange?: (name: string) => void;
}) {
  const { t } = useLocalTranslation(['ide']);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setError(t('fileNameEmpty'));
      return;
    }
    if (!onSubmit(trimmedName)) {
      setError(t('fileNameUnavailable'));
    }
  };

  return (
    <TextField
      autoFocus
      size='small'
      type='text'
      fullWidth
      variant='standard'
      placeholder={placeholder}
      value={name}
      error={error !== null}
      helperText={error}
      sx={{ display: 'flex', flexGrow: 1, minWidth: 0 }}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        setName(event.target.value);
        onNameChange?.(event.target.value);
        setError(null);
      }}
      onFocus={(event) => event.target.select()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onCancel();
        }
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
          submit();
        } else if (event.key === 'Escape') {
          onCancel();
        }
      }}
    />
  );
}
