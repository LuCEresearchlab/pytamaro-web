import { ToolboxFunction } from '../../src/localStorage/schema';
import { PythonConstant, PythonFunction } from '../../src/python-analyzer/python_analyzer';
import { JudiciousConstant, JudiciousFunction, JudiciousParameter } from '../../src/schemas/documentation';

export const HOVER_COLOR = '#c2ecff';
export const DARK_HOVER_COLOR = '#0eb4ff';

export function hoverProps(
  id: string,
  hover: string,
  setHover: (id: string) => void,
  dark: boolean = false,
) {
  const color = dark ? DARK_HOVER_COLOR : HOVER_COLOR;
  return {
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover(''),
    style: { backgroundColor: hover === id ? color : 'transparent' },
  };
}

export function paramId(i: number) {
  return `param-${i}`;
}

export function nameId() {
  return 'name';
}

export function returnId() {
  return 'return';
}

export function moduleId() {
  return 'module';
}

export function iconPath(module: string) {
  if (module === '.') {
    return '/codeblock-icon.svg';
  }
  if (module === 'toolbox') {
    return '/toolbox-logo.svg';
  }
  if (module === 'pytamaro' || module.startsWith('pytamaro.')) {
    return '/favicon.ico';
  }
  return '/python-logo.svg';
}

export function sentence(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function visibleParameters(params: JudiciousParameter[], showOptional: boolean) {
  return params.filter((param) => param.default === undefined || showOptional);
}

export function definedFnToJudiciousFunction(fn: PythonFunction): JudiciousFunction {
  return {
    kind: 'function',
    name: fn.name,
    description: {
      p: [fn.docstring],
    },
    parameters: fn.args.map((arg) => ({
      name: arg.name,
      type: arg.type_str,
      description: '',
      default: arg.default,
      variableLength: arg.variable_length,
    })),
    ...(fn.return_type_str !== '' || fn.explicit_return) && {
      returnValue: {
        type: fn.return_type_str,
        description: '',
      },
    },
  };
}

export function toolboxToJudiciousFunction(fn: ToolboxFunction): JudiciousFunction {
  return {
    kind: 'function',
    name: fn.name,
    description: {
      p: [fn.description],
    },
    parameters: fn.args.map((arg) => ({
      name: arg.name,
      type: arg.typeUnparsed,
      description: '',
    })),
    ...(fn.returnTypeUnparsed !== '') && {
      returnValue: {
        type: fn.returnTypeUnparsed,
        description: '',
      },
    },
  };
}

export function definedConstantToJudiciousConstant(constant: PythonConstant): JudiciousConstant {
  return {
    kind: 'constant',
    name: constant.name,
    type: constant.type_str,
    description: {
      p: [constant.docstring],
    },
  };
}
