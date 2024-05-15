import {Function, json_obj_type, Module, Type, Variable} from "./Json_structure.ts";

import {readdir, readFile} from 'fs/promises';
import path from "path";

const BASE_PATH: string = path.join(process.cwd(), "public/JsonDocumentation");

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

    public find(name: string, language?: string): {
        "obj_type": json_obj_type,
        "obj": Module | Function | Type | Variable
    } | undefined {
        if (language) {
            switch (language.toLowerCase()) {
                case 'en':
                    return this.findInArray(this.English, name)
                case 'fr':
                    return this.findInArray(this.French, name)
                case 'ge':
                    return this.findInArray(this.German, name)
                case 'it':
                    return this.findInArray(this.Italian, name)
                default:
                    console.error("INCORRECT LANGUAGE")
                    return undefined
            }
        } else {
            let result = this.findInArray(this.English, name)
            if (result == undefined) {
                result = this.findInArray(this.French, name)
            }
            if (result == undefined) {
                result = this.findInArray(this.German, name)
            }
            if (result == undefined) {
                result = this.findInArray(this.Italian, name)
            }
            return result
        }
    }

    private findInArray(array: Module[], name: string): {
        "obj_type": json_obj_type,
        "obj": Module | Function | Type | Variable
    } | undefined {
        name = name.toLowerCase()
        for (let module of array) {
            if (module.name.toLowerCase() == name) {
                return {"obj_type": json_obj_type.module, "obj": module}
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
                        "obj": result
                    }
                }
            }
        }
        return undefined
    }


}
