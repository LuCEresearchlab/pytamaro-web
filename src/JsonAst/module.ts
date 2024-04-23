import Type from "./type.ts";
import Function from "./function.ts";
import Variable from "./variable.ts";
import EnhancedStr from "./EnhancedStr.ts";

export default interface Module{
    name: string;
    description?: EnhancedStr;
    types?:Type[];
    functions?:Function[];
    variables?:Variable[];
}