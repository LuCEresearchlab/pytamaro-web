import {Function, json_obj_type, language_string, library_string, Module, Type, Variable} from "./Json_structure.ts";

import {readdir, readFile} from 'fs/promises';
import path from "path";

const BASE_PATH: string = path.join(process.cwd(), "public/JsonDocumentation");

export interface DividedModule {
    functions: Function[],
    types: Type[],
    variables: Variable[]
}

export class JsonConverter {

    English: Module[] = []
    French: Module[] = []
    German: Module[] = []
    Italian: Module[] = []

    public async init() {
        this.English = await this.readFiles(path.join(BASE_PATH, "English"));
        this.French = await this.readFiles(path.join(BASE_PATH, "French"));
        this.German = await this.readFiles(path.join(BASE_PATH, "German"));
        this.Italian = await this.readFiles(path.join(BASE_PATH, "Italian"));
    }

    private async readFiles(folder: string): Promise<Module[]> {
        const files = await readdir(folder);
        const result: Module[] = [];
        for (const file of files) {
            const fileContent = await readFile(path.join(folder, file), 'utf-8');
            const moduleObj = JSON.parse(fileContent);
            result.push(moduleObj);
        }
        return result;
    }

    public find(name: string, language?: language_string): {
        "obj_type": json_obj_type,
        "obj": Module | Function | Type | Variable
        "library": library_string
    } | undefined {
        if (language) {
            switch (language) {
                case language_string.English:
                    return this.findInArray(this.English, name, library_string.English)
                case language_string.French:
                    return this.findInArray(this.French, name, library_string.French)
                case language_string.German:
                    return this.findInArray(this.German, name, library_string.German)
                case language_string.Italian:
                    return this.findInArray(this.Italian, name, library_string.Italian)
                default:
                    console.error("INCORRECT LANGUAGE")
                    return undefined
            }
        } else {
            let result = this.findInArray(this.English, name, library_string.English)
            if (result == undefined) {
                result = this.findInArray(this.French, name, library_string.French)
            }
            if (result == undefined) {
                result = this.findInArray(this.German, name, library_string.German)
            }
            if (result == undefined) {
                result = this.findInArray(this.Italian, name, library_string.Italian)
            }
            return result
        }
    }

    private findInArray(array: Module[], name: string, library: library_string): {
        "obj_type": json_obj_type,
        "obj": Module | Function | Type | Variable
        "library": library_string
    } | undefined {
        name = name.toLowerCase()
        for (let module of array) {
            if (module.name.toLowerCase() == name) {
                return {"obj_type": json_obj_type.module, "obj": module, "library": library}
            } else {
                let result = module.functions?.find(fun => fun.name.toLowerCase() == name)
                let obj_type: json_obj_type = json_obj_type.function
                if (result == undefined) {
                    result = module.types?.find(type => type.name.toLowerCase() == name)
                    obj_type = json_obj_type.type
                }
                if (result == undefined) {
                    result = module.variables?.find(variable => variable.name.toLowerCase() == name)
                    obj_type = json_obj_type.variable
                }
                if (result != undefined) {
                    return {
                        "obj_type": obj_type,
                        "obj": result,
                        "library": library
                    }
                }
            }
        }
        return undefined
    }

    public languageDividedByType(language: language_string): DividedModule {
        switch (language) {
            case language_string.English:
                return this.divideArrayByType(this.English)
            case language_string.French:
                return this.divideArrayByType(this.French)
            case language_string.German:
                return this.divideArrayByType(this.German)
            case language_string.Italian:
                return this.divideArrayByType(this.Italian)
            default:
                console.error("INCORRECT LANGUAGE")
                return {/*modules: [],*/ functions: [], types: [], variables: []}
        }
    }

    private divideArrayByType(array: Module[]): DividedModule {
        let result = {
            // modules: ([] as Module[]),
            functions: ([] as Function[]),
            types: ([] as Type[]),
            variables: ([] as Variable[])
        }
        for (let module of array) {
            // result.modules.push(module)
            result.functions.push(...(module.functions ? module.functions : []))
            result.types.push(...(module.types ? module.types : []))
            result.variables.push(...(module.variables ? module.variables : []))
        }
        return result
    }
}
