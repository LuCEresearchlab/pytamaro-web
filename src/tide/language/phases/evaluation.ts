/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ProgramState } from '.';
import {
  ExecutionResponse as ExecutorExecutionResponse,
  PythonMode,
} from '../../../execution/codeExecution';
import { ExecutionMetadata } from '../../../execution/messageTypes';
import { ToolboxFunction } from '../../../localStorage/schema';
import { PythonFile } from '../../../schemas/activitySchema';
import { TamaroCard } from '../cards';
import {
  Definition,
  ImportedDefinition,
  ImportedFunctionDefinition,
  LocalDefinition,
} from '../definitions';
import { TideRuntimeError_builder } from '../error_builders';
import { CodeRepresentation } from '../types';
import { EvaluatedValueType, SoundType, ValueType } from '../typing';
import { turnCodeElementToCode } from './code_created';

// Do not record events from TIDE internals
const dummyExecutionMetadata: ExecutionMetadata = {
  executionUUID: crypto.randomUUID(),
  allowSharingAnonData: 'no',
  userUuid: '',
  experimentKey: '',
};

export type ExecutionResponse = CompletedExecutionResponse | FailedExecution;

export interface CompletedExecutionResponse {
  type: 'success' | 'error';
  stdout: string;
  stderr: string;
}

export interface FailedExecution {
  type: 'time-limit-exceeded' | 'output-limit-exceeded' | 'network-error';
}

const show_graphic_definition: ImportedFunctionDefinition<
  unknown,
  'code_element'
> = {
  kind: 'function_definition',
  subkind: 'imported',
  type: false,
  code_element: {
    definition: `from pytamaro import show_graphic`,
    location: { module: 'pytamaro', name: 'show_graphic' },
    imports: [],
  },
  location: { module: 'pytamaro', name: 'show_graphic' },
  parameters: [{ name: 'graphic', type: SoundType.Graphic }],
  metadata: undefined,
};

type SourceState<U, Tlocal, Timport> = ProgramState<
  U,
  Tlocal,
  Timport,
  'code_created'
>;
type DestinationState<U, Tlocal, Timport> = ProgramState<
  U,
  Tlocal,
  Timport,
  'evaluated'
>;

async function extract_data(
  execute: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    pythonMode: PythonMode,
  ) => Promise<ExecutorExecutionResponse>,
  code_repr: CodeRepresentation,
  type: ValueType,
  definitions: Definition<unknown, unknown, unknown, 'code_element'>[],
): Promise<EvaluatedValueType[SoundType] | { error: string }> {
  if (!('expression' in code_repr))
    throw new Error('Code should represent an expression');

  switch (type) {
    case SoundType.Graphic: {
      const new_code: CodeRepresentation = {
        expression: `show_graphic(${code_repr.expression})`,
        imports: code_repr.imports.concat([
          { module: 'pytamaro', name: 'show_graphic' },
        ]),
      };
      const code = turnCodeElementToCode(
        new_code,
        definitions.concat(show_graphic_definition),
      );

      return await execute(
        [code],
        0,
        [],
        [],
        dummyExecutionMetadata,
        PythonMode.Exec,
      )
        .then((v) => v as CompletedExecutionResponse)
        .then(({ stdout, stderr }) => {
          if (stderr.trim().length !== 0) {
            return {
              error: stderr
                .trim()
                .substring(stderr.trim().lastIndexOf('\n'))
                .trim(),
            };
          }
          if (!stdout.includes('@@@PYTAMARO_DATA_URI_BEGIN@@@'))
            return undefined;

          const pytamaroDataUriRegex =
            /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
          return stdout
            .split(pytamaroDataUriRegex)
            .filter((v) => v.length !== 0)[0];
        });
    }

    case SoundType.Color: {
      const new_code: CodeRepresentation = {
        expression: `print((${code_repr.expression}).red)\nprint((${code_repr.expression}).green)\nprint((${code_repr.expression}).blue)\nprint((${code_repr.expression}).alpha)`,
        imports: code_repr.imports,
      };
      const code = turnCodeElementToCode(new_code, definitions.concat());

      return await execute(
        [code],
        0,
        [],
        [],
        dummyExecutionMetadata,
        PythonMode.Exec,
      )
        .then((v) => v as CompletedExecutionResponse)
        .then(({ stdout, stderr }) => {
          if (stderr.trim().length !== 0) {
            return {
              error: stderr
                .trim()
                .substring(stderr.trim().lastIndexOf('\n'))
                .trim(),
            };
          }
          const lines = (stdout || '').split('\n').map((v: string) => v.trim());
          if (lines.length !== 5) return undefined;

          const [red, green, blue, alpha] = lines.map(Number.parseFloat);
          return { red, green, blue, alpha };
        });
    }
    case SoundType.Int:
    case SoundType.Float:
    case SoundType.Str:
    case SoundType.Bool: {
      const new_code: CodeRepresentation = {
        expression: `print(repr(${code_repr.expression}))`,
        imports: code_repr.imports,
      };
      const code = turnCodeElementToCode(new_code, definitions.concat());

      return await execute(
        [code],
        0,
        [],
        [],
        dummyExecutionMetadata,
        PythonMode.Exec,
      )
        .then((v) => v as CompletedExecutionResponse)
        .then(({ stdout, stderr }) => {
          if (stderr.trim().length !== 0) {
            return {
              error: stderr
                .trim()
                .substring(stderr.trim().lastIndexOf('\n'))
                .trim(),
            };
          }
          const repr = stdout.replace(/\r?\n$/, '');
          return repr.length === 0 ? undefined : { repr };
        });
    }
    case SoundType.Point:
      return undefined;
  }
  return undefined;
}

