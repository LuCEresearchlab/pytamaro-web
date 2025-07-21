import { CompletedExecutionResponse } from '../../codeExecution';
import { create_code } from './code';
import { EvaluatedContext } from './context';
import { executeOnServer } from './evaluation';
import { SoundType } from './expression';
import { eqLocation } from './utils';

export function unwrap_local_definition<T>(
  definitions: EvaluatedContext<T>,
  context: EvaluatedContext<T>,
) {
  const unwrap_context: EvaluatedContext<T> = [];
  const stack = Array.from(definitions);

  while (stack.length !== 0) {
    const el = stack.pop()!;

    if (unwrap_context.find((v) => eqLocation(v.import, el.import))) continue;
    unwrap_context.push(el);

    stack.push(
      ...el.dependencies.map(
        (v) => context.find((o) => eqLocation(v, o.import))!,
      ),
    );
  }
  return unwrap_context;
}

export async function extract_data(
  expression: string,
  type: SoundType,
  definitions: EvaluatedContext<unknown>,
): Promise<unknown> {
  switch (type) {
    case SoundType.Graphic: {
      const new_expression = `from pytamaro import show_graphic\nshow_graphic(${expression})`;

      const code = create_code(new_expression, definitions);

      const { stdout } = await executeOnServer(code).then(
        (v) => v as CompletedExecutionResponse,
      );

      if (!stdout.includes('@@@PYTAMARO_DATA_URI_BEGIN@@@')) return undefined;

      const pytamaroDataUriRegex =
        /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
      return stdout
        .split(pytamaroDataUriRegex)
        .filter((v) => v.length !== 0)[0];
    }

    case SoundType.Color: {
      const new_expression = `print((${expression}).red)\nprint((${expression}).green)\nprint((${expression}).blue)\nprint((${expression}).alpha)`;

      const code = create_code(new_expression, definitions);

      const { stdout } = await executeOnServer(code).then(
        (v) => v as CompletedExecutionResponse,
      );
      const lines = (stdout || '').split('\n').map((v: string) => v.trim());
      if (lines.length !== 5) return undefined;

      const [red, green, blue, alpha] = lines.map(Number.parseFloat);
      return { red, green, blue, alpha };
    }
    case SoundType.Int:
    case SoundType.Float:
    case SoundType.Str:
    case SoundType.Bool:
    case SoundType.Point:
      return undefined;
  }
  return undefined;
}
