import module from "./module.ts";

import {readdir, readFile} from 'fs/promises';
import path from "path";
import {file, folder} from "jszip";

const BASE_PATH: string = "../../public/JsonDocumentation";

export class JsonConverter {

    name: String = ""
    English: module[] = []
    French: module[] = []
    German: module[] = []
    Italian: module[] = []

    public constructor(name: string) {
        this.name = name;
        this.readFiles(path.join(BASE_PATH, "English"), this.English)
    }

    private readFiles(folder: string, destination: module[]) {
        readdir(folder).then(async (files) => {
            for (const file of files) {
                console.log(file);
                // const fileContent = await readFile(path.join(folder, file), 'utf-8');
                // const moduleObj = JSON.parse(fileContent);
                // destination.push(moduleObj);
            }
        });
    }

    public print() {
        console.log("JsonConverter.print(): " + this.name);
        return this.name;
    }
}