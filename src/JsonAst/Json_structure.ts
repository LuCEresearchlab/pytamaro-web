import { ToolboxFunction } from '../localStorage/schema';

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

export interface Image {
  uri: string;
  caption?: string;
}

export enum JsonObjType {
  module = 'Module',
  function = 'Function',
  type = 'Type',
  variable = 'Variable',
  toolbox = 'ToolboxFunction',
}

export function functionSignature(fn: Function, showOptional: boolean, showType: boolean): string {
  let signature: string = `${fn.name} (`;
  if (fn.parameters && fn.parameters.length !== 0) {
    fn.parameters.forEach((param) => {
      const typeString = (showType && param.type ? (`: ${param.type}`) : '');
      if (param.default_value !== undefined && showOptional) {
        signature += `${param.name + typeString} = ${param.default_value}, `;
      } else if (param.default_value === undefined) {
        signature += `${param.name + typeString}, `;
      }
    });
    signature = signature.substring(0, signature.length - 2);
  }
  signature += ')';
  if (fn.return_type) {
    signature += `->${showType ? fn.return_type : ''}`;
  }
  return signature;
}

export function functionMandatoryParameter(fn: Function) {
  let count = 0;
  if (fn.parameters && fn.parameters.length !== 0) {
    fn.parameters.forEach((param) => {
      if (param.default_value === undefined) {
        count += 1;
      }
    });
  }
  return count;
}

export function translateToFunction(fn: ToolboxFunction): Function {
  const description: EnhancedStr = { content: fn.description };
  const parameters: Variable[] = [];

  fn.args.forEach((arg) => {
    parameters.push({
      name: arg.name,
      type: arg.typeUnparsed,
    });
  });
  return {
    name: fn.name,
    description,
    return_type: fn.returnTypeUnparsed,
    parameters,
  };
}

export enum LanguageString {
  English = 'en',
  French = 'fr',
  German = 'de',
  Italian = 'it',
}

export enum LibraryString {
  English = 'pytamaro',
  French = 'pytamaro.fr',
  German = 'pytamaro.de',
  Italian = 'pytamaro.it',
  Toolbox = 'toolbox',
}
