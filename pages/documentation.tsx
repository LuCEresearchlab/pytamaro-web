import {
  Card, ClickAwayListener,
  IconButton,
  Stack, TextField, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { debounce } from 'lodash';
import React, {
  ChangeEvent, useEffect, useMemo, useState,
} from 'react';
import { QuestionMark } from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import { translationProps } from '../src/serverSideTranslationProps';
import DocumentationGrid from '../components/documentation/DocumentationGrid';
import { DividedModule, JsonConverter } from '../src/JsonAst/JsonConverter';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import SelectAll from '../components/SelectAll';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import { LanguageString } from '../src/JsonAst/Json_structure';
import Popup from '../components/Popup';
import scrollToAnchor from '../src/scrollToAnchor';

export default function Documentation({
  English,
  Italian,
  French,
  German,
  InitialShowToolbox = true,
}: {
  English: DividedModule,
  Italian: DividedModule,
  French: DividedModule,
  German: DividedModule,
  InitialShowToolbox: boolean
}) {
  const {
    t,
    i18n,
  } = useLocalTranslation();
  const [filterNameDesc, setFilterNameDesc] = useState('');
  const handleNewFilter = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterNameDesc(e.target.value);
  };

  const filteredEnglish: DividedModule = useMemo(() => ({
    functions: [],
    types: [],
    variables: [],
  }), []);
  const filteredItalian: DividedModule = useMemo(() => ({
    functions: [],
    types: [],
    variables: [],
  }), []);
  const filteredGerman: DividedModule = useMemo(() => ({
    functions: [],
    types: [],
    variables: [],
  }), []);
  const filteredFrench: DividedModule = useMemo(() => ({
    functions: [],
    types: [],
    variables: [],
  }), []);

  const typeOption = useMemo(() => [
    {
      id: 'function',
      label: 'Function',
    },
    {
      id: 'type',
      label: 'Type',
    },
    {
      id: 'constant',
      label: 'Constant',
    }], []);

  // TODO: change this using LibraryString and LanguageString
  const libraryOption = useMemo(
    () => [
      {
        id: 'en',
        label: 'pytamaro',
        source: English,
        target: filteredEnglish,
      },
      {
        id: 'it',
        label: `pytamaro.${LanguageString.Italian}`,
        source: Italian,
        target: filteredItalian,
      },
      {
        id: 'ge',
        label: `pytamaro.${LanguageString.German}`,
        source: German,
        target: filteredGerman,
      },
      {
        id: 'fr',
        label: `pytamaro.${LanguageString.French}`,
        source: French,
        target: filteredFrench,
      },
      {
        id: 'toolbox',
        label: 'Toolbox',
        source: null,
        target: null,
      },
    ],
    [English,
      French,
      German,
      Italian,
      filteredEnglish,
      filteredFrench,
      filteredGerman,
      filteredItalian],
  );

  const toolboxFunctions = useLocalToolbox()
    .list();

  const initialLibrary = [
    libraryOption.find((lang) => lang.id === i18n.language)
    || libraryOption[0]];
  if (InitialShowToolbox) {
    initialLibrary.push(libraryOption[4]);
  }
  const [allowedTypes, setAllowedTypes] = useState<string[]>(typeOption.map(
    (opt) => opt.id,
  ));
  const [allowedLibrary, setAllowedLibrary] = useState<string[]>(
    initialLibrary.map((lang) => lang.id),
  );
  const [filteredNames, setFilteredNames] = useState<DividedModule[]>(
    [filteredEnglish, filteredItalian, filteredGerman, filteredFrench],
  );
  const [showToolbox, setShowToolbox] = useState<boolean>(
    InitialShowToolbox,
  );

  useEffect(
    () => {
      libraryOption.forEach((obj) => {
        const { target } = obj;
        if (target) {
          target.functions = [];
          target.types = [];
          target.variables = [];
        }
      });
      setShowToolbox(false);

      allowedLibrary.forEach((lib) => {
        if (lib === 'toolbox') {
          setShowToolbox(true);
        } else {
          const source = libraryOption.find((opt) => opt.id === lib)?.source;
          const target = libraryOption.find((opt) => opt.id === lib)?.target;
          if (source && target) {
            if (allowedTypes.includes(typeOption[0].id)) {
              target.functions.push(...source.functions);
            }
            if (allowedTypes.includes(typeOption[1].id)) {
              target.types.push(...source.types);
            }
            if (allowedTypes.includes(typeOption[2].id)) {
              target.variables.push(...source.variables);
            }
          }
        }
      });

      setFilteredNames([filteredEnglish, filteredItalian, filteredGerman, filteredFrench]);
      scrollToAnchor();
    },
    [filteredEnglish,
      filteredItalian,
      filteredGerman,
      filteredFrench,
      allowedLibrary,
      allowedTypes,
      showToolbox,
      libraryOption,
      typeOption],
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Stack spacing={2}>
      <NavigationBar />
      <PageTitle>{t('PyTamaroDocumentation')}</PageTitle>

      <Grid container spacing={2}>
        <Grid xs={12} lg={4}>
          <SelectAll
            title="Kind"
            placeholder="Kind"
            options={typeOption}
            initialSelection={typeOption}
            onSelectionChange={setAllowedTypes}
            maxTagsShown={3}
          />
        </Grid>
        <ClickAwayListener onClickAway={handlePopoverClose}>
          <Grid xs={12} lg={4}>
            <TextField
              fullWidth
              label="Search by name or signature"
              variant="outlined"
              onChange={debounce(handleNewFilter, 100)}
              InputProps={{
                endAdornment:
  <IconButton onClick={handlePopoverOpen}>
    <QuestionMark />
  </IconButton>,
              }}
            />
            <Popup
              id="help-popover"
              anchorEl={anchorEl}
              open={open}
              placement="right"
            >
              <Card>
                <Typography>There are two possibility to search:</Typography>
                <ul>
                  <li>
                    By utilizing the
                    {' '}
                    <b>name</b>
                    {' '}
                    or a part of it, a function,
                    constant, class, or function saved in the toolbox
                  </li>
                  <li>
                    By utilizing the
                    {' '}
                    <b>function signature</b>
                    {' '}
                    with this
                    structure
                    {' '}
                    <br />
                    <i>
                      (parameter type, parameter type, ...) -
                      {'>'}
                      {' '}
                      return type
                    </i>
                  </li>
                </ul>
                TODO: ADD example signature with brief explanation
              </Card>
            </Popup>
          </Grid>
        </ClickAwayListener>

        <Grid xs={12} lg={4}>
          <SelectAll
            title="Library"
            placeholder="Library"
            options={libraryOption}
            initialSelection={initialLibrary}
            onSelectionChange={setAllowedLibrary}
            maxTagsShown={3}
          />
        </Grid>
      </Grid>
      <DocumentationGrid
        filterNameDesc={filterNameDesc}
        English={filteredNames[0]}
        Italian={filteredNames[1]}
        German={filteredNames[2]}
        French={filteredNames[3]}
        showToolbox={showToolbox}
        toolboxFunctions={toolboxFunctions}
      />
    </Stack>
  );
}

export async function getStaticProps() {
  const jsonConverter = new JsonConverter();
  await jsonConverter.init();
  return {
    props: {
      English: jsonConverter.languageDividedByType(LanguageString.English),
      Italian: jsonConverter.languageDividedByType(LanguageString.Italian),
      French: jsonConverter.languageDividedByType(LanguageString.French),
      German: jsonConverter.languageDividedByType(LanguageString.German),
      ...await translationProps(),
    },
  };
}
