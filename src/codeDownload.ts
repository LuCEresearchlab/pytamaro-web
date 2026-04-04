import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { toolboxFiles } from './execution/codeExecution';
import { ToolboxFunction } from './localStorage/schema';
import { PythonFile } from './schemas/activitySchema';
import { transitivelyImportedToolboxFunctions } from './useActivity';

export default async function downloadSourceCode(
  source: string,
  extraPythonFiles: PythonFile[],
  getToolboxFunction: (name: string) => ToolboxFunction | undefined,
) {
  const mainFile = {
    name: 'main.py',
    content: source,
  };
  const toolboxFunctions = await transitivelyImportedToolboxFunctions(
    source,
    getToolboxFunction,
  );
  // If no toolbox functions are imported or extra Python files are included,
  // download the source as a single Python file. Otherwise, download a zip file
  // containing the main source and all the files needed.
  if (toolboxFunctions.length + extraPythonFiles.length === 0) {
    const blob = new Blob([mainFile.content], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, mainFile.name);
  } else {
    const files = [
      mainFile,
      // Do not include the toolbox file if it is empty
      ...(await toolboxFiles(toolboxFunctions, true)),
      ...extraPythonFiles,
    ];
    const zip = new JSZip();
    files.forEach(({ name, content }) => zip.file(name, content));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'sources.zip');
  }
}
