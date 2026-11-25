import { useDocumentationElements } from '../../src/documentation';
import { PythonName } from '../../src/python-analyzer/python_analyzer';
import type { FilesAnalysisResult } from '../../src/pythonWorkspace';
import type { ActivityVariant } from '../../src/schemas/activitySchema';
import DocElement from './DocElement';

export default function InlineAPI({
  name,
  language = undefined,
  module = undefined,
  activityVariant,
  extraPythonFilesAnalysisResults = [],
}: {
  name: string;
  language?: string | undefined;
  module?: string | undefined;
  activityVariant: ActivityVariant;
  extraPythonFilesAnalysisResults?: FilesAnalysisResult;
}) {
  // When not provided explicitly, the language is inferred from the activity variant.
  const bestLanguage = language ?? activityVariant.language;

  // When not provided explicitly, the module assumed to be 'pytamaro'
  // (possibly a language-specific submodule).
  const moduleName =
    module ?? (bestLanguage === 'en' ? 'pytamaro' : `pytamaro.${bestLanguage}`);

  const elements = useDocumentationElements(
    [new PythonName(moduleName, name)],
    [],
    extraPythonFilesAnalysisResults,
  );
  const elementWithModule = elements.find(
    (el) => el.module === moduleName && el.element.name === name,
  );

  return elementWithModule ? (
    <DocElement
      module={moduleName}
      element={elementWithModule.element}
      activityVariant={activityVariant}
      smallerFont={false}
    />
  ) : (
    <span>{name}</span>
  );
}
