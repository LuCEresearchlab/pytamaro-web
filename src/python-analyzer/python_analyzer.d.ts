/* tslint:disable */
/* eslint-disable */

export class AnalysisResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  imported_names: PythonName[];
  defined_functions: PythonFunction[];
  defined_constants: PythonConstant[];
  called_names: CalledName[];
  ellipsis: Uint32Array;
  import_ranges: TextRange[];
  parse_errors: ParseError[];
}

export class CalledName {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  name: string;
  start: number;
}

export class Completion {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  name: string;
  get kind(): CompletionKind | undefined;
  set kind(value: CompletionKind | null | undefined);
  get insert_text(): string | undefined;
  set insert_text(value: string | null | undefined);
  get additional_text_edits(): TextEdit[] | undefined;
  set additional_text_edits(value: TextEdit[] | null | undefined);
  get documentation(): string | undefined;
  set documentation(value: string | null | undefined);
  get detail(): string | undefined;
  set detail(value: string | null | undefined);
  get module_name(): string | undefined;
  set module_name(value: string | null | undefined);
}

export enum CompletionKind {
  Text = 0,
  Method = 1,
  Function = 2,
  Constructor = 3,
  Field = 4,
  Variable = 5,
  Class = 6,
  Interface = 7,
  Module = 8,
  Property = 9,
  Unit = 10,
  Value = 11,
  Enum = 12,
  Keyword = 13,
  Snippet = 14,
  Color = 15,
  File = 16,
  Reference = 17,
  Folder = 18,
  EnumMember = 19,
  Constant = 20,
  Struct = 21,
  Event = 22,
  Operator = 23,
  TypeParameter = 24,
}

export class Diagnostic {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  textRange(): TextRange | undefined;
  id(): string;
  display(workspace: Workspace): string;
  message(): string;
  severity(): Severity;
  toRange(workspace: Workspace): Range | undefined;
}

export class DocumentHighlight {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly range: Range;
  readonly kind: DocumentHighlightKind;
}

export enum DocumentHighlightKind {
  Text = 1,
  Read = 2,
  Write = 3,
}

export class FileHandle {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  toString(): string;
  path(): string;
}

export class Hover {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  markdown: string;
  range: Range;
}

export class InlayHint {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  markdown: string;
  position: Position;
  kind: InlayHintKind;
}

export enum InlayHintKind {
  Type = 0,
  Parameter = 1,
}

export class LocationLink {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * The target file path
   */
  path: string;
  /**
   * The full range of the target
   */
  full_range: Range;
  /**
   * The target's range that should be selected/highlighted
   */
  get selection_range(): Range | undefined;
  /**
   * The target's range that should be selected/highlighted
   */
  set selection_range(value: Range | null | undefined);
  /**
   * The range of the origin.
   */
  get origin_selection_range(): Range | undefined;
  /**
   * The range of the origin.
   */
  set origin_selection_range(value: Range | null | undefined);
}

export class ParameterInformation {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  label: string;
  get documentation(): string | undefined;
  set documentation(value: string | null | undefined);
}

export class ParseError {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  message: string;
  location: TextRange;
}

export class Position {
  free(): void;
  [Symbol.dispose](): void;
  constructor(line: number, column: number);
  /**
   * One indexed line number
   */
  line: number;
  /**
   * One indexed column number (the nth character on the line)
   */
  column: number;
}

export enum PositionEncoding {
  Utf8 = 0,
  Utf16 = 1,
  Utf32 = 2,
}

export class PythonConstant {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  name: string;
  type_str: string;
  docstring: string;
}

export class PythonFunction {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  name: string;
  args: PythonFunctionArgument[];
  return_type_str: string;
  docstring: string;
  explicit_return: boolean;
  side_effects: boolean;
  start: number;
}

export class PythonFunctionArgument {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  name: string;
  type_str: string;
  get default(): string | undefined;
  set default(value: string | null | undefined);
  variable_length: boolean;
}

export class PythonName {
  free(): void;
  [Symbol.dispose](): void;
  constructor(module: string, name: string);
  module: string;
  name: string;
}

export class Range {
  free(): void;
  [Symbol.dispose](): void;
  constructor(start: Position, end: Position);
  start: Position;
  end: Position;
}

export class SemanticToken {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static kinds(): string[];
  static modifiers(): string[];
  kind: SemanticTokenKind;
  modifiers: number;
  range: Range;
}

export enum SemanticTokenKind {
  Namespace = 0,
  Class = 1,
  Parameter = 2,
  SelfParameter = 3,
  ClsParameter = 4,
  Variable = 5,
  Property = 6,
  Function = 7,
  Method = 8,
  Keyword = 9,
  String = 10,
  Number = 11,
  Decorator = 12,
  BuiltinConstant = 13,
  TypeParameter = 14,
}

export enum Severity {
  Info = 0,
  Warning = 1,
  Error = 2,
  Fatal = 3,
}

export class SignatureHelp {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  signatures: SignatureInformation[];
  get active_signature(): number | undefined;
  set active_signature(value: number | null | undefined);
}

export class SignatureInformation {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  label: string;
  get documentation(): string | undefined;
  set documentation(value: string | null | undefined);
  parameters: ParameterInformation[];
  get active_parameter(): number | undefined;
  set active_parameter(value: number | null | undefined);
}

export class TextEdit {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  range: Range;
  new_text: string;
}

export class TextRange {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  start: number;
  end: number;
}

export class Workspace {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Checks a single file.
   */
  checkFile(file_id: FileHandle): Diagnostic[];
  closeFile(file_id: FileHandle): void;
  completions(file_id: FileHandle, position: Position): Completion[];
  inlayHints(file_id: FileHandle, range: Range): InlayHint[];
  sourceText(file_id: FileHandle): string;
  updateFile(file_id: FileHandle, contents: string): void;
  signatureHelp(file_id: FileHandle, position: Position): SignatureHelp | undefined;
  updateOptions(options: any): void;
  gotoDefinition(file_id: FileHandle, position: Position): LocationLink[];
  gotoReferences(file_id: FileHandle, position: Position): LocationLink[];
  semanticTokens(file_id: FileHandle): SemanticToken[];
  gotoDeclaration(file_id: FileHandle, position: Position): LocationLink[];
  /**
   * Gets a file handle for a vendored file by its path.
   * This allows vendored files to participate in LSP features like hover, completions, etc.
   */
  getVendoredFile(path: string): FileHandle;
  documentHighlights(file_id: FileHandle, position: Position): DocumentHighlight[];
  gotoTypeDefinition(file_id: FileHandle, position: Position): LocationLink[];
  semanticTokensInRange(file_id: FileHandle, range: Range): SemanticToken[];
  constructor(root: string, position_encoding: PositionEncoding, options: any);
  /**
   * Checks all open files
   */
  check(): Diagnostic[];
  hover(file_id: FileHandle, position: Position): Hover | undefined;
  format(file_id: FileHandle): string | undefined;
  /**
   * Returns the parsed AST for `path`
   */
  parsed(file_id: FileHandle): string;
  /**
   * Returns the token stream for `path` serialized as a string.
   */
  tokens(file_id: FileHandle): string;
  openFile(path: string, contents: string): FileHandle;
}

export function analyzeFile(workspace: Workspace, file_id: FileHandle): AnalysisResult;

/**
 * Importantly, this does not cache any state (e.g., the parsed AST) between calls.
 */
export function findImportedNames(source: string): PythonName[];

export function initWorkspace(): Workspace;
