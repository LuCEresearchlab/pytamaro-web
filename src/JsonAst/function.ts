import EnhancedStr from './EnhancedStr';
import Variable from "./variable.ts";


export default interface Function{
    name: string;
    description?: EnhancedStr;
    parameters?: Variable[];
    return_type?:string;
    return_description?:string;
}