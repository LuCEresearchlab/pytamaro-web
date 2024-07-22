import {useEffect} from "react";
import scrollToAnchor from "../../src/scrollToAnchor.ts";
import {Card, Typography} from "@mui/material";
import {json_obj_type, Function, functionMandatoryParameter} from '../../src/JsonAst/Json_structure.ts';
import {DividedModule} from "../../src/JsonAst/JsonConverter.ts";
import SmallDocumentationCard from "./SmallDocumentationCard.tsx";
import Grid from "@mui/material/Unstable_Grid2";
import {ToolboxFunction} from "../../src/localStorage/schema.ts";

export default function DocumentationGrid({filterNameDesc, names, toolboxFunctions, showToolbox}: Readonly<{
    filterNameDesc: string,
    names: DividedModule,
    toolboxFunctions: ToolboxFunction[]
    showToolbox: boolean
}>): JSX.Element {

    useEffect(() => {
        scrollToAnchor();
    }, [names]);

    const search = filterNameDesc.toLowerCase();
    const filteredFunctions = names.functions.filter((fn) => {
        return fn.name.toLowerCase().includes(search) || (isValidSignature(search, fn) && fn)
    });
    const filteredType = names.types.filter((type) => {
        return type.name.toLowerCase().includes(search);
    });
    const filteredVariables = names.variables.filter((variable) => {
        return variable.name.toLowerCase().includes(search);
    });
    const filteredToolbox = toolboxFunctions.filter((fn) => {
        return fn.name.toLowerCase().includes(search);
    })

    return (
        // eslint-disable-next-line no-nested-ternary
        names.functions.length === 0 && names.variables.length === 0 && names.types.length === 0 && toolboxFunctions.length === 0 ? (
            <Typography variant="body1" marginY={3}>
                No elements found.
            </Typography>
        ) : (
            filteredFunctions.length === 0 && filteredVariables.length === 0 && filteredType.length === 0 && filteredToolbox.length === 0 ? (
                <Typography variant="body1" marginY={3}>
                    No elements matches the search criteria.
                </Typography>
            ) : (
                <Grid container direction="row" justifyContent="space-around" alignItems="flex-start" spacing={3}
                      columns={2}>

                    {filteredFunctions.map((fn, index) => (
                        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                            <SmallDocumentationCard obj={fn} obj_type={json_obj_type.function}/>
                        </Grid>
                    ))}

                    {filteredType.map((type, index) => (
                        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                            <SmallDocumentationCard obj={type} obj_type={json_obj_type.type}/>
                        </Grid>
                    ))}

                    {filteredVariables.map((variable, index) => (
                        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                            <SmallDocumentationCard obj={variable} obj_type={json_obj_type.variable}/>
                        </Grid>))}

                    {showToolbox ? filteredToolbox.map((fn, index) => (
                        <Grid xs={1} display="flex" justifyContent="stretch" alignItems="stretch">
                            <SmallDocumentationCard obj={fn} obj_type={json_obj_type.toolbox}/>
                        </Grid>)) : null}
                </Grid>
            )
        ));
}


function parseSignature(signature: string): { paramTypes: string[], returnType: string | null } {
    const arrowIndex = signature.indexOf('->');
    let paramPart = arrowIndex >= 0 ? signature.slice(0, arrowIndex).trim() : signature.trim();
    let returnType = arrowIndex >= 0 ? signature.slice(arrowIndex + 2).trim() : null;


    // Remove parentheses from parameter part
    if (paramPart.startsWith('(') && paramPart.endsWith(')')) {
        paramPart = paramPart.slice(1, -1);
    }

    // Split parameter types by comma
    const paramTypes = paramPart ? paramPart.split(',').map(type => type.trim()) : [];

    return {paramTypes, returnType};
}

function isValidSignature(signature: string, func: Function): boolean {
    const {paramTypes, returnType} = parseSignature(signature);

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
