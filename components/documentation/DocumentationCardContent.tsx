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
                                                     ImplementationAndUsage = null
                                                 }: Readonly<{
    obj: Function | Type | Variable,
    obj_type?: json_obj_type
    LinkButton?: JSX.Element | null
    ImplementationAndUsage?: JSX.Element | null
}>) {
    const [showOptional, setShowOptional] = useState(false);
    const toggleShowOptional = () => setShowOptional(!showOptional);
    return (
        <CardContent sx={{pb: 1, minWidth: '80ch'}}>
            <Box display="flex">
                <Typography color="text.secondary" component="span" mr="1ch" fontWeight="bold">
                    {obj_type}
                </Typography>
                <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily} bgcolor="#e7f2fa"
                            borderTop="3px solid #6ab0de">
                    {(obj_type == json_obj_type.function) ? functionSignature(obj, showOptional) : obj.name}
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
                <Card sx={{px: 2, my: 2}}>
                    <ParametersTable params={(obj as Function).parameters} return_type={(obj as Function).return_type}
                                     return_description={(obj as Function).return_description}
                                     showOptional={showOptional}/>
                </Card>
                : null}
            <Typography color="text.secondary" fontWeight="bold" component="span" gutterBottom>
                Optional parameters
            </Typography>
            <FormGroup sx={{display: 'inline', marginLeft: 2}}>
                <FormControlLabel
                    control={<Switch checked={showOptional} onChange={toggleShowOptional}/>}
                    label={<Typography color="text.secondary">{showOptional ? 'Hide' : 'Show'}</Typography>}
                />
            </FormGroup>
            {ImplementationAndUsage}
        </CardContent>
    );
}

function ParametersTable({params, return_type, return_description, showOptional}: Readonly<{
    params: Variable[] | undefined,
    return_type: string | undefined,
    return_description: string | undefined,
    showOptional: boolean
}>): JSX.Element {
    return <Table aria-label="Function Parameters" size="small">
        <TableHead>
            <TableRow>
                <TableCell sx={{pl: 0}}>Parameter/Return</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                {showOptional && (<TableCell>Default value</TableCell>)}
            </TableRow>
        </TableHead>
        <TableBody>
            {params?.map((arg: Variable) => {
                if (arg.default_value) {
                    return showOptional && (ParametersRow(arg, showOptional))
                } else {
                    return ParametersRow(arg, showOptional)
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
                <TableCell>
                    <TypeCell
                        type={return_type ? return_type : ""}/>
                </TableCell>
                <TableCell>
                    <Typography component="span">{return_description ? return_description : ""}</Typography>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
}

function ParametersRow(arg: Variable, showOptional: boolean) {
    return <TableRow
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
            <Typography
                component="span">{arg.description ? arg.description.content : ""}</Typography>
        </TableCell>
        {showOptional && (<TableCell component="th" scope="row" sx={{pl: 0}}>
            <Typography component="span"
                        fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.default_value ? arg.default_value : "N/A"}</Typography>
        </TableCell>)}
    </TableRow>
}

function functionSignature(fn: Function, showOptional: boolean): string {
    let signature: string = fn.name + " ("
    if (fn.parameters) {
        for (let param of fn.parameters) {
            if (param.default_value != undefined && showOptional) {
                signature += param.name + ": " + param.type + " = " + param.default_value + ", "
            } else if (param.default_value == undefined) {
                signature += param.name + ": " + param.type + ", "
            }
        }
        signature = signature.substring(0, signature.length - 2)
    }
    signature += ")"
    if (fn.return_type) {
        signature += "->" + fn.return_type;
    }
    return signature
}

function hasDefault(parameters: Variable[]): boolean {
    for (let param of parameters) {
        if (param.default_value) {
            return true;
        }
    }
    return false
}

function hasDescription(parameters: Variable[]): boolean {
    for (let param of parameters) {
        if (param.description) {
            return true;
        }
    }
    return false;
}


