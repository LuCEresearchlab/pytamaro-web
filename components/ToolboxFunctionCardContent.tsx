import {
    Box,
    Button,
    Card,
    CardContent,
    FormControlLabel,
    FormGroup,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import {useState} from 'react';
import {PythonFunctionArgument, ToolboxFunction} from '../src/localStorage/schema';
import {toolboxActivityVariant} from '../src/specialActivities';
import theme from '../src/theme';
import {activityVariantPathname, toolboxFunctionPathname} from '../src/urlUtils';
import useReadOnlyTemporaryActivity from '../src/useReadOnlyTemporaryActivity';
import CodeEditor from './CodeEditor';
import SolitaryCodeCell, {initialStateSingleCell} from './SolitaryCodeCell';
import {Function, json_obj_type, Type, Variable} from '../src/JsonAst/Json_structure';

function TypeCell({type}: { type: string }) {
    return type === ''
        ? <Typography component="span" fontStyle="italic" color="text.secondary">N/A</Typography>
        : <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>{type}</Typography>;
}

export default function ToolboxFunctionCardContent(
    {
        fn, summary = false, from_pyTamaro = false, obj_type = "Function"
    }:
        Readonly<{
            fn: ToolboxFunction | Type | Function | Variable,
            summary?: boolean,
            from_pyTamaro?: boolean
            obj_type?: json_obj_type
        }>,
) {

    return (
        <CardContent sx={{pb: 1, minWidth: '80ch'}}>
            <Box display="flex">
                <Typography color="text.secondary" component="span" mr="1ch" fontWeight="bold">
                    {obj_type} {/*Function /!* TODO: change this based on the type of the received object (by default the received object is a "toolbox function" *!/*/}
                </Typography>
                <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>
                    {fn.name}
                </Typography>
                {!from_pyTamaro && LinkButton(fn as ToolboxFunction, summary)}
                {/* NOTE: ('as ToolboxFunction' is an assertion since if the function doesn't come from_PyTamaro is from the toolbox) */}
            </Box>
            {description(fn)}
            {obj_type == json_obj_type.function && parametersTable(fn, from_pyTamaro)}
            {!from_pyTamaro && ImplementationAndUsage(fn as ToolboxFunction, summary)}
            {/* NOTE: ('as ToolboxFunction' is an assertion since if the function doesn't come from_PyTamaro is from the toolbox) */}
        </CardContent>
    );
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

function description(fn: ToolboxFunction | Type | Function | Variable) {
    if (typeof fn.description == "string") {
        return <Typography color="text.secondary">
            {fn.description}
        </Typography>
    } else {
        return <div>
            <Typography color="text.secondary">
                {fn.description ? fn.description?.content : ""}

            </Typography>
            {fn.description?.images?.map((img, index) =>
                <figure key={"Fig"+index}>
                    <img
                        src={img.uri}
                        alt={img.caption}
                        width="128"
                        height="128"
                    />
                    <figcaption>Fig {index + 1} - {img.caption}</figcaption>
                </figure>)
            }
        </div>
    }
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
                    source={fn.source}
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

function parametersTable(fn: ToolboxFunction | Function, from_pyTamaro: boolean) {
    return <Card sx={{px: 2, my: 2}}>
        <Table aria-label="Function Parameters" size="small">
            <TableHead>
                <TableRow>
                    <TableCell sx={{pl: 0}}>Parameter/Return</TableCell>
                    <TableCell>Type</TableCell>
                    {from_pyTamaro && <TableCell>Description</TableCell>}
                    {from_pyTamaro && <TableCell>Default value</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {parameterTableRow(from_pyTamaro ? (fn as Function).parameters : (fn as ToolboxFunction).args, from_pyTamaro)}
                <TableRow
                    key="return"
                    sx={{
                        borderTopStyle: 'double',
                        borderTopColor: theme.palette.grey[300],
                        '&:last-child td, &:last-child th': {border: 0},
                    }}
                >
                    <TableCell component="th" scope="row" sx={{pl: 0}}>
                        <Typography component="span">Return Value</Typography>
                    </TableCell>
                    <TableCell>
                        <TypeCell
                            type={from_pyTamaro ? ((fn as Function).return_type ?? "") : (fn as ToolboxFunction).returnTypeUnparsed}/>
                    </TableCell>
                    {from_pyTamaro && (fn as Function).return_description ? <TableCell>
                        <Typography component="span"
                                    fontFamily={theme.pytamaro.monospaceFontFamily}>{(fn as Function).return_description}</Typography>
                    </TableCell> : null}
                </TableRow>
            </TableBody>
        </Table>
    </Card>
}

function parameterTableRow(args: PythonFunctionArgument[] | Variable[] | undefined, from_pyTamaro: boolean) {
    if (args) {
        if (from_pyTamaro) {
            return (args as Variable[]).map((arg) => (
                <TableRow
                    key={arg.name}
                >
                    <TableCell component="th" scope="row" sx={{pl: 0}}>
                        <Typography component="span"
                                    fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.name}</Typography>
                    </TableCell>
                    <TableCell>
                        <TypeCell type={arg.type ? arg.type : ""}/>
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{pl: 0}}>
                        <Typography component="span"
                                    fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.description ? arg.description.content : ""}</Typography>
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{pl: 0}}>
                        <Typography component="span"
                                    fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.default_value ? arg.default_value : ""}</Typography>
                    </TableCell>
                </TableRow>
            ))
        } else {
            return (args as PythonFunctionArgument[]).map((arg) => (
                <TableRow
                    key={arg.name}
                >
                    <TableCell component="th" scope="row" sx={{pl: 0}}>
                        <Typography component="span"
                                    fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.name}</Typography>
                    </TableCell>
                    <TableCell>
                        <TypeCell type={arg.typeUnparsed}/>
                    </TableCell>
                </TableRow>
            ))
        }
    }
}

