import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { isUndefined, negate } from 'lodash';
import { TOOLBOX_FILE, toolboxFiles } from './codeExecution';
import { ToolboxFunction } from './localStorage/schema';
import { PythonName, imported_names } from './python-analyzer/python_analyzer';

export default async function downloadSourceCode(
  source: string,
  getToolboxFunction: (name: string) => ToolboxFunction | undefined,
) {
  const mainFile = {
    name: 'main.py',
    content: source,
  };
  // Check whether source imports functions from the toolbox
  const allImports : PythonName[] = await imported_names(source);
  const toolboxNames = new Set(allImports
    .filter(({ module }) => module === TOOLBOX_FILE)
    .map(({ name }) => name));

  // If no toolbox functions are imported, download the source as a single
  // Python file. Otherwise, download a zip file containing the main source and
  // all the files needed for the toolbox.
  if (toolboxNames.size === 0) {
    const blob = new Blob([mainFile.content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, mainFile.name);
  } else {
    const toolboxFunctions = Array.from(toolboxNames).map(getToolboxFunction)
      .filter(negate(isUndefined)) as ToolboxFunction[];
    const files = [
      mainFile,
      ...toolboxFiles(toolboxFunctions),
    ];
    const zip = new JSZip();
    files.forEach(({ name, content }) => zip.file(name, content));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'sources.zip');
  }
}
