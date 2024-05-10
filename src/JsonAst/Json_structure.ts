export interface EnhancedStr {
    content: string;
    images?: [string, string][];
}

export interface Type {
    name: string;
    description?: EnhancedStr;
}

export interface Variable {
    name: string;
    description?: EnhancedStr;
    of_type?: string;
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
