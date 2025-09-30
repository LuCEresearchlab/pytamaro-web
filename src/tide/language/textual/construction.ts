import { TamaroCard } from '../cards';
import { ImportedDefinition, LocalDefinition } from '../definitions';
import { ProgramState } from '../phases';
import {
  ConstantUse,
  Definition,
  Expression,
  FunctionUse,
  Literal,
  Program,
} from './types';

export function turnTextualExpressionToCard(
  exp: Expression,
): TamaroCard<Expression, 'unconstructed'> {
  switch (exp.type) {
    case 'LiteralFloat':
    case 'LiteralInt':
    case 'LiteralString':
    case 'LiteralBool':
      return { kind: 'literal', metadata: exp };
    case 'FunctionUse':
      return { kind: 'function_use', metadata: exp };
    case 'ConstantUse':
      return { kind: 'constant_use', metadata: exp };
  }
}

export function turnTextualDefinitionToTideDefinition(
  def: Definition,
): LocalDefinition<Expression, Definition, 'unconstructed'> {
  return {
    kind: 'constant_definition',
    subkind: 'local',
    metadata: def,
  };
}

export function fromProgramToUnconstructedState<Timport>(
  imported: ImportedDefinition<Timport, 'constructed'>[],
  program: Program,
): ProgramState<Expression, Definition, Timport, 'unconstructed'> {
  return {
    expressions: [program.root.expression].map(turnTextualExpressionToCard),
    imported_definitions: imported,
    local_definitions: program.definitions.map(
      turnTextualDefinitionToTideDefinition,
    ),
  };
}

export default function construction_phase_constructor<Timport>(
  base: ProgramState<Expression, Definition, Timport, 'unconstructed'>,
): ProgramState<Expression, Definition, Timport, 'constructed'> {
  const { expressions, imported_definitions, local_definitions } = base;

  function expression_phase(
    root: TamaroCard<Expression, 'unconstructed'>,
  ): TamaroCard<Expression, 'constructed'> {
    switch (root.kind) {
      case 'function_use': {
        const metadata = root.metadata as FunctionUse;
        const children = new Map(
          metadata.args.map((v) => [
            v.name,
            expression_phase(turnTextualExpressionToCard(v.value)),
          ]),
        );

        return {
          ...root,
          children,
          function_name: metadata.name,
        };
      }
      case 'constant_use': {
        const metadata = root.metadata as ConstantUse;

        return {
          ...root,
          constant_name: metadata.name,
        };
      }
      case 'literal': {
        const metadata = root.metadata as Literal;
        switch (metadata.type) {
          case 'LiteralFloat':
            return {
              ...root,
              input: !String(metadata.value).includes('.')
                ? String(metadata.value) + '.'
                : String(metadata.value),
            };
          case 'LiteralInt':
            return { ...root, input: String(metadata.value) };
          case 'LiteralString':
            return { ...root, input: String(metadata.value) };
          case 'LiteralBool':
            return { ...root, input: metadata.value ? 'True' : 'False' };
        }
      }
    }
  }

  function local_definition_phase(
    def: LocalDefinition<Expression, Definition, 'unconstructed'>,
  ): LocalDefinition<Expression, Definition, 'constructed'> {
    const metadata = def.metadata;
    return {
      ...def,
      location: { module: false, name: metadata.name },
      root: metadata.value
        ? expression_phase(turnTextualExpressionToCard(metadata.value))
        : undefined,
    };
  }

  return {
    expressions: expressions.map(expression_phase),
    imported_definitions: imported_definitions as ImportedDefinition<
      Timport,
      'constructed'
    >[],
    local_definitions: local_definitions.map(local_definition_phase),
  };
}
