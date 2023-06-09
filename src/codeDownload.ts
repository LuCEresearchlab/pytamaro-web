import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { toolboxFiles } from './codeExecution';
import { ToolboxFunction } from './localStorage/schema';
import { transitivelyImportedToolboxFunctions } from './localStorage/useActivity';

export default async function downloadSourceCode(
  source: string,
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
  // If no toolbox functions are imported, download the source as a single
  // Python file. Otherwise, download a zip file containing the main source and
  // all the files needed for the toolbox.
  if (toolboxFunctions.length === 0) {
    const blob = new Blob([mainFile.content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, mainFile.name);
  } else {
    const files = [
      mainFile,
      ...await toolboxFiles(toolboxFunctions),
    ];
    const zip = new JSZip();
    files.forEach(({ name, content }) => zip.file(name, content));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'sources.zip');
  }
}
