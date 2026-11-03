/* tslint:disable */
/* eslint-disable */

export class AnalysisResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    called_names: CalledName[];
    defined_constants: PythonConstant[];
    defined_functions: PythonFunction[];
    ellipsis: Uint32Array;
    import_ranges: TextRange[];
    imported_names: PythonName[];
    get last_expr_range(): Range | undefined;
    set last_expr_range(value: Range | null | undefined);
    parse_errors: ParseError[];
}

export class CalledName {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    name: string;
    start: number;
}

export class Diagnostic {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    display(workspace: Workspace): string;
    id(): string;
    message(): string;
    toRange(workspace: Workspace): Range | undefined;
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
    path(): string;
    toString(): string;
}

export class LocationLink {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * The full range of the target
     */
    full_range: Range;
    /**
     * The range of the origin.
     */
    get origin_selection_range(): Range | undefined;
    /**
     * The range of the origin.
     */
    set origin_selection_range(value: Range | null | undefined);
    /**
     * The target file path
     */
    path: string;
    /**
     * The target's range that should be selected/highlighted
     */
    get selection_range(): Range | undefined;
    /**
     * The target's range that should be selected/highlighted
     */
    set selection_range(value: Range | null | undefined);
}

export enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
}

export class ParseError {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    location: Range;
    message: string;
}

export class Position {
    free(): void;
    [Symbol.dispose](): void;
    constructor(line: number, column: number);
    /**
     * One indexed column number (the nth character on the line)
     */
    column: number;
    /**
     * One indexed line number
     */
    line: number;
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
    docstring: string;
    name: string;
    type_str: string;
}

export class PythonFunction {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    args: PythonFunctionArgument[];
    docstring: string;
    explicit_return: boolean;
    name: string;
    return_type_str: string;
    side_effects: boolean;
    start: number;
}

export class PythonFunctionArgument {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    get default(): string | undefined;
    set default(value: string | null | undefined);
    name: string;
    type_str: string;
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
    end: Position;
    start: Position;
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
    Operator = 15,
    Regexp = 16,
}

export class TextRange {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    end: number;
    start: number;
}

export class Workspace {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Checks a single file.
     */
    checkFile(file_id: FileHandle): Diagnostic[];
    /**
     * Checks all open files
     */
    check(): Diagnostic[];
    closeFile(file_id: FileHandle): void;
    gotoDeclaration(file_id: FileHandle, position: Position): LocationLink[];
    constructor(root: string, position_encoding: PositionEncoding, options: any);
    openFile(path: string, contents: string): FileHandle;
    semanticTokensInRange(file_id: FileHandle, range: Range): SemanticToken[];
    semanticTokens(file_id: FileHandle): SemanticToken[];
    sourceText(file_id: FileHandle): string;
    updateFile(file_id: FileHandle, contents: string): void;
}

export function analyzeFile(workspace: Workspace, file_id: FileHandle): AnalysisResult;

/**
 * Importantly, this does not cache any state (e.g., the parsed AST) between calls.
 */
export function findImportedNames(source: string): PythonName[];

/**
 * Initializes the logger with the given log level.
 *
 * ## Panics
 * If this function is called more than once.
 */
export function initLogging(level: LogLevel): void;

export function initWorkspace(): Workspace;

export function run(): void;
