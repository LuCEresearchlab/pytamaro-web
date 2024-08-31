import { useEffect } from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import scrollToAnchor from '../../src/scrollToAnchor';
import {
  Function,
  functionMandatoryParameter,
  JsonObjType,
  LibraryString,
} from '../../src/JsonAst/Json_structure';
import { DividedModule } from '../../src/JsonAst/JsonConverter';
import SmallDocumentationCard from './SmallDocumentationCard';
import { ToolboxFunction } from '../../src/localStorage/schema';
import { toolboxFunctionAnchor } from '../../src/urlUtils';

function parseSignature(signature: string): { paramTypes: string[], returnType: string | null } {
  const arrowIndex = signature.indexOf('->');
  let paramPart = arrowIndex >= 0 ? signature.slice(0, arrowIndex)
    .trim() : signature.trim();
  const returnType = arrowIndex >= 0 ? signature.slice(arrowIndex + 2)
    .trim() : null;

  // Remove parentheses from parameter part
  if (paramPart.startsWith('(') && paramPart.endsWith(')')) {
    paramPart = paramPart.slice(1, -1);
  }

  // Split parameter types by comma
  const paramTypes = paramPart ? paramPart.split(',')
    .map((type) => type.trim()) : [];

  return {
    paramTypes,
    returnType,
  };
}

// TODO: add possibilities to visualize intermediate results
function isValidSignature(signature: string, func: Function): boolean {
  const {
    paramTypes,
    returnType,
  } = parseSignature(signature);

  if (signature.includes('(') && signature.includes(')')) {
    if (func.parameters) {
      const funcParamTypes = func.parameters.map((param) => param.type?.toLowerCase());

      if (paramTypes.length !== functionMandatoryParameter(func)) {
        return false;
      }

      for (let i = 0; i < paramTypes.length; i += 1) {
        if (paramTypes[i] !== funcParamTypes[i]) {
          return false;
        }
      }
    } else if (paramTypes.length > 0) {
      return false;
    }
  }

  if (func.return_type) {
    if (returnType !== '') {
      if (returnType !== func.return_type.toLowerCase()) {
        return false;
      }
    }
  } else if (returnType !== null) {
    return false;
  }

  return true;
}

function filtering(names: DividedModule, search: string) {
  const result: DividedModule = {
    functions: [],
    types: [],
    variables: [],
  };
  result.functions = names.functions.filter((fn) => {
    if (fn.name.toLowerCase().includes(search) || isValidSignature(search, fn)) {
      return fn;
    }
    return null;
  });
  result.types = names.types.filter((type) => type.name.toLowerCase()
    .includes(search));
  result.variables = names.variables.filter((variable) => variable.name.toLowerCase()
    .includes(search));
  return result;
}

function isEmpty(names: DividedModule) {
  return (names.functions.length === 0 && names.variables.length === 0 && names.types.length === 0);
}

function noValue(
  English: DividedModule,
  Italian: DividedModule,
  German: DividedModule,
  French: DividedModule,
  ToolBox: ToolboxFunction[],
) {
  return (isEmpty(English)
        && isEmpty(Italian)
        && isEmpty(German)
        && isEmpty(French)
        && ToolBox.length === 0);
}

function FunctionCards({
  English,
  Italian,
  German,
  French,
}: Readonly<{
  English: DividedModule, Italian: DividedModule, German: DividedModule, French: DividedModule,
}>): JSX.Element {
  return (
    <>
      {English.functions.map((fn) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`function-En-${fn.name}`}>
          <SmallDocumentationCard
            obj={fn}
            obj_type={JsonObjType.function}
            library={LibraryString.English}
          />
        </Grid>
      ))}
      {Italian.functions.map((fn) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`function-It-${fn.name}`}>
          <SmallDocumentationCard
            obj={fn}
            obj_type={JsonObjType.function}
            library={LibraryString.Italian}
          />
        </Grid>
      ))}
      {German.functions.map((fn) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`function-De-${fn.name}`}>
          <SmallDocumentationCard
            obj={fn}
            obj_type={JsonObjType.function}
            library={LibraryString.German}
          />
        </Grid>
      ))}
      {French.functions.map((fn) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`function-Fr-${fn.name}`}>
          <SmallDocumentationCard
            obj={fn}
            obj_type={JsonObjType.function}
            library={LibraryString.French}
          />
        </Grid>
      ))}
    </>
  );
}

