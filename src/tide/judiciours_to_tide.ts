/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  JudiciousConstant,
  JudiciousElement,
  JudiciousFunction,
  JudiciousParameter,
} from '../schemas/documentation';
import {
  ImportedConstantDefinition,
  ImportedFunctionDefinition,
} from './language/definitions';
import { FunctionParameter } from './language/types';
import { SoundType, UnsoundType } from './language/typing';

function toEnglishName(name: string): string | undefined {
  return Object.entries(translation_object).find((v) =>
    Object.values(v[1]).includes(name),
  )?.[0] as string | undefined;
}

const translation_object = {
  Graphic: {
    en: 'Graphic',
    it: 'Grafica',
    de: 'Grafik',
    fr: 'Graphique',
  },
  Color: {
    en: 'Color',
    it: 'Colore',
    de: 'Farbe',
    fr: 'Couleur',
  },
  Point: {
    en: 'Point',
    it: 'Punto',
    de: 'Punkt',
    fr: 'Point',
  },
  float: {
    _: 'float',
    _2: 'int',
  },
  str: {
    _: 'str',
  },
  bool: {
    _: 'bool',
  },
};

export type TideJudiciousMetadata = {
  judicious: JudiciousElement;
  module: string;
};

export function toTideType(v?: string): SoundType | UnsoundType {
  const translated_type = v ? toEnglishName(v) : undefined;

  return translated_type === 'Graphic'
    ? SoundType.Graphic
    : translated_type === 'Point'
      ? SoundType.Point
      : translated_type === 'Color'
        ? SoundType.Color
        : translated_type === 'float'
          ? SoundType.Float
          : translated_type === 'bool'
            ? SoundType.Bool
            : translated_type === 'str'
              ? SoundType.Str
              : UnsoundType.Bottom;
}

export function toTideParameter(p: JudiciousParameter): FunctionParameter {
  const { name, type } = p;

  const translated_type = toEnglishName(type);

  const parsed_type: SoundType | UnsoundType = toTideType(translated_type);

  if (parsed_type === UnsoundType.Bottom)
    throw new Error(`Could not parse judicious type ${type}`);
  return {
    name,
    type: parsed_type,
  };
}

export function toTideFunction(
  f: JudiciousFunction,
  module: string,
): ImportedFunctionDefinition<TideJudiciousMetadata, 'constructed'> {
  const parameters = f.parameters
    .filter((v) => !v.default)
    .map(toTideParameter);
  const location = { module, name: f.name };
  if (!f.returnValue)
    throw new Error(`Could not parse function with no return value ${f.name}`);
  const return_type = toTideType(f.returnValue?.type);

  return {
    location,
    parameters,
    type: return_type,
    kind: 'function_definition',
    subkind: 'imported',
    metadata: {
      module,
      judicious: f,
    },
  };
}

export function toTideConstant(
  c: JudiciousConstant,
  module: string,
): ImportedConstantDefinition<TideJudiciousMetadata, 'constructed'> {
  return {
    location: {
      module,
      name: c.name,
    },
    kind: 'constant_definition',
    subkind: 'imported',
    type: toTideType(c.type),
    metadata: {
      module,
      judicious: c,
    },
  };
}
