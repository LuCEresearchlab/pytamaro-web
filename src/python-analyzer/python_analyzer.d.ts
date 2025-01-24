/* tslint:disable */
/* eslint-disable */
export function analyze(python_source: string): any;

export interface PythonName {
    module: string;
    name: string;
};
export interface PythonFunction {
    name: string;
    args: PythonFunctionArgument[];
    return_type_str: string;
    docstring: string;
    explicit_return: boolean;
};
export interface PythonFunctionArgument {
    name: string;
    type_str: string;
    default: string | undefined;
    variable_length: boolean;
};
export interface ParseError {
    message: string;
    location: [number, number];
};
export interface PythonConstant {
    name: string;
    type_str: string;
    docstring: string;
};
export interface AnalysisResult {
    imported_names: PythonName[];
    defined_functions: PythonFunction[];
    defined_constants: PythonConstant[];
    called_names: string[];
    has_ellipsis: boolean;
    import_ranges: [number, number][];
    parse_errors: ParseError[];
};