export default async function evaluated_phase<U, Tlocal, Timport>(
  execute: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    pythonMode: PythonMode,
  ) => Promise<ExecutorExecutionResponse>,
  base: SourceState<U, Tlocal, Timport>,
): Promise<DestinationState<U, Tlocal, Timport>> {
  const definitions = base.imported_definitions
    .map((v) => v as Definition<U, Tlocal, Timport, 'code_created'>)
    .concat(base.local_definitions);
  function imported_definition_phase(
    def: ImportedDefinition<Timport, 'code_created'>,
  ): ImportedDefinition<Timport, 'evaluated'> {
    if ('error_phase' in def) return def;

    return {
      ...def,
    };
  }

  async function local_definition_phase(
    def: LocalDefinition<U, Tlocal, 'code_created'>,
  ): Promise<LocalDefinition<U, Tlocal, 'evaluated'>> {
    const root = def.root ? await expression_phase(def.root) : undefined;
    if ('error_phase' in def) return { ...def, root };

    if (!root || 'error_phase' in root) {
      throw new Error('Error should have been recorded previously');
    }

    return {
      ...def,
      root,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  async function expression_phase(
    exp: TamaroCard<U, 'code_created'>,
  ): Promise<TamaroCard<U, 'evaluated'>> {
    switch (exp.kind) {
      case 'function_use': {
        const children = new Map(
          await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (exp.children as any)
              .entries()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map(async ([k, v]: any) => [k, await expression_phase(v)]),
          ),
        ) as Map<string, TamaroCard<U, 'evaluated'>>;
        if ('error_phase' in exp) return { ...exp, children };

        if (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (children.values() as any).find((v: any) => 'error_phase' in v) as any
        ) {
          throw new Error('Error should have been recorded previously');
        }

        const data = await extract_data(
          execute,
          exp.code_element,
          exp.type,
          definitions,
        );

        if (data && typeof data === 'object' && 'error' in data) {
          return {
            ...exp,
            children,
            error_phase: 'evaluated',
            value: TideRuntimeError_builder(data.error),
          };
        }

        return {
          ...exp,
          children,
          data,
        };
      }
      case 'constant_use': {
        if ('error_phase' in exp) return exp;
        const data = await extract_data(
          execute,
          exp.code_element,
          exp.type,
          definitions,
        );

        if (data && typeof data === 'object' && 'error' in data) {
          return {
            ...exp,
            error_phase: 'evaluated',
            value: TideRuntimeError_builder(data.error),
          };
        }

        return {
          ...exp,
          data,
        };
      }
      case 'literal': {
        if ('error_phase' in exp) return exp;
        const data = await extract_data(
          execute,
          exp.code_element,
          exp.type,
          definitions,
        );

        if (data && typeof data === 'object' && 'error' in data) {
          return {
            ...exp,
            error_phase: 'evaluated',
            value: TideRuntimeError_builder(data.error),
          };
        }

        return {
          ...exp,
          data,
        };
      }
    }
  }

  return {
    expressions: (await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (base.expressions as any).map(expression_phase),
    )) as TamaroCard<U, 'evaluated'>[],
    imported_definitions: await Promise.all(
      base.imported_definitions.map(imported_definition_phase),
    ),
    local_definitions: (await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (base.local_definitions as any).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        local_definition_phase as any,
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    )) as any,
  };
}
