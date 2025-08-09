import { useCallback, useEffect, useRef, useState } from 'react';
import CodeEditor from '../CodeEditor';
import { ConfigurationState } from '../../src/tide/configuration';
import { executeOnServer } from '../../src/useActivity';
import { allKinds } from '../../src/documentation';
import {
  TideJudiciousMetadata,
  toTideConstant,
  toTideFunction,
} from '../../src/tide/judiciours_to_tide';
import { ImportedDefinition } from '../../src/tide/language/definitions';
import { evaluation, synchronous_phases } from '../../src/tide/evaluation';
import { JudiciousModule } from '../../src/schemas/documentation';

export default function TideConfigurationCode({
  setConfiguration,
  modules,
}: {
  setConfiguration: (v: Partial<ConfigurationState>) => void;
  modules: JudiciousModule[];
}) {
  const [source, setSource] = useState('from pytamaro import *');

  const configuration_timeout = useRef(undefined as NodeJS.Timeout | undefined);
  const cached_modules = useRef([] as string[]);

  const extract_names = useCallback(
    async (configuration_code: string) => {
      const code = `
from ast import parse, ImportFrom
parsed = parse(
    """${configuration_code}"""
)
imports = [b for b in parsed.body if b.__class__ == ImportFrom]
[print("IMPORT", v.module, o.name) for v in imports for o in v.names]
`;
      configuration_timeout.current = undefined;
      const results = await executeOnServer([code], 0, [], [])
        .catch(() => undefined)
        .then((v) => {
          return v?.type === 'success' ? v.stdout : undefined;
        })
        .then((v) => {
          if (!v) return [];

          const lines = v.trim().split('\n');
          const imports = lines
            .map((v) => v.trim())
            .filter((v) => v.startsWith('IMPORT'))
            .map((v) => v.substring('IMPORT '.length));
          return imports;
        });

      const imports = results
        .map((v) => v.split(' '))
        .map((v) => ({ module: v[0], name: v[1] }));

      const result = imports
        .map(({ module, name }) => {
          if (name === '*') {
            return (
              modules
                .find((v) => v.module === module)
                ?.elements.filter(
                  (v) => v.kind === 'constant' || v.kind === 'function',
                )
                .map((v) => ({ module, value: v })) || []
            );
          }
          return (
            modules
              .find((v) => v.module === module)
              ?.elements.filter(
                (v) => v.kind === 'constant' || v.kind === 'function',
              )
              .filter((v) => v.name === name)
              .map((v) => ({ module, value: v })) || []
          );
        })
        .map((v) =>
          v
            .map((o) => {
              try {
                return o.value.kind === 'constant'
                  ? toTideConstant(o.value, o.module)
                  : toTideFunction(o.value, o.module);
              } catch {
                return undefined;
              }
            })
            .filter((v) => v),
        )
        .flat()
        .map(
          (v) => v as ImportedDefinition<TideJudiciousMetadata, 'constructed'>,
        );

      const sorted = result.toSorted((a, b) => {
        const v_a =
          a.kind === 'function_definition'
            ? allKinds.function.priority
            : allKinds.constant.priority;
        const v_b =
          b.kind === 'function_definition'
            ? allKinds.function.priority
            : allKinds.constant.priority;
        if (
          a.kind === 'function_definition' &&
          b.kind === 'function_definition'
        )
          return a.parameters.length - b.parameters.length;
        return v_b - v_a;
      });

      const imported = await evaluation(
        synchronous_phases({
          imported_definitions: sorted,
          expressions: [],
          local_definitions: [],
        }),
      ).then((v) => v.imported_definitions);

      setConfiguration({
        imported_definitions: imported,
      });
    },
    [modules, setConfiguration],
  );

  useEffect(() => {
    if (modules.length === cached_modules.current.length) return;
    cached_modules.current = modules.map((v) => v.module);
    if (configuration_timeout.current)
      clearTimeout(configuration_timeout.current);
    configuration_timeout.current = setTimeout(async () => {
      configuration_timeout.current = undefined;
      return extract_names(source);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, source]);

  return (
    <CodeEditor
      initialSource=''
      currentSource={source}
      onChange={async (v) => {
        setSource(v);
      }}
    />
  );
}
