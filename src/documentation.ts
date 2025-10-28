import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { isEqual, uniqWith } from 'lodash';
import { useMemo } from 'react';
import {
  definedConstantToJudiciousConstant,
  definedFnToJudiciousFunction,
  toolboxToJudiciousFunction,
} from '../components/documentation/utils';
import { TOOLBOX_FILE } from './codeExecution';
import useLocalToolbox from './localStorage/useLocalToolbox';
import {
  analyze,
  PythonFunction,
  PythonName,
} from './python-analyzer/python_analyzer';
import { PythonFile } from './schemas/activitySchema';
import { JudiciousElement, JudiciousModule } from './schemas/documentation';
import { judiciousDocPathname } from './urlUtils';

export default function useJudiciousDocData(modules: string[]) {
  const results = useQueries({
    queries: modules.map((module) => ({
      queryKey: [module],
      queryFn: (): Promise<JudiciousModule> =>
        axios
          .get(judiciousDocPathname(module))
          .then((response) => response.data),
    })),
  });
  return results
    .map((result) => result.data)
    .filter((data) => data !== undefined);
}

export const allKinds = {
  function: { id: 'function', label: 'Function', priority: 0 },
  constant: { id: 'constant', label: 'Constant', priority: 1 },
  type: { id: 'type', label: 'Type', priority: 2 },
};

export function useDocumentationElements(
  names: PythonName[],
  locallyDefinedFunctions: PythonFunction[],
  extraPythonFiles: PythonFile[],
): { module: string; element: JudiciousElement }[] {
  const extraDocumentation = useMemo(
    () =>
      extraPythonFiles.map((file) => {
        const analysisResult = analyze(file.content);
        return {
          module: file.name.replace(/\.py$/, ''),
          elements: [
            ...analysisResult.defined_functions.map(
              definedFnToJudiciousFunction,
            ),
            ...analysisResult.defined_constants.map(
              definedConstantToJudiciousConstant,
            ),
          ],
        };
      }),
    [extraPythonFiles],
  );

  const extraDocumentationModules = extraDocumentation.map(
    (file) => file.module,
  );

  const modulesToFetch = uniqWith(
    names.map(({ module }) => module),
    isEqual,
  ).filter(
    (module) =>
      !(module === TOOLBOX_FILE || extraDocumentationModules.includes(module)),
  );

  const modulesData = useJudiciousDocData(modulesToFetch);

  const { list } = useLocalToolbox();
  const toolboxFunctions = list();

  const namesToShow = locallyDefinedFunctions
    .map(({ name }) => ({ module: '.', name }))
    .concat(names);

  return namesToShow
    .flatMap(({ module, name }) => {
      if (module === TOOLBOX_FILE) {
        const toolboxFunction = toolboxFunctions.find((fn) => fn.name === name);
        return (
          toolboxFunction && [
            {
              module: TOOLBOX_FILE,
              element: toolboxToJudiciousFunction(toolboxFunction),
            },
          ]
        );
      }
      if (module === '.') {
        const definedFunction = locallyDefinedFunctions.find(
          (fn) => fn.name === name,
        );
        return (
          definedFunction && [
            {
              module: '.',
              element: definedFnToJudiciousFunction(definedFunction),
            },
          ]
        );
      }
      if (extraDocumentation.find((file) => file.module === module)) {
        const element = extraDocumentation
          .find((file) => file.module === module)
          ?.elements.find((el) => el.name === name);
        if (element) {
          return [{ module, element }];
        }
      }
      const moduleData = modulesData.find((data) => data?.module === module);
      if (name === '*') {
        return moduleData?.elements.map((element) => ({ module, element }));
      }
      const element = moduleData?.elements?.find((el) => el.name === name);
      return element && [{ module, element }];
    })
    .filter((element) => element !== undefined);
}
