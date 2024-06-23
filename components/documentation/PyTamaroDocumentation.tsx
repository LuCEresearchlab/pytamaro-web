import useLocalProfile from "../../src/localStorage/useLocalProfile.ts";
import {useEffect} from "react";
import scrollToAnchor from "../../src/scrollToAnchor.ts";
import {Card, Stack} from "@mui/material";
import {toolboxFunctionAnchor} from "../../src/urlUtils.ts";
import {json_obj_type} from '../../src/JsonAst/Json_structure.ts';
import DocumentationCardContent from "./DocumentationCardContent.tsx";
import {dividedModule} from "../../src/JsonAst/JsonConverter.ts";


export default function PyTamaroDocumentation({functionFilterNameDesc, English, Italian, French, German}: {
    functionFilterNameDesc: string,
    English: dividedModule,
    Italian: dividedModule,
    French: dividedModule,
    German: dividedModule
}) {
    const {metadata} = useLocalProfile();

    useEffect(() => {
        scrollToAnchor();
    }, [English.functions]);

    const filteredFunctions = English.functions.filter((fn) => {
        const search = functionFilterNameDesc.toLowerCase();
        return fn.name.toLowerCase().includes(search) || fn.description?.content.toLowerCase().includes(search);
    });

    return (
        // eslint-disable-next-line no-nested-ternary
        // English.functions.length === 0 ? (
        //     <Typography variant="body1" marginY={3}>
        //         No PyTamaro functions found.
        //     </Typography>
        // ) : (
        //     filteredFunctions.length === 0 ? (
        //         <Typography variant="body1" marginY={3}>
        //             No function matches the search criteria.
        //         </Typography>
        //     ) : (
        <Stack
            direction="column"
            spacing={3}
        >
            {English.functions.map((fn) => (
                <Card key={fn.name} id={toolboxFunctionAnchor(fn.name)} className="anchor"
                      sx={{overflow: 'visible'}}>
                    <DocumentationCardContent obj={fn} obj_type={json_obj_type.function}/>
                </Card>
            ))}

            {English.types.map((type) => (
                <Card key={type.name} id={toolboxFunctionAnchor(type.name)} className="anchor"
                      sx={{overflow: 'visible'}}>
                    <DocumentationCardContent obj={type} obj_type={json_obj_type.type}/>
                </Card>
            ))}

            {English.variables.map((variable) => (
                <Card key={variable.name} id={toolboxFunctionAnchor(variable.name)} className="anchor"
                      sx={{overflow: 'visible'}}>
                    <DocumentationCardContent obj={variable} obj_type={json_obj_type.variable}/>
                </Card>
            ))}
        </Stack>
        // )
        // )
    );
}
