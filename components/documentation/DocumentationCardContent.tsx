import {
    Box,
    Card,
    CardContent, FormControlLabel,
    FormGroup, Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import theme from '../../src/theme.ts';
import {Function, json_obj_type, Type, Variable} from '../../src/JsonAst/Json_structure.ts';
import {useState} from "react";

function TypeCell({type}: { type: string }) {
    return type === ''
        ? <Typography component="span" fontStyle="italic" color="text.secondary">N/A</Typography>
        : <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily}>{type}</Typography>;
}

export default function DocumentationCardContent({
                                                     obj,
                                                     obj_type = json_obj_type.function,
                                                     LinkButton = null,
                                                     ImplementationAndUsage = null,
                                                     showOptionalInitial = false,
                                                     showTypeInitial = true
                                                 }: Readonly<{
    obj: Function | Type | Variable,
    obj_type?: json_obj_type,
    LinkButton?: JSX.Element | null,
    ImplementationAndUsage?: JSX.Element | null,
    showOptionalInitial?: boolean,
    showTypeInitial?: boolean
}>) {
    const [showOptional, setShowOptional] = useState(showOptionalInitial);
    const toggleShowOptional = () => setShowOptional(!showOptional);
    const [showType, setShowType] = useState(showTypeInitial);
    const toggleShowType = () => setShowType(!showType);
    return (
        <CardContent sx={{pb: 1, maxWidth: '100ch'}}>
            <Box display="flex">
                <Typography color="text.secondary" component="span" mr="1ch" fontWeight="bold">
                    {obj_type}
                </Typography>
                <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily} bgcolor="#e7f2fa"
                            borderTop="3px solid #6ab0de">
                    {(obj_type == json_obj_type.function) ? functionSignature(obj, showOptional, showType) : obj.name}
                </Typography>
                {LinkButton}
            </Box>
            <Typography color="text.secondary">
                {obj.description ? obj.description?.content : ""}

            </Typography>
            {obj.description?.images?.map((img, index) =>
                <figure key={"Fig" + index}>
                    <img
                        src={img.uri}
                        alt={img.caption}
                        width="128"
                        height="128"
                    />
                    <figcaption>Fig {index + 1} - {img.caption}</figcaption>
                </figure>)
            }
            {obj_type == json_obj_type.function ?
                <FunctionSpecificCard fn={obj as Function}
                                      optional={{show: showOptional, toggle: toggleShowOptional}}
                                      types={{show: showType, toggle: toggleShowType}}/> : null}
            {ImplementationAndUsage}
        </CardContent>
    );
}

function FunctionSpecificCard({fn, optional, types}: Readonly<{
    fn: Function,
    optional: {
        show: boolean,
        toggle: () => void
    },
    types: {
        show: boolean,
        toggle: () => void
    }
}>): JSX.Element {
    return <> <Card sx={{px: 2, my: 2}}>
        <ParametersTable params={fn.parameters} return_type={fn.return_type}
                         return_description={fn.return_description}
                         showOptional={optional.show}
                         showType={types.show}/>
    </Card>
        {hasDefault(fn.parameters) ?
            <Box sx={{my: 2}}>
                <Typography color="text.secondary" fontWeight="bold" component="span"
                            gutterBottom>
                    Optional parameters
                </Typography>
                <FormGroup sx={{display: 'inline', marginLeft: 2}}>
                    <FormControlLabel
                        control={<Switch checked={optional.show} onChange={optional.toggle}/>}
                        label={<Typography color="text.secondary">{optional.show ? 'Hide' : 'Show'}</Typography>}
                    />
                </FormGroup>
            </Box> : null}

        <Box sx={{my: 2}}>
            <Typography color="text.secondary" fontWeight="bold" component="span"
                        gutterBottom>
                Type
            </Typography>
            <FormGroup sx={{display: 'inline', marginLeft: 2}}>
                <FormControlLabel
                    control={<Switch checked={types.show} onChange={types.toggle}/>}
                    label={<Typography color="text.secondary">{types.show ? 'Hide' : 'Show'}</Typography>}
                />
            </FormGroup>
        </Box>
    </>
}

function ParametersTable({params, return_type, return_description, showOptional, showType}: Readonly<{
    params: Variable[] | undefined,
    return_type: string | undefined,
    return_description: string | undefined,
    showOptional: boolean,
    showType: boolean
}>): JSX.Element {
    let showDescription = hasDescription(params, return_description)
    return <Table aria-label="Function Parameters" size="small">
        <TableHead>
            <TableRow>
                <TableCell sx={{pl: 0}}>Parameter/Return</TableCell>
                {showType && (<TableCell>Type</TableCell>)}
                {showDescription && (<TableCell>Description</TableCell>)}
                {showOptional && (<TableCell>Default value</TableCell>)}
            </TableRow>
        </TableHead>
        <TableBody>
            {params?.map((arg: Variable) => {
                if (arg.default_value) {
                    return showOptional && (parameterRow(arg, showOptional, showType, showDescription))
                } else {
                    return parameterRow(arg, showOptional, showType, showDescription)
                }
            })}
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
                {showType && (<TableCell>
                    <TypeCell
                        type={return_type ?? ""}/>
                </TableCell>)}
                <TableCell>
                    <Typography component="span">{return_description ?? ""}</Typography>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
}

function parameterRow(arg: Variable, showOptional: boolean, showType: boolean, showDescription: boolean): JSX.Element {
    return <TableRow
        key={arg.name}
    >
        <TableCell component="th" scope="row" sx={{pl: 0}}>
            <Typography component="span"
                        fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.name}</Typography>
        </TableCell>
        {showType && (<TableCell>
            <TypeCell type={arg.type ? arg.type : ""}/>
        </TableCell>)}
        {showDescription && (<TableCell component="th" scope="row" sx={{pl: 0}}>
            <Typography
                component="span">{arg.description ? arg.description.content : ""}</Typography>
        </TableCell>)}
        {showOptional && (<TableCell component="th" scope="row" sx={{pl: 0}}>
            <Typography component="span"
                        fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.default_value ? arg.default_value : "N/A"}</Typography>
        </TableCell>)}
    </TableRow>
}

function functionSignature(fn: Function, showOptional: boolean, showType: boolean): string {
    let signature: string = fn.name + " ("
    if (fn.parameters) {
        for (let param of fn.parameters) {
            let typeString = (showType && param.type ? (": " + param.type) : "")
            if (param.default_value != undefined && showOptional) {
                signature += param.name + typeString + " = " + param.default_value + ", "
            } else if (param.default_value == undefined) {
                signature += param.name + typeString + ", "
            }
        }
        signature = signature.substring(0, signature.length - 2)
    }
    signature += ")"
    if (fn.return_type) {
        signature += "->" + (showType ? fn.return_type : "");
    }
    return signature
}

function hasDefault(parameters: Variable[] | undefined): boolean {
    if (parameters != undefined && parameters.length > 0) {
        for (let param of parameters) {
            if (param.default_value) {
                return true;
            }
        }
    }
    return false
}

function hasDescription(parameters: Variable[] | undefined, return_description: string | undefined): boolean {
    if (return_description) {
        return true;
    }
    if (parameters != undefined && parameters.length > 0) {
        for (let param of parameters) {
            if (param.description) {
                return true;
            }
        }
    }
    return false;
}


