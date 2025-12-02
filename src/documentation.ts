import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { isEqual, uniqWith } from 'lodash';
import { useMemo } from 'react';
import {
  definedConstantToJudiciousConstant,
  definedFnToJudiciousFunction,
  KNOWN_JUDICIOUS_MODULES,
  toolboxToJudiciousFunction,
} from '../components/documentation/utils';
import { TOOLBOX_FILE } from './codeExecution';
import useLocalToolbox from './localStorage/useLocalToolbox';
import { PythonFunction, PythonName } from './python-analyzer/python_analyzer';
import { JudiciousElement, JudiciousModule } from './schemas/documentation';
import { judiciousDocPathname } from './urlUtils';
import { FilesAnalysisResult } from './usePythonAnalyzer';

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
  extraPythonFilesAnalysisResults: FilesAnalysisResult,
): { module: string; element: JudiciousElement }[] {
  const extraDocumentation = useMemo(
    () =>
      extraPythonFilesAnalysisResults.map(({ name, analysisResult }) => {
        return {
          module: name.replace(/\.py$/, ''),
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
    [extraPythonFilesAnalysisResults],
  );

  const modulesToFetch = uniqWith(
    names.map(({ module }) => module),
    isEqual,
  ).filter((module) => KNOWN_JUDICIOUS_MODULES.includes(module));

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
