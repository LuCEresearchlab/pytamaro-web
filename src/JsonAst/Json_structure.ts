export interface EnhancedStr {
    content: string;
    images?: Image[];
}

export interface Type {
    name: string;
    description?: EnhancedStr;
}

export interface Variable {
    name: string;
    description?: EnhancedStr;
    type?: string;
    default_value?: string;
}

export interface Function {
    name: string;
    description?: EnhancedStr;
    parameters?: Variable[];
    return_type?: string;
    return_description?: string;
}

export interface Module {
    name: string;
    description?: EnhancedStr;
    types?: Type[];
    functions?: Function[];
    variables?: Variable[];
}

export interface Image{
    uri: string;
    caption? : string;
}

export enum json_obj_type {
    module = "Module",
    function = "Function",
    type = "Type",
    variable = "Variable"}