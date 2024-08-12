/* eslint-disable @next/next/no-img-element */
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow, Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { TFunction } from 'i18next';
import { Settings, Visibility } from '@mui/icons-material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  Function, JsonObjType, LibraryString, Type, Variable,
  functionSignature,
} from '../../src/JsonAst/Json_structure';
import theme from '../../src/theme';

let t: TFunction<string[], undefined>;

function TypeCell({ type }: { type: string }) {
  return type === ''
    ? <Typography component="span" fontStyle="italic" color="text.secondary">N/A</Typography>
    : (
      <Typography
        component="span"
        fontFamily={theme.pytamaro.monospaceFontFamily}
      >
        {type}
      </Typography>
    );
}

function hasDefault(parameters: Variable[] | undefined): boolean {
  if (parameters !== undefined && parameters.length > 0) {
    return parameters.some((param) => !!param.default_value);
  }
  return false;
}

function hasDescription(
  parameters: Variable[] | undefined,
  return_description: string | undefined,
): boolean {
  if (return_description) {
    return true;
  }
  if (parameters !== undefined && parameters.length > 0) {
    parameters.some((param) => !!param.description);
  }
  return false;
}

function OptionButton({
  fn,
  optional,
  types,
  LinkButton = null,
}: Readonly<{
  fn: Function,
  optional: {
    show: boolean,
    toggle: () => void
  },
  types: {
    show: boolean,
    toggle: () => void
  },
  LinkButton?: JSX.Element | null,
}>): JSX.Element {
  return (
    <ToggleButtonGroup
      aria-label="text formatting"
      sx={{ ml: 'auto' }}
    >
      {hasDefault(fn.parameters)
        ? (
          <ToggleButton
            value="optional"
            selected={optional.show}
            onChange={optional.toggle}
            aria-label="bold"
            size="small"
          >
            <Tooltip
              title={`${optional.show ? t('hide') : t('show')} ${t('documentationPopUp.optionalParameters')}`}
            >
              <Settings />
            </Tooltip>
          </ToggleButton>
        ) : null}
      <ToggleButton
        value="types"
        selected={types.show}
        onChange={types.toggle}
        aria-label="italic"
        size="small"
      >
        <Tooltip title={`${types.show ? t('hide') : t('show')} ${t('documentationPopUp.type')}`}>
          <Visibility />
        </Tooltip>
      </ToggleButton>
      {LinkButton}
    </ToggleButtonGroup>
  );
}

function parameterRow(
  arg: Variable,
  showOptional: boolean,
  showType: boolean,
  showDescription: boolean,
): JSX.Element {
  return (
    <TableRow
      key={arg.name}
    >
      <TableCell component="th" scope="row" sx={{ pl: 0 }}>
        <Typography
          component="span"
          fontFamily={theme.pytamaro.monospaceFontFamily}
        >
          {arg.name}
        </Typography>
      </TableCell>
      {showType && (
        <TableCell>
          <TypeCell type={arg.type ? arg.type : ''} />
        </TableCell>
      )}
      {showDescription && (
        <TableCell component="th" scope="row" sx={{ pl: 0 }}>
          <Typography
            component="span"
          >
            {arg.description ? arg.description.content : ''}
          </Typography>
        </TableCell>
      )}
      {showOptional && (
        <TableCell component="th" scope="row" sx={{ pl: 0 }}>
          <Typography
            component="span"
            fontFamily={theme.pytamaro.monospaceFontFamily}
          >
            {arg.default_value ? arg.default_value : 'N/A'}
          </Typography>
        </TableCell>
      )}
    </TableRow>
  );
}

