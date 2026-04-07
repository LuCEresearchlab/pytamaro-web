/* @ts-self-types="./python_analyzer.d.ts" */

import * as wasm from "./python_analyzer_bg.wasm";
import { __wbg_set_wasm } from "./python_analyzer_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    AnalysisResult, CalledName, Diagnostic, DocumentHighlight, DocumentHighlightKind, FileHandle, Hover, LocationLink, LogLevel, ParameterInformation, ParseError, Position, PositionEncoding, PythonConstant, PythonFunction, PythonFunctionArgument, PythonName, Range, SemanticToken, SemanticTokenKind, Severity, SignatureHelp, SignatureInformation, TextRange, Workspace, analyzeFile, findImportedNames, initLogging, initWorkspace, run
} from "./python_analyzer_bg.js";
