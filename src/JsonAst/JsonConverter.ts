import { readdir, readFile } from 'fs/promises';
import path from 'path';
import {
  Function, JsonObjType, LanguageString, LibraryString, Module, Type, Variable,
} from './Json_structure';

const BASE_PATH: string = path.join(process.cwd(), 'public/JsonDocumentation');

export interface DividedModule {
  functions: Function[],
  types: Type[],
  variables: Variable[]
}

export class JsonConverter {
  English: Module[] = [];

  French: Module[] = [];

  German: Module[] = [];

  Italian: Module[] = [];

  public async init() {
    this.English = await this.readFiles(path.join(BASE_PATH, 'English'));
    this.French = await this.readFiles(path.join(BASE_PATH, 'French'));
    this.German = await this.readFiles(path.join(BASE_PATH, 'German'));
    this.Italian = await this.readFiles(path.join(BASE_PATH, 'Italian'));
  }

  // TODO: fix this for eslint
  // eslint-disable-next-line class-methods-use-this
  private async readFiles(folder: string): Promise<Module[]> {
    const files = await readdir(folder);
    const result: Module[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const fileContent = await readFile(path.join(folder, file), 'utf-8');
      const moduleObj = JSON.parse(fileContent);
      result.push(moduleObj);
    }
    return result;
  }

  public find(name: string, language?: LanguageString): {
    'obj_type': JsonObjType,
    'obj': Module | Function | Type | Variable
    'library': LibraryString
  } | undefined {
    if (language) {
      switch (language) {
        case LanguageString.English:
          return this.findInArray(this.English, name, LibraryString.English);
        case LanguageString.French:
          return this.findInArray(this.French, name, LibraryString.French);
        case LanguageString.German:
          return this.findInArray(this.German, name, LibraryString.German);
        case LanguageString.Italian:
          return this.findInArray(this.Italian, name, LibraryString.Italian);
        default:
          return undefined;
      }
    } else {
      let result = this.findInArray(this.English, name, LibraryString.English);
      if (result === undefined) {
        result = this.findInArray(this.French, name, LibraryString.French);
      }
      if (result === undefined) {
        result = this.findInArray(this.German, name, LibraryString.German);
      }
      if (result === undefined) {
        result = this.findInArray(this.Italian, name, LibraryString.Italian);
      }
      return result;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private findInArray(array: Module[], name: string, library: LibraryString): {
    'obj_type': JsonObjType,
    'obj': Module | Function | Type | Variable
    'library': LibraryString
  } | undefined {
    const lowerCaseName = name.toLowerCase();
    let result;
    array.forEach((module) => {
      if (module.name.toLowerCase() === lowerCaseName) {
        result = {
          obj_type: JsonObjType.module,
          obj: module,
          library,
        };
      }
      let obj = module.functions?.find((fun) => fun.name.toLowerCase() === lowerCaseName);
      let objType: JsonObjType = JsonObjType.function;
      if (obj === undefined) {
        obj = module.types?.find((type) => type.name.toLowerCase() === lowerCaseName);
        objType = JsonObjType.type;
      }
      if (obj === undefined) {
        obj = module.variables?.find(
          (variable) => variable.name.toLowerCase() === lowerCaseName,
        );
        objType = JsonObjType.variable;
      }
      if (obj !== undefined) {
        result = {
          obj_type: objType,
          obj,
          library,
        };
      }
    });
    return result;
  }

  public languageDividedByType(language: LanguageString): DividedModule {
    switch (language) {
      case LanguageString.English:
        return this.divideArrayByType(this.English);
      case LanguageString.French:
        return this.divideArrayByType(this.French);
      case LanguageString.German:
        return this.divideArrayByType(this.German);
      case LanguageString.Italian:
        return this.divideArrayByType(this.Italian);
      default:
        return { /* modules: [], */
          functions: [],
          types: [],
          variables: [],
        };
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private divideArrayByType(array: Module[]): DividedModule {
    const result = {
      // modules: ([] as Module[]),
      functions: ([] as Function[]),
      types: ([] as Type[]),
      variables: ([] as Variable[]),
    };
    array.forEach((module) => {
      result.functions.push(...(module.functions ? module.functions : []));
      result.types.push(...(module.types ? module.types : []));
      result.variables.push(...(module.variables ? module.variables : []));
    });
    return result;
  }
}
