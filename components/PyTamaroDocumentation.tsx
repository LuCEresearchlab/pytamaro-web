import useLocalProfile from "../src/localStorage/useLocalProfile.ts";
import {useEffect} from "react";
import scrollToAnchor from "../src/scrollToAnchor.ts";
import {Card, Stack, Typography} from "@mui/material";
import {toolboxFunctionAnchor} from "../src/urlUtils.ts";
import ToolboxFunctionCardContent from "./ToolboxFunctionCardContent.tsx";
import {Function, json_obj_type, Module} from '../src/JsonAst/Json_structure.ts';


export default function PyTamaroDocumentation({functionFilterNameDesc, english, italian, german, french}: {
    functionFilterNameDesc: string,
    english: Module[],
    italian: Module[],
    german: Module[],
    french: Module[]
}) {
    const {metadata} = useLocalProfile();
    let functions: Function[] = []
    for (let mod of english) {
        if (mod.functions) {
            functions.push(...mod.functions)
        }
    }

    useEffect(() => {
        scrollToAnchor();
    }, [functions]);

    const filteredFunctions = functions.filter((fn) => {
        const search = functionFilterNameDesc.toLowerCase();
        return fn.name.toLowerCase().includes(search) || fn.description?.content.toLowerCase().includes(search);
    });

    return (
        // eslint-disable-next-line no-nested-ternary
        functions.length === 0 ? (
            <Typography variant="body1" marginY={3}>
                No PyTamaro functions found.
            </Typography>
        ) : (
            filteredFunctions.length === 0 ? (
                <Typography variant="body1" marginY={3}>
                    No function matches the search criteria.
                </Typography>
            ) : (
                <Stack
                    direction="column"
                    spacing={3}
                >
                    {filteredFunctions.map((fn) => (
                        <Card key={fn.name} id={toolboxFunctionAnchor(fn.name)} className="anchor"
                              sx={{overflow: 'visible'}}>
                            <ToolboxFunctionCardContent fn={fn} from_pyTamaro={true} obj_type={json_obj_type.function}/>
                        </Card>
                    ))}
                </Stack>
            )
        ));
}