function ParametersTable({
  params,
  return_type,
  return_description,
  showOptional,
  showType,
}: Readonly<{
  params: Variable[] | undefined,
  return_type: string | undefined,
  return_description: string | undefined,
  showOptional: boolean,
  showType: boolean
}>): JSX.Element {
  const showDescription = hasDescription(params, return_description);
  return (
    <Table aria-label="Function Parameters" size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ pl: 0 }}>{t('documentationPopUp.parameterReturn')}</TableCell>
          {showType && (<TableCell>{t('documentationPopUp.type')}</TableCell>)}
          {showDescription && (<TableCell>{t('documentationPopUp.description')}</TableCell>)}
          {showOptional && (<TableCell>{t('documentationPopUp.defaultValue')}</TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {params?.map((arg: Variable) => {
          if (arg.default_value) {
            return showOptional && (parameterRow(arg, showOptional, showType, showDescription));
          }
          return parameterRow(arg, showOptional, showType, showDescription);
        })}
        <TableRow
          key="return"
          sx={{
            borderTopStyle: 'double',
            borderTopColor: theme.palette.grey[300],
            '&:last-child td, &:last-child th': { border: 0 },
          }}
        >
          <TableCell component="th" scope="row" sx={{ pl: 0 }}>
            <Typography component="span">{t('documentationPopUp.returnValue')}</Typography>
          </TableCell>
          {showType && (
            <TableCell>
              <TypeCell
                type={return_type ?? ''}
              />
            </TableCell>
          )}
          <TableCell>
            <Typography component="span">{return_description ?? ''}</Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function FunctionSpecificCard({
  fn,
  showOptional,
  showType,
}: Readonly<{
  fn: Function,
  showOptional: boolean,
  showType: boolean
}>): JSX.Element {
  return (
    <Card sx={{
      px: 2,
      my: 2,
    }}
    >
      <ParametersTable
        params={fn.parameters}
        return_type={fn.return_type}
        return_description={fn.return_description}
        showOptional={showOptional}
        showType={showType}
      />
    </Card>
  );
}

export default function DocumentationCardContent({
  obj,
  obj_type = JsonObjType.function,
  library = LibraryString.English,
  LinkButton = null,
  ImplementationAndUsage = null,
  showOptionalInitial = false,
  showTypeInitial = true,
}: Readonly<{
  obj: Function | Type | Variable,
  obj_type?: JsonObjType,
  library?: LibraryString,
  LinkButton?: JSX.Element | null,
  ImplementationAndUsage?: JSX.Element | null,
  showOptionalInitial?: boolean,
  showTypeInitial?: boolean
}>) {
  const [showOptional, setShowOptional] = useState(showOptionalInitial);
  const toggleShowOptional = () => setShowOptional(!showOptional);
  const [showType, setShowType] = useState(showTypeInitial);
  const toggleShowType = () => setShowType(!showType);

  t = useLocalTranslation().t;

  return (
    <CardContent sx={{
      pb: 1,
      maxWidth: '100ch',
    }}
    >
      <Box display="flex">
        <Typography color="text.secondary" component="span" mr="1ch" fontWeight="bold">
          {t(`documentationPopUp.${obj_type?.toLowerCase()}`)}
        </Typography>
        <Typography color="text.secondary" component="span" mr="1ch">
          from
          {' '}
          {library}
        </Typography>
        {obj_type === JsonObjType.function
          ? (
            <OptionButton
              fn={obj as Function}
              optional={{
                show: showOptional,
                toggle: toggleShowOptional,
              }}
              types={{
                show: showType,
                toggle: toggleShowType,
              }}
              LinkButton={LinkButton}
            />
          ) : null}
      </Box>
      <Box display="flex" marginTop="1ch">
        <Typography
          component="span"
          fontFamily={theme.pytamaro.monospaceFontFamily}
          bgcolor="#e7f2fa"
          borderTop="3px solid #6ab0de"
        >
          {(obj_type === JsonObjType.function)
            ? functionSignature(obj, showOptional, showType)
            : obj.name}
        </Typography>
      </Box>
      <Typography color="text.secondary">
        {obj.description ? obj.description?.content : ''}

      </Typography>
      {obj.description?.images?.map((img, index) => (
        <figure key={`Fig${index + 1}`}>
          <img
            src={img.uri}
            alt={img.caption}
            width="128"
            height="128"
          />
          <figcaption>
            Fig
            {index + 1}
            -
            {img.caption}
          </figcaption>
        </figure>
      ))}
      {obj_type === JsonObjType.function
        ? (
          <FunctionSpecificCard
            fn={obj as Function}
            showOptional={showOptional}
            showType={showType}
          />
        ) : null}
      {ImplementationAndUsage}
    </CardContent>
  );
}
