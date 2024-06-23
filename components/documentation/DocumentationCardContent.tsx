import {Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography,} from '@mui/material';
import theme from '../../src/theme.ts';
import {Function, json_obj_type, Type, Variable} from '../../src/JsonAst/Json_structure.ts';

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
    return (
        <CardContent sx={{pb: 1, minWidth: '80ch'}}>
            <Box display="flex">
                <Typography color="text.secondary" component="span" mr="1ch" fontWeight="bold">
                    {obj_type}
                </Typography>
                <Typography component="span" fontFamily={theme.pytamaro.monospaceFontFamily} bgcolor="#e7f2fa"
                            borderTop="3px solid #6ab0de">
                    {(obj_type == json_obj_type.function) ? functionSignature(obj) : obj.name}
                </Typography>
                {LinkButton}
                {/* NOTE: ('as ToolboxFunction' is an assertion since if the function doesn't come from_PyTamaro is from the toolbox) */}
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
                                     return_description={(obj as Function).return_description}/>
                </Card>
                : null}
            {ImplementationAndUsage}
            {/*{!from_pyTamaro && ImplementationAndUsage(fn as ToolboxFunction, summary)}*/}
            {/* NOTE: ('as ToolboxFunction' is an assertion since if the function doesn't come from_PyTamaro is from the toolbox) */}
        </CardContent>
    );
}

function ParametersTable({params, return_type, return_description}: Readonly<{
    params: Variable[] | undefined,
    return_type: string | undefined,
    return_description: string | undefined
}>) {
    return <Table aria-label="Function Parameters" size="small">
        <TableHead>
            <TableRow>
                <TableCell sx={{pl: 0}}>Parameter/Return</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Default value</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {params?.map((arg: Variable) => (
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
                        <Typography
                            component="span">{arg.description ? arg.description.content : ""}</Typography>
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{pl: 0}}>
                        <Typography component="span"
                                    fontFamily={theme.pytamaro.monospaceFontFamily}>{arg.default_value ? arg.default_value : ""}</Typography>
                    </TableCell>
                </TableRow>
            ))}
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

function functionSignature(fn: Function): string {
    let signature = fn.name + " ("
    if (fn.parameters) {
        for (let arg of fn.parameters) {
            signature += arg.name + ":" + arg.type + ", "
        }
        signature = signature.substring(0, signature.length - 2)
    }
    signature += ")"
    if (fn.return_type) {
        signature += "->" + fn.return_type;
    }
    return signature
}

