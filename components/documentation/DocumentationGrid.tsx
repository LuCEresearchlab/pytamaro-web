import {useEffect} from "react";
import scrollToAnchor from "../../src/scrollToAnchor.ts";
import {Typography} from "@mui/material";
import {
    Function,
    functionMandatoryParameter,
    json_obj_type,
    library_string
} from '../../src/JsonAst/Json_structure.ts';
import {DividedModule} from "../../src/JsonAst/JsonConverter.ts";
import SmallDocumentationCard from "./SmallDocumentationCard.tsx";
import Grid from "@mui/material/Unstable_Grid2";
import {ToolboxFunction} from "../../src/localStorage/schema.ts";

export default function DocumentationGrid({
                                              filterNameDesc,
                                              English,
                                              Italian,
                                              German,
                                              French,
                                              toolboxFunctions,
                                              showToolbox
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
    }, [[English, Italian, German, French,]]);

    const search = filterNameDesc.toLowerCase();
    const filteredEnglish = filtering(English, search);
    const filteredItalian = filtering(Italian, search);
    const filteredGerman = filtering(German, search);
    const filteredFrench = filtering(French, search);

    const filteredToolbox = toolboxFunctions.filter((fn) => {
        return fn.name.toLowerCase()
            .includes(search);
    })

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
                <Grid container direction="row" justifyContent="space-around"
                      alignItems="flex-start" spacing={3}
                      columns={2}>
                    <FunctionCards English={filteredEnglish} Italian={filteredItalian}
                                   German={filteredGerman} French={filteredFrench}/>
                    <VariableCards English={filteredEnglish} Italian={filteredItalian}
                                   German={filteredGerman} French={filteredFrench}/>
                    <TypeCards English={filteredEnglish} Italian={filteredItalian}
                               German={filteredGerman} French={filteredFrench}/>

                    {showToolbox ? filteredToolbox.map((fn, index) => (
                        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                            <SmallDocumentationCard obj={fn} obj_type={json_obj_type.toolbox} library={library_string.Toolbox}/>
                        </Grid>)) : null}
                </Grid>
            )
        ));
}

function FunctionCards({
                           English,
                           Italian,
                           German,
                           French
                       }: Readonly<{
    English: DividedModule, Italian: DividedModule, German: DividedModule, French: DividedModule,
}>): JSX.Element {
    return <>
        {English.functions.map((fn, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={fn} obj_type={json_obj_type.function} library={library_string.English}/>
            </Grid>
        ))}
        {Italian.functions.map((fn, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={fn} obj_type={json_obj_type.function} library={library_string.Italian}/>
            </Grid>
        ))}
        {German.functions.map((fn, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={fn} obj_type={json_obj_type.function} library={library_string.German}/>
            </Grid>
        ))}
        {French.functions.map((fn, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={fn} obj_type={json_obj_type.function} library={library_string.French}/>
            </Grid>
        ))}
    </>
}

function TypeCards({
                       English,
                       Italian,
                       German,
                       French
                   }: Readonly<{
    English: DividedModule, Italian: DividedModule, German: DividedModule, French: DividedModule,
}>): JSX.Element {
    return <>
        {English.types.map((type, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={type} obj_type={json_obj_type.type} library={library_string.English}/>
            </Grid>
        ))}
        {Italian.types.map((type, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={type} obj_type={json_obj_type.type} library={library_string.Italian}/>
            </Grid>
        ))}
        {German.types.map((type, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={type} obj_type={json_obj_type.type} library={library_string.German}/>
            </Grid>
        ))}
        {French.types.map((type, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={type} obj_type={json_obj_type.type} library={library_string.French}/>
            </Grid>
        ))}
    </>
}

function VariableCards({
                           English,
                           Italian,
                           German,
                           French
                       }: Readonly<{
    English: DividedModule, Italian: DividedModule, German: DividedModule, French: DividedModule,
}>): JSX.Element {
    return <>
        {English.variables.map((variable, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={variable} obj_type={json_obj_type.variable} library={library_string.English}/>
            </Grid>
        ))}
        {Italian.variables.map((variable, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={variable} obj_type={json_obj_type.variable} library={library_string.Italian}/>
            </Grid>
        ))}
        {German.variables.map((variable, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={variable} obj_type={json_obj_type.variable} library={library_string.German}/>
            </Grid>
        ))}
        {French.variables.map((variable, index) => (
            <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                <SmallDocumentationCard obj={variable} obj_type={json_obj_type.variable} library={library_string.French}/>
            </Grid>
        ))}
    </>
}

function parseSignature(signature: string): { paramTypes: string[], returnType: string | null } {
    const arrowIndex = signature.indexOf('->');
    let paramPart = arrowIndex >= 0 ? signature.slice(0, arrowIndex)
        .trim() : signature.trim();
    let returnType = arrowIndex >= 0 ? signature.slice(arrowIndex + 2)
        .trim() : null;

    // Remove parentheses from parameter part
    if (paramPart.startsWith('(') && paramPart.endsWith(')')) {
        paramPart = paramPart.slice(1, -1);
    }

    // Split parameter types by comma
    const paramTypes = paramPart ? paramPart.split(',')
        .map(type => type.trim()) : [];

    return {
        paramTypes,
        returnType
    };
}

function isValidSignature(signature: string, func: Function): boolean {
    const {
        paramTypes,
        returnType
    } = parseSignature(signature);

    // Check parameter types
    if (signature.includes("(") && signature.includes(")")) {
        if (func.parameters) {
            const funcParamTypes = func.parameters.map(param => param.type?.toLowerCase());

            //TODO : keep or remove or change to don't count optional parameter?
            // if (paramTypes.length !== funcParamTypes.length) {
            //     return false;
            // }

            if (paramTypes.length !== functionMandatoryParameter(func)) {
                return false;
            }

            for (let i = 0; i < paramTypes.length; i++) {
                if (paramTypes[i] !== funcParamTypes[i]) {
                    return false;
                }
            }
        } else if (paramTypes.length > 0) {
            return false; // If function has no parameters but signature specifies parameters
        }
    }

    // Check return type
    if (func.return_type) {
        if (returnType !== "") {
            if (returnType !== func.return_type.toLowerCase()) {
                return false;
            }
        }
    } else if (returnType !== null) {
        return false; // If function has no return type but signature specifies a return type
    }

    return true;
}

function filtering(names: DividedModule, search: string) {
    let result: DividedModule = {
        functions: [],
        types: [],
        variables: []
    }
    result.functions = names.functions.filter((fn) => {
        return fn.name.toLowerCase()
            .includes(search) || (isValidSignature(search, fn) && fn)
    });
    result.types = names.types.filter((type) => {
        return type.name.toLowerCase()
            .includes(search);
    });
    result.variables = names.variables.filter((variable) => {
        return variable.name.toLowerCase()
            .includes(search);
    });
    return result
}

function noValue(English: DividedModule, Italian: DividedModule, German: DividedModule, French: DividedModule, ToolBox: ToolboxFunction[]) {
    return (isEmpty(English) && isEmpty(Italian) && isEmpty(German) && isEmpty(French) && ToolBox.length === 0)
}

function isEmpty(names: DividedModule) {
    return (names.functions.length === 0 && names.variables.length === 0 && names.types.length === 0)
}