function TypeCards({
  English,
  Italian,
  German,
  French,
}: Readonly<{
  English: DividedModule, Italian: DividedModule, German: DividedModule, French: DividedModule,
}>): JSX.Element {
  return (
    <>
      {English.types.map((type) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`type-En-${type.name}`}>
          <SmallDocumentationCard
            obj={type}
            obj_type={JsonObjType.type}
            library={LibraryString.English}
          />
        </Grid>
      ))}
      {Italian.types.map((type) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`type-It-${type.name}`}>
          <SmallDocumentationCard
            obj={type}
            obj_type={JsonObjType.type}
            library={LibraryString.Italian}
          />
        </Grid>
      ))}
      {German.types.map((type) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`type-De-${type.name}`}>
          <SmallDocumentationCard
            obj={type}
            obj_type={JsonObjType.type}
            library={LibraryString.German}
          />
        </Grid>
      ))}
      {French.types.map((type) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`type-Fr-${type.name}`}>
          <SmallDocumentationCard
            obj={type}
            obj_type={JsonObjType.type}
            library={LibraryString.French}
          />
        </Grid>
      ))}
    </>
  );
}

function VariableCards({
  English,
  Italian,
  German,
  French,
}: Readonly<{
  English: DividedModule, Italian: DividedModule, German: DividedModule, French: DividedModule,
}>): JSX.Element {
  return (
    <>
      {English.variables.map((variable) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`var-En-${variable.name}`}>
          <SmallDocumentationCard
            obj={variable}
            obj_type={JsonObjType.variable}
            library={LibraryString.English}
          />
        </Grid>
      ))}
      {Italian.variables.map((variable) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`var-It-${variable.name}`}>
          <SmallDocumentationCard
            obj={variable}
            obj_type={JsonObjType.variable}
            library={LibraryString.Italian}
          />
        </Grid>
      ))}
      {German.variables.map((variable) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`var-De-${variable.name}`}>
          <SmallDocumentationCard
            obj={variable}
            obj_type={JsonObjType.variable}
            library={LibraryString.German}
          />
        </Grid>
      ))}
      {French.variables.map((variable) => (
        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`var-Fr-${variable.name}`}>
          <SmallDocumentationCard
            obj={variable}
            obj_type={JsonObjType.variable}
            library={LibraryString.French}
          />
        </Grid>
      ))}
    </>
  );
}

export default function DocumentationGrid({
  filterNameDesc,
  English,
  Italian,
  German,
  French,
  toolboxFunctions,
  showToolbox,
}: Readonly<{
  filterNameDesc: string,
  English: DividedModule,
  Italian: DividedModule,
  German: DividedModule,
  French: DividedModule,
  toolboxFunctions: ToolboxFunction[]
  showToolbox: boolean
}>): JSX.Element {
  useEffect(() => {
    scrollToAnchor();
  }, [English, Italian, German, French, toolboxFunctions]);

  const search = filterNameDesc.toLowerCase();
  const filteredEnglish = filtering(English, search);
  const filteredItalian = filtering(Italian, search);
  const filteredGerman = filtering(German, search);
  const filteredFrench = filtering(French, search);

  const filteredToolbox = toolboxFunctions.filter((fn) => fn.name.toLowerCase()
    .includes(search));

  return (
    // eslint-disable-next-line no-nested-ternary
    noValue(English, Italian, German, French, toolboxFunctions) ? (
      <Typography variant="body1" marginY={3}>
        No elements found.
      </Typography>
    ) : (
      noValue(filteredEnglish, filteredItalian, filteredGerman, filteredFrench, filteredToolbox) ? (
        <Typography variant="body1" marginY={3}>
          No elements matches the search criteria.
        </Typography>
      ) : (
        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="flex-start"
          spacing={3}
          columns={2}
        >
          <FunctionCards
            English={filteredEnglish}
            Italian={filteredItalian}
            German={filteredGerman}
            French={filteredFrench}
          />
          <VariableCards
            English={filteredEnglish}
            Italian={filteredItalian}
            German={filteredGerman}
            French={filteredFrench}
          />
          <TypeCards
            English={filteredEnglish}
            Italian={filteredItalian}
            German={filteredGerman}
            French={filteredFrench}
          />

          {showToolbox ? filteredToolbox.map((fn) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch" key={`toolbox-${fn.name}`} id={toolboxFunctionAnchor(fn.name)} className="anchor">
              <SmallDocumentationCard
                obj={fn}
                obj_type={JsonObjType.toolbox}
                library={LibraryString.Toolbox}
              />
            </Grid>
          )) : null}
        </Grid>
      )
    ));
}
