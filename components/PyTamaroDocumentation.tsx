import useLocalProfile from "../src/localStorage/useLocalProfile.ts";
import {useEffect} from "react";
import scrollToAnchor from "../src/scrollToAnchor.ts";
import {Card, Stack, Typography} from "@mui/material";
import {toolboxFunctionAnchor} from "../src/urlUtils.ts";
import ToolboxFunctionCardContent from "./ToolboxFunctionCardContent.tsx";
import {JsonConverter, language_string} from "../src/JsonAst/JsonConverter.ts";

const jsonConverter = new JsonConverter();
await jsonConverter.init()

export default function PyTamaroDocumentation({functionFilterNameDesc}: { functionFilterNameDesc: string }) {
    const {metadata} = useLocalProfile();
    const English = jsonConverter.languageDividedByType(language_string.English)
    const functions = English.functions

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
                            <ToolboxFunctionCardContent fn={fn}/>
                        </Card>
                    ))}
                </Stack>
            )
        ));
}