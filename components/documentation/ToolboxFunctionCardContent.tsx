import {Box, Button, FormControlLabel, FormGroup, Switch, Typography,} from '@mui/material';
import Link from 'next/link';
import {useState} from 'react';
import {ToolboxFunction} from '../../src/localStorage/schema.ts';
import {toolboxActivityVariant} from '../../src/specialActivities.ts';
import theme from '../../src/theme.ts';
import {activityVariantPathname, toolboxFunctionPathname} from '../../src/urlUtils.ts';
import useReadOnlyTemporaryActivity from '../../src/useReadOnlyTemporaryActivity.ts';
import CodeEditor from '../CodeEditor.tsx';
import SolitaryCodeCell, {initialStateSingleCell} from '../SolitaryCodeCell.tsx';
import {EnhancedStr, Function, json_obj_type, Variable} from '../../src/JsonAst/Json_structure.ts';
import DocumentationCardContent from "./DocumentationCardContent.tsx";

export default function ToolboxFunctionCardContent(
    {
        fn, summary = false
    }:
        Readonly<{
            fn: ToolboxFunction
            summary?: boolean
        }>,
) {
    const translated = translate(fn)

    return (
        <DocumentationCardContent obj={translated} obj_type={json_obj_type.function}
                                  ImplementationAndUsage={ImplementationAndUsage(fn, summary)}
                                  LinkButton={LinkButton(fn, summary)}/>
    );
}

function translate(fn: ToolboxFunction): Function {
    let description: EnhancedStr = {content: fn.description}
    let parameters: Variable[] = []

    for (let arg of fn.args) {
        parameters.push({
            name: arg.name,
            type: arg.typeUnparsed,
        });
    }
    return {
        name: fn.name,
        description: description,
        return_type: fn.returnTypeUnparsed,
        parameters: parameters
    }
}

function LinkButton(fn: ToolboxFunction, summary: boolean): JSX.Element {
    return <Button
        component={Link}
        href={summary ? toolboxFunctionPathname(fn.name) : activityVariantPathname(fn.originalActivity)}
        target="_blank"
        variant="outlined"
        size="small"
        sx={{ml: 'auto'}}
    >
        {summary ? 'View Details' : 'View Original Activity'}
    </Button>
}

function ImplementationAndUsage(fn: ToolboxFunction, summary: boolean) {
    const [showSource, setShowSource] = useState(false);
    const [showUsage, setShowUsage] = useState(summary);
    const toggleShowSource = () => setShowSource(!showSource);
    const toggleShowUsage = () => setShowUsage(!showUsage);
    const usageCodeCells = initialStateSingleCell(fn.usage);
    const activityVariant = toolboxActivityVariant(fn.name);
    const activity = useReadOnlyTemporaryActivity(usageCodeCells, activityVariant);

    return <div>{!summary && (
        <Box sx={{my: 2}}>
            <Typography color="text.secondary" fontWeight="bold" component="span">
                Implementation
            </Typography>
            <FormGroup sx={{display: 'inline', marginLeft: 2}}>
                <FormControlLabel
                    control={<Switch checked={showSource} onChange={toggleShowSource}/>}
                    label={<Typography color="text.secondary">{showSource ? 'Hide' : 'Show'}</Typography>}
                />
            </FormGroup>
            {showSource && (
                <CodeEditor
                    initialSource={fn.source}
                    currentSource={fn.source}
                    readOnly
                />
            )}
        </Box>
    )}
        <Typography color="text.secondary" fontWeight="bold" component="span" gutterBottom>
            Usage
        </Typography>
        {!summary && (
            <FormGroup sx={{display: 'inline', marginLeft: 2}}>
                <FormControlLabel
                    control={<Switch checked={showUsage} onChange={toggleShowUsage}/>}
                    label={<Typography color="text.secondary">{showUsage ? 'Hide' : 'Show'}</Typography>}
                />
            </FormGroup>
        )}
        {showUsage && (
            <SolitaryCodeCell
                activity={activity}
                activityVariant={activityVariant}
                readOnly
            />
        )}</div>
}


