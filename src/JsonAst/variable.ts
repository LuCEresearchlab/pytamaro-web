import EnhancedStr from "./EnhancedStr.ts";

export default interface Variable{
    name: string;
    description?: EnhancedStr;
    of_type?: string;
    default_value?: string;
}