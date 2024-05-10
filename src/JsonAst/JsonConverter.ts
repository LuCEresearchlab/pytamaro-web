import {Module, Function, Type, Variable} from "./Json_structure.ts";

import {readdir, readFile} from 'fs/promises';
import path from "path";
import {func} from "prop-types";
import {result} from "lodash";

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

    public find(name: string, language?: string): Module | Function | Type | Variable | undefined {
        if (language) {
            switch (language) {
                case 'en':
                    return this.findInArray(this.English, name)
                    break;
                case 'fr':
                    return this.findInArray(this.French, name)
                    break;
                case 'ge':
                    return this.findInArray(this.German, name)
                    break;
                case 'it':
                    return this.findInArray(this.Italian, name)
                    break;
                default:
                    console.error("INCORRECT LANGUAGE")
                    break;
            }
        } else {
            let result = undefined
            result = this.findInArray(this.English, name)
            if (result == undefined){
                result = this.findInArray(this.French, name)
            }
            if (result == undefined){
                result = this.findInArray(this.German, name)
            }
            if (result == undefined){
                result = this.findInArray(this.Italian, name)
            }
            return result
        }
    }

    private findInArray(array:Module[], name: string): Module | Function | Type | Variable | undefined {
        for (let module of array){
                if (module.name == name) {
                    return  module
                } else {
                    let temp = undefined
                    temp = module.functions?.find(fun => fun.name == name)
                    if (temp == undefined) {
                        temp = module.types?.find(type => type.name == name)
                    }
                    if (temp == undefined) {
                        temp = module.variables?.find(variable => variable.name == name)
                    }
                    if (temp != undefined){
                        return temp
                    }
                }
            }
        return undefined
    }


}
