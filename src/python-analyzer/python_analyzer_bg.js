let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

const AnalysisResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_analysisresult_free(ptr >>> 0, 1));

const CalledNameFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_calledname_free(ptr >>> 0, 1));

const CompletionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_completion_free(ptr >>> 0, 1));

const DiagnosticFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_diagnostic_free(ptr >>> 0, 1));

const DocumentHighlightFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_documenthighlight_free(ptr >>> 0, 1));

const FileHandleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_filehandle_free(ptr >>> 0, 1));

const HoverFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hover_free(ptr >>> 0, 1));

const InlayHintFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_inlayhint_free(ptr >>> 0, 1));

const LocationLinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_locationlink_free(ptr >>> 0, 1));

const ParameterInformationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_parameterinformation_free(ptr >>> 0, 1));

const ParseErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_parseerror_free(ptr >>> 0, 1));

const PositionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_position_free(ptr >>> 0, 1));

const PythonConstantFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pythonconstant_free(ptr >>> 0, 1));

const PythonFunctionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pythonfunction_free(ptr >>> 0, 1));

const PythonFunctionArgumentFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pythonfunctionargument_free(ptr >>> 0, 1));

const PythonNameFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pythonname_free(ptr >>> 0, 1));

const RangeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_range_free(ptr >>> 0, 1));

const SemanticTokenFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_semantictoken_free(ptr >>> 0, 1));

const SignatureHelpFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_signaturehelp_free(ptr >>> 0, 1));

const SignatureInformationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_signatureinformation_free(ptr >>> 0, 1));

const TextEditFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_textedit_free(ptr >>> 0, 1));

const TextRangeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_textrange_free(ptr >>> 0, 1));

const WorkspaceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_workspace_free(ptr >>> 0, 1));

export class AnalysisResult {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(AnalysisResult.prototype);
        obj.__wbg_ptr = ptr;
        AnalysisResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AnalysisResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_analysisresult_free(ptr, 0);
    }
    /**
     * @returns {PythonName[]}
     */
    get imported_names() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_analysisresult_imported_names(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {PythonName[]} arg0
     */
    set imported_names(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_analysisresult_imported_names(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {PythonFunction[]}
     */
    get defined_functions() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_analysisresult_defined_functions(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {PythonFunction[]} arg0
     */
    set defined_functions(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_analysisresult_defined_functions(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {PythonConstant[]}
     */
    get defined_constants() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_analysisresult_defined_constants(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {PythonConstant[]} arg0
     */
    set defined_constants(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_analysisresult_defined_constants(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {CalledName[]}
     */
    get called_names() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_analysisresult_called_names(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {CalledName[]} arg0
     */
    set called_names(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_analysisresult_called_names(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {Uint32Array}
     */
    get ellipsis() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_analysisresult_ellipsis(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint32Array} arg0
     */
    set ellipsis(arg0) {
        const ptr0 = passArray32ToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_analysisresult_ellipsis(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {TextRange[]}
     */
    get import_ranges() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_analysisresult_import_ranges(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {TextRange[]} arg0
     */
    set import_ranges(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_analysisresult_import_ranges(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {ParseError[]}
     */
    get parse_errors() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_analysisresult_parse_errors(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {ParseError[]} arg0
     */
    set parse_errors(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_analysisresult_parse_errors(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) AnalysisResult.prototype[Symbol.dispose] = AnalysisResult.prototype.free;

export class CalledName {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CalledName.prototype);
        obj.__wbg_ptr = ptr;
        CalledNameFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof CalledName)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CalledNameFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_calledname_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_calledname_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_calledname_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get start() {
        const ret = wasm.__wbg_get_calledname_start(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set start(arg0) {
        wasm.__wbg_set_calledname_start(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) CalledName.prototype[Symbol.dispose] = CalledName.prototype.free;

export class Completion {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Completion.prototype);
        obj.__wbg_ptr = ptr;
        CompletionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CompletionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_completion_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_completion_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_completion_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {CompletionKind | undefined}
     */
    get kind() {
        const ret = wasm.__wbg_get_completion_kind(this.__wbg_ptr);
        return ret === 25 ? undefined : ret;
    }
    /**
     * @param {CompletionKind | null} [arg0]
     */
    set kind(arg0) {
        wasm.__wbg_set_completion_kind(this.__wbg_ptr, isLikeNone(arg0) ? 25 : arg0);
    }
    /**
     * @returns {string | undefined}
     */
    get insert_text() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_completion_insert_text(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | null} [arg0]
     */
    set insert_text(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_completion_insert_text(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {TextEdit[] | undefined}
     */
    get additional_text_edits() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_completion_additional_text_edits(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayJsValueFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 4, 4);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {TextEdit[] | null} [arg0]
     */
    set additional_text_edits(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_completion_additional_text_edits(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string | undefined}
     */
    get documentation() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_completion_documentation(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | null} [arg0]
     */
    set documentation(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_completion_documentation(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string | undefined}
     */
    get detail() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_completion_detail(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | null} [arg0]
     */
    set detail(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_completion_detail(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string | undefined}
     */
    get module_name() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_completion_module_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | null} [arg0]
     */
    set module_name(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_completion_module_name(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) Completion.prototype[Symbol.dispose] = Completion.prototype.free;

/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24}
 */
export const CompletionKind = Object.freeze({
    Text: 0, "0": "Text",
    Method: 1, "1": "Method",
    Function: 2, "2": "Function",
    Constructor: 3, "3": "Constructor",
    Field: 4, "4": "Field",
    Variable: 5, "5": "Variable",
    Class: 6, "6": "Class",
    Interface: 7, "7": "Interface",
    Module: 8, "8": "Module",
    Property: 9, "9": "Property",
    Unit: 10, "10": "Unit",
    Value: 11, "11": "Value",
    Enum: 12, "12": "Enum",
    Keyword: 13, "13": "Keyword",
    Snippet: 14, "14": "Snippet",
    Color: 15, "15": "Color",
    File: 16, "16": "File",
    Reference: 17, "17": "Reference",
    Folder: 18, "18": "Folder",
    EnumMember: 19, "19": "EnumMember",
    Constant: 20, "20": "Constant",
    Struct: 21, "21": "Struct",
    Event: 22, "22": "Event",
    Operator: 23, "23": "Operator",
    TypeParameter: 24, "24": "TypeParameter",
});

export class Diagnostic {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Diagnostic.prototype);
        obj.__wbg_ptr = ptr;
        DiagnosticFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DiagnosticFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_diagnostic_free(ptr, 0);
    }
    /**
     * @returns {TextRange | undefined}
     */
    textRange() {
        const ret = wasm.diagnostic_textRange(this.__wbg_ptr);
        return ret === 0 ? undefined : TextRange.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    id() {
        const ret = wasm.diagnostic_id(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {Workspace} workspace
     * @returns {string}
     */
    display(workspace) {
        _assertClass(workspace, Workspace);
        const ret = wasm.diagnostic_display(this.__wbg_ptr, workspace.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {string}
     */
    message() {
        const ret = wasm.diagnostic_message(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {Severity}
     */
    severity() {
        const ret = wasm.diagnostic_severity(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {Workspace} workspace
     * @returns {Range | undefined}
     */
    toRange(workspace) {
        _assertClass(workspace, Workspace);
        const ret = wasm.diagnostic_toRange(this.__wbg_ptr, workspace.__wbg_ptr);
        return ret === 0 ? undefined : Range.__wrap(ret);
    }
}
if (Symbol.dispose) Diagnostic.prototype[Symbol.dispose] = Diagnostic.prototype.free;

export class DocumentHighlight {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DocumentHighlight.prototype);
        obj.__wbg_ptr = ptr;
        DocumentHighlightFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DocumentHighlightFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_documenthighlight_free(ptr, 0);
    }
    /**
     * @returns {Range}
     */
    get range() {
        const ret = wasm.__wbg_get_documenthighlight_range(this.__wbg_ptr);
        return Range.__wrap(ret);
    }
    /**
     * @returns {DocumentHighlightKind}
     */
    get kind() {
        const ret = wasm.__wbg_get_documenthighlight_kind(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) DocumentHighlight.prototype[Symbol.dispose] = DocumentHighlight.prototype.free;

/**
 * @enum {1 | 2 | 3}
 */
export const DocumentHighlightKind = Object.freeze({
    Text: 1, "1": "Text",
    Read: 2, "2": "Read",
    Write: 3, "3": "Write",
});

export class FileHandle {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FileHandle.prototype);
        obj.__wbg_ptr = ptr;
        FileHandleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    toJSON() {
        return {
        };
    }
    toString() {
        return JSON.stringify(this);
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FileHandleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_filehandle_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.filehandle_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.filehandle_path(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) FileHandle.prototype[Symbol.dispose] = FileHandle.prototype.free;

export class Hover {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Hover.prototype);
        obj.__wbg_ptr = ptr;
        HoverFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HoverFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hover_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get markdown() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_hover_markdown(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set markdown(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_hover_markdown(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {Range}
     */
    get range() {
        const ret = wasm.__wbg_get_hover_range(this.__wbg_ptr);
        return Range.__wrap(ret);
    }
    /**
     * @param {Range} arg0
     */
    set range(arg0) {
        _assertClass(arg0, Range);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_hover_range(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) Hover.prototype[Symbol.dispose] = Hover.prototype.free;

export class InlayHint {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(InlayHint.prototype);
        obj.__wbg_ptr = ptr;
        InlayHintFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        InlayHintFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_inlayhint_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get markdown() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_inlayhint_markdown(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set markdown(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_inlayhint_markdown(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {Position}
     */
    get position() {
        const ret = wasm.__wbg_get_inlayhint_position(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
     * @param {Position} arg0
     */
    set position(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_inlayhint_position(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {InlayHintKind}
     */
    get kind() {
        const ret = wasm.__wbg_get_inlayhint_kind(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {InlayHintKind} arg0
     */
    set kind(arg0) {
        wasm.__wbg_set_inlayhint_kind(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) InlayHint.prototype[Symbol.dispose] = InlayHint.prototype.free;

/**
 * @enum {0 | 1}
 */
export const InlayHintKind = Object.freeze({
    Type: 0, "0": "Type",
    Parameter: 1, "1": "Parameter",
});

export class LocationLink {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(LocationLink.prototype);
        obj.__wbg_ptr = ptr;
        LocationLinkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LocationLinkFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_locationlink_free(ptr, 0);
    }
    /**
     * The target file path
     * @returns {string}
     */
    get path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_locationlink_path(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The target file path
     * @param {string} arg0
     */
    set path(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_locationlink_path(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The full range of the target
     * @returns {Range}
     */
    get full_range() {
        const ret = wasm.__wbg_get_locationlink_full_range(this.__wbg_ptr);
        return Range.__wrap(ret);
    }
    /**
     * The full range of the target
     * @param {Range} arg0
     */
    set full_range(arg0) {
        _assertClass(arg0, Range);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_locationlink_full_range(this.__wbg_ptr, ptr0);
    }
    /**
     * The target's range that should be selected/highlighted
     * @returns {Range | undefined}
     */
    get selection_range() {
        const ret = wasm.__wbg_get_locationlink_selection_range(this.__wbg_ptr);
        return ret === 0 ? undefined : Range.__wrap(ret);
    }
    /**
     * The target's range that should be selected/highlighted
     * @param {Range | null} [arg0]
     */
    set selection_range(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, Range);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_locationlink_selection_range(this.__wbg_ptr, ptr0);
    }
    /**
     * The range of the origin.
     * @returns {Range | undefined}
     */
    get origin_selection_range() {
        const ret = wasm.__wbg_get_locationlink_origin_selection_range(this.__wbg_ptr);
        return ret === 0 ? undefined : Range.__wrap(ret);
    }
    /**
     * The range of the origin.
     * @param {Range | null} [arg0]
     */
    set origin_selection_range(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, Range);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_locationlink_origin_selection_range(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) LocationLink.prototype[Symbol.dispose] = LocationLink.prototype.free;

export class ParameterInformation {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ParameterInformation.prototype);
        obj.__wbg_ptr = ptr;
        ParameterInformationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof ParameterInformation)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ParameterInformationFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_parameterinformation_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get label() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_parameterinformation_label(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set label(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_parameterinformation_label(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string | undefined}
     */
    get documentation() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_parameterinformation_documentation(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | null} [arg0]
     */
    set documentation(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_parameterinformation_documentation(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) ParameterInformation.prototype[Symbol.dispose] = ParameterInformation.prototype.free;

export class ParseError {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ParseError.prototype);
        obj.__wbg_ptr = ptr;
        ParseErrorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof ParseError)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ParseErrorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_parseerror_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get message() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_parseerror_message(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set message(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_parseerror_message(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {TextRange}
     */
    get location() {
        const ret = wasm.__wbg_get_parseerror_location(this.__wbg_ptr);
        return TextRange.__wrap(ret);
    }
    /**
     * @param {TextRange} arg0
     */
    set location(arg0) {
        _assertClass(arg0, TextRange);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_parseerror_location(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) ParseError.prototype[Symbol.dispose] = ParseError.prototype.free;

export class Position {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Position.prototype);
        obj.__wbg_ptr = ptr;
        PositionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PositionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_position_free(ptr, 0);
    }
    /**
     * One indexed line number
     * @returns {number}
     */
    get line() {
        const ret = wasm.__wbg_get_position_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * One indexed line number
     * @param {number} arg0
     */
    set line(arg0) {
        wasm.__wbg_set_position_line(this.__wbg_ptr, arg0);
    }
    /**
     * One indexed column number (the nth character on the line)
     * @returns {number}
     */
    get column() {
        const ret = wasm.__wbg_get_position_column(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * One indexed column number (the nth character on the line)
     * @param {number} arg0
     */
    set column(arg0) {
        wasm.__wbg_set_position_column(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} line
     * @param {number} column
     */
    constructor(line, column) {
        const ret = wasm.position_new(line, column);
        this.__wbg_ptr = ret >>> 0;
        PositionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) Position.prototype[Symbol.dispose] = Position.prototype.free;

/**
 * @enum {0 | 1 | 2}
 */
export const PositionEncoding = Object.freeze({
    Utf8: 0, "0": "Utf8",
    Utf16: 1, "1": "Utf16",
    Utf32: 2, "2": "Utf32",
});

export class PythonConstant {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PythonConstant.prototype);
        obj.__wbg_ptr = ptr;
        PythonConstantFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof PythonConstant)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PythonConstantFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pythonconstant_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonconstant_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonconstant_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get type_str() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonconstant_type_str(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set type_str(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonconstant_type_str(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get docstring() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonconstant_docstring(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set docstring(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonconstant_docstring(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) PythonConstant.prototype[Symbol.dispose] = PythonConstant.prototype.free;

export class PythonFunction {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PythonFunction.prototype);
        obj.__wbg_ptr = ptr;
        PythonFunctionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof PythonFunction)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PythonFunctionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pythonfunction_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonfunction_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonfunction_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {PythonFunctionArgument[]}
     */
    get args() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonfunction_args(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {PythonFunctionArgument[]} arg0
     */
    set args(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonfunction_args(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get return_type_str() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonfunction_return_type_str(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set return_type_str(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonfunction_return_type_str(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get docstring() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonfunction_docstring(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set docstring(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonfunction_docstring(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {boolean}
     */
    get explicit_return() {
        const ret = wasm.__wbg_get_pythonfunction_explicit_return(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set explicit_return(arg0) {
        wasm.__wbg_set_pythonfunction_explicit_return(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get side_effects() {
        const ret = wasm.__wbg_get_pythonfunction_side_effects(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set side_effects(arg0) {
        wasm.__wbg_set_pythonfunction_side_effects(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get start() {
        const ret = wasm.__wbg_get_pythonfunction_start(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set start(arg0) {
        wasm.__wbg_set_pythonfunction_start(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) PythonFunction.prototype[Symbol.dispose] = PythonFunction.prototype.free;

export class PythonFunctionArgument {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PythonFunctionArgument.prototype);
        obj.__wbg_ptr = ptr;
        PythonFunctionArgumentFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof PythonFunctionArgument)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PythonFunctionArgumentFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pythonfunctionargument_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonfunctionargument_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonfunctionargument_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get type_str() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonfunctionargument_type_str(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set type_str(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonfunctionargument_type_str(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string | undefined}
     */
    get default() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonfunctionargument_default(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | null} [arg0]
     */
    set default(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonfunctionargument_default(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {boolean}
     */
    get variable_length() {
        const ret = wasm.__wbg_get_pythonfunctionargument_variable_length(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set variable_length(arg0) {
        wasm.__wbg_set_pythonfunctionargument_variable_length(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) PythonFunctionArgument.prototype[Symbol.dispose] = PythonFunctionArgument.prototype.free;

export class PythonName {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PythonName.prototype);
        obj.__wbg_ptr = ptr;
        PythonNameFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof PythonName)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PythonNameFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pythonname_free(ptr, 0);
    }
    /**
     * @param {string} module
     * @param {string} name
     */
    constructor(module, name) {
        const ptr0 = passStringToWasm0(module, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.pythonname_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        PythonNameFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get module() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonname_module(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set module(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonname_module(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_pythonname_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_pythonname_name(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) PythonName.prototype[Symbol.dispose] = PythonName.prototype.free;

export class Range {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Range.prototype);
        obj.__wbg_ptr = ptr;
        RangeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RangeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_range_free(ptr, 0);
    }
    /**
     * @returns {Position}
     */
    get start() {
        const ret = wasm.__wbg_get_range_start(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
     * @param {Position} arg0
     */
    set start(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_range_start(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {Position}
     */
    get end() {
        const ret = wasm.__wbg_get_range_end(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
     * @param {Position} arg0
     */
    set end(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_range_end(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {Position} start
     * @param {Position} end
     */
    constructor(start, end) {
        _assertClass(start, Position);
        var ptr0 = start.__destroy_into_raw();
        _assertClass(end, Position);
        var ptr1 = end.__destroy_into_raw();
        const ret = wasm.range_new(ptr0, ptr1);
        this.__wbg_ptr = ret >>> 0;
        RangeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) Range.prototype[Symbol.dispose] = Range.prototype.free;

export class SemanticToken {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SemanticToken.prototype);
        obj.__wbg_ptr = ptr;
        SemanticTokenFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SemanticTokenFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_semantictoken_free(ptr, 0);
    }
    /**
     * @returns {string[]}
     */
    static kinds() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.semantictoken_kinds(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {string[]}
     */
    static modifiers() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.semantictoken_modifiers(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {SemanticTokenKind}
     */
    get kind() {
        const ret = wasm.__wbg_get_semantictoken_kind(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {SemanticTokenKind} arg0
     */
    set kind(arg0) {
        wasm.__wbg_set_semantictoken_kind(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get modifiers() {
        const ret = wasm.__wbg_get_semantictoken_modifiers(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set modifiers(arg0) {
        wasm.__wbg_set_semantictoken_modifiers(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {Range}
     */
    get range() {
        const ret = wasm.__wbg_get_semantictoken_range(this.__wbg_ptr);
        return Range.__wrap(ret);
    }
    /**
     * @param {Range} arg0
     */
    set range(arg0) {
        _assertClass(arg0, Range);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_semantictoken_range(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) SemanticToken.prototype[Symbol.dispose] = SemanticToken.prototype.free;

/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14}
 */
export const SemanticTokenKind = Object.freeze({
    Namespace: 0, "0": "Namespace",
    Class: 1, "1": "Class",
    Parameter: 2, "2": "Parameter",
    SelfParameter: 3, "3": "SelfParameter",
    ClsParameter: 4, "4": "ClsParameter",
    Variable: 5, "5": "Variable",
    Property: 6, "6": "Property",
    Function: 7, "7": "Function",
    Method: 8, "8": "Method",
    Keyword: 9, "9": "Keyword",
    String: 10, "10": "String",
    Number: 11, "11": "Number",
    Decorator: 12, "12": "Decorator",
    BuiltinConstant: 13, "13": "BuiltinConstant",
    TypeParameter: 14, "14": "TypeParameter",
});

/**
 * @enum {0 | 1 | 2 | 3}
 */
export const Severity = Object.freeze({
    Info: 0, "0": "Info",
    Warning: 1, "1": "Warning",
    Error: 2, "2": "Error",
    Fatal: 3, "3": "Fatal",
});

export class SignatureHelp {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SignatureHelp.prototype);
        obj.__wbg_ptr = ptr;
        SignatureHelpFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SignatureHelpFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signaturehelp_free(ptr, 0);
    }
    /**
     * @returns {SignatureInformation[]}
     */
    get signatures() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_signaturehelp_signatures(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {SignatureInformation[]} arg0
     */
    set signatures(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_signaturehelp_signatures(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number | undefined}
     */
    get active_signature() {
        const ret = wasm.__wbg_get_signaturehelp_active_signature(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set active_signature(arg0) {
        wasm.__wbg_set_signaturehelp_active_signature(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >>> 0);
    }
}
if (Symbol.dispose) SignatureHelp.prototype[Symbol.dispose] = SignatureHelp.prototype.free;

export class SignatureInformation {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SignatureInformation.prototype);
        obj.__wbg_ptr = ptr;
        SignatureInformationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof SignatureInformation)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SignatureInformationFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signatureinformation_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get label() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_signatureinformation_label(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set label(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_signatureinformation_label(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string | undefined}
     */
    get documentation() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_signatureinformation_documentation(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | null} [arg0]
     */
    set documentation(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_signatureinformation_documentation(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {ParameterInformation[]}
     */
    get parameters() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_signatureinformation_parameters(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {ParameterInformation[]} arg0
     */
    set parameters(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_signatureinformation_parameters(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number | undefined}
     */
    get active_parameter() {
        const ret = wasm.__wbg_get_signatureinformation_active_parameter(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set active_parameter(arg0) {
        wasm.__wbg_set_signatureinformation_active_parameter(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >>> 0);
    }
}
if (Symbol.dispose) SignatureInformation.prototype[Symbol.dispose] = SignatureInformation.prototype.free;

export class TextEdit {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TextEdit.prototype);
        obj.__wbg_ptr = ptr;
        TextEditFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof TextEdit)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TextEditFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_textedit_free(ptr, 0);
    }
    /**
     * @returns {Range}
     */
    get range() {
        const ret = wasm.__wbg_get_textedit_range(this.__wbg_ptr);
        return Range.__wrap(ret);
    }
    /**
     * @param {Range} arg0
     */
    set range(arg0) {
        _assertClass(arg0, Range);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_textedit_range(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {string}
     */
    get new_text() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_textedit_new_text(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set new_text(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_textedit_new_text(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) TextEdit.prototype[Symbol.dispose] = TextEdit.prototype.free;

export class TextRange {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TextRange.prototype);
        obj.__wbg_ptr = ptr;
        TextRangeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof TextRange)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TextRangeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_textrange_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get start() {
        const ret = wasm.__wbg_get_textrange_start(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set start(arg0) {
        wasm.__wbg_set_textrange_start(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get end() {
        const ret = wasm.__wbg_get_textrange_end(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set end(arg0) {
        wasm.__wbg_set_textrange_end(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) TextRange.prototype[Symbol.dispose] = TextRange.prototype.free;

export class Workspace {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Workspace.prototype);
        obj.__wbg_ptr = ptr;
        WorkspaceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WorkspaceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_workspace_free(ptr, 0);
    }
    /**
     * Checks a single file.
     * @param {FileHandle} file_id
     * @returns {Diagnostic[]}
     */
    checkFile(file_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            wasm.workspace_checkFile(retptr, this.__wbg_ptr, file_id.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     */
    closeFile(file_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            var ptr0 = file_id.__destroy_into_raw();
            wasm.workspace_closeFile(retptr, this.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Position} position
     * @returns {Completion[]}
     */
    completions(file_id, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(position, Position);
            var ptr0 = position.__destroy_into_raw();
            wasm.workspace_completions(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Range} range
     * @returns {InlayHint[]}
     */
    inlayHints(file_id, range) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(range, Range);
            var ptr0 = range.__destroy_into_raw();
            wasm.workspace_inlayHints(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @returns {string}
     */
    sourceText(file_id) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            wasm.workspace_sourceText(retptr, this.__wbg_ptr, file_id.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {string} contents
     */
    updateFile(file_id, contents) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            const ptr0 = passStringToWasm0(contents, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.workspace_updateFile(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Position} position
     * @returns {SignatureHelp | undefined}
     */
    signatureHelp(file_id, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(position, Position);
            var ptr0 = position.__destroy_into_raw();
            wasm.workspace_signatureHelp(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 === 0 ? undefined : SignatureHelp.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {any} options
     */
    updateOptions(options) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.workspace_updateOptions(retptr, this.__wbg_ptr, addHeapObject(options));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Position} position
     * @returns {LocationLink[]}
     */
    gotoDefinition(file_id, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(position, Position);
            var ptr0 = position.__destroy_into_raw();
            wasm.workspace_gotoDefinition(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Position} position
     * @returns {LocationLink[]}
     */
    gotoReferences(file_id, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(position, Position);
            var ptr0 = position.__destroy_into_raw();
            wasm.workspace_gotoReferences(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @returns {SemanticToken[]}
     */
    semanticTokens(file_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            wasm.workspace_semanticTokens(retptr, this.__wbg_ptr, file_id.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Position} position
     * @returns {LocationLink[]}
     */
    gotoDeclaration(file_id, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(position, Position);
            var ptr0 = position.__destroy_into_raw();
            wasm.workspace_gotoDeclaration(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Gets a file handle for a vendored file by its path.
     * This allows vendored files to participate in LSP features like hover, completions, etc.
     * @param {string} path
     * @returns {FileHandle}
     */
    getVendoredFile(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.workspace_getVendoredFile(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return FileHandle.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Position} position
     * @returns {DocumentHighlight[]}
     */
    documentHighlights(file_id, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(position, Position);
            var ptr0 = position.__destroy_into_raw();
            wasm.workspace_documentHighlights(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Position} position
     * @returns {LocationLink[]}
     */
    gotoTypeDefinition(file_id, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(position, Position);
            var ptr0 = position.__destroy_into_raw();
            wasm.workspace_gotoTypeDefinition(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Range} range
     * @returns {SemanticToken[]}
     */
    semanticTokensInRange(file_id, range) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(range, Range);
            var ptr0 = range.__destroy_into_raw();
            wasm.workspace_semanticTokensInRange(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} root
     * @param {PositionEncoding} position_encoding
     * @param {any} options
     */
    constructor(root, position_encoding, options) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(root, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.workspace_new(retptr, ptr0, len0, position_encoding, addHeapObject(options));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            WorkspaceFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Checks all open files
     * @returns {Diagnostic[]}
     */
    check() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.workspace_check(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @param {Position} position
     * @returns {Hover | undefined}
     */
    hover(file_id, position) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            _assertClass(position, Position);
            var ptr0 = position.__destroy_into_raw();
            wasm.workspace_hover(retptr, this.__wbg_ptr, file_id.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 === 0 ? undefined : Hover.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {FileHandle} file_id
     * @returns {string | undefined}
     */
    format(file_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            wasm.workspace_format(retptr, this.__wbg_ptr, file_id.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the parsed AST for `path`
     * @param {FileHandle} file_id
     * @returns {string}
     */
    parsed(file_id) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            wasm.workspace_parsed(retptr, this.__wbg_ptr, file_id.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Returns the token stream for `path` serialized as a string.
     * @param {FileHandle} file_id
     * @returns {string}
     */
    tokens(file_id) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(file_id, FileHandle);
            wasm.workspace_tokens(retptr, this.__wbg_ptr, file_id.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {string} path
     * @param {string} contents
     * @returns {FileHandle}
     */
    openFile(path, contents) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(contents, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            wasm.workspace_openFile(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return FileHandle.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) Workspace.prototype[Symbol.dispose] = Workspace.prototype.free;

/**
 * @param {Workspace} workspace
 * @param {FileHandle} file_id
 * @returns {AnalysisResult}
 */
export function analyzeFile(workspace, file_id) {
    _assertClass(workspace, Workspace);
    _assertClass(file_id, FileHandle);
    const ret = wasm.analyzeFile(workspace.__wbg_ptr, file_id.__wbg_ptr);
    return AnalysisResult.__wrap(ret);
}

/**
 * Importantly, this does not cache any state (e.g., the parsed AST) between calls.
 * @param {string} source
 * @returns {PythonName[]}
 */
export function findImportedNames(source) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(source, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.findImportedNames(retptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_export4(r0, r1 * 4, 4);
        return v2;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * @returns {Workspace}
 */
export function initWorkspace() {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.initWorkspace(retptr);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return Workspace.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

export function __wbg_Error_52673b7de5a0ca89(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_Number_2d1dcfcf4ec51736(arg0) {
    const ret = Number(getObject(arg0));
    return ret;
};

export function __wbg_String_8f0eb39a4a4c2f66(arg0, arg1) {
    const ret = String(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg___wbindgen_bigint_get_as_i64_6e32f5e6aff02e1d(arg0, arg1) {
    const v = getObject(arg1);
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbg___wbindgen_boolean_get_dea25b33882b895b(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? v : undefined;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
};

export function __wbg___wbindgen_debug_string_adfb662ae34724b6(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg___wbindgen_in_0d3e1e8f0c669317(arg0, arg1) {
    const ret = getObject(arg0) in getObject(arg1);
    return ret;
};

export function __wbg___wbindgen_is_bigint_0e1a2e3f55cfae27(arg0) {
    const ret = typeof(getObject(arg0)) === 'bigint';
    return ret;
};

export function __wbg___wbindgen_is_function_8d400b8b1af978cd(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbg___wbindgen_is_object_ce774f3490692386(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg___wbindgen_is_string_704ef9c8fc131030(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg___wbindgen_is_undefined_f6b95eab589e0269(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg___wbindgen_jsval_eq_b6101cc9cef1fe36(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};

export function __wbg___wbindgen_jsval_loose_eq_766057600fdd1b0d(arg0, arg1) {
    const ret = getObject(arg0) == getObject(arg1);
    return ret;
};

export function __wbg___wbindgen_number_get_9619185a74197f95(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbg___wbindgen_string_get_a2a31e16edf96e42(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg___wbindgen_throw_dd24417ed36fc46e(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbg_call_abb4ff46ce38be40() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_calledname_new(arg0) {
    const ret = CalledName.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_calledname_unwrap(arg0) {
    const ret = CalledName.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_completion_new(arg0) {
    const ret = Completion.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_diagnostic_new(arg0) {
    const ret = Diagnostic.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_documenthighlight_new(arg0) {
    const ret = DocumentHighlight.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_done_62ea16af4ce34b24(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

export function __wbg_entries_83c79938054e065f(arg0) {
    const ret = Object.entries(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_get_6b7bd52aca3f9671(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_get_af9dab7e9603ea93() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_get_with_ref_key_1dc361bd10053bfe(arg0, arg1) {
    const ret = getObject(arg0)[getObject(arg1)];
    return addHeapObject(ret);
};

export function __wbg_inlayhint_new(arg0) {
    const ret = InlayHint.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_instanceof_ArrayBuffer_f3320d2419cd0355(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Map_084be8da74364158(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Map;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Uint8Array_da54ccc9d3e09434(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_isArray_51fd9e6422c0a395(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
};

export function __wbg_isSafeInteger_ae7d3f054d55fa16(arg0) {
    const ret = Number.isSafeInteger(getObject(arg0));
    return ret;
};

export function __wbg_iterator_27b7c8b35ab3e86b() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

export function __wbg_length_22ac23eaec9d8053(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_length_d45040a40c570362(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_locationlink_new(arg0) {
    const ret = LocationLink.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_new_6421f6084cc5bc5a(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_new_df1173567d5ff028(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_new_no_args_cb138f77cf6151ee(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_next_138a17bbf04e926c(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

export function __wbg_next_3cfe5c0fe2a4cc53() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_now_2c95c9de01293173(arg0) {
    const ret = getObject(arg0).now();
    return ret;
};

export function __wbg_now_69d776cd24f5215b() {
    const ret = Date.now();
    return ret;
};

export function __wbg_parameterinformation_new(arg0) {
    const ret = ParameterInformation.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_parameterinformation_unwrap(arg0) {
    const ret = ParameterInformation.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_parse_a09a54cf72639456() { return handleError(function (arg0, arg1) {
    const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_parseerror_new(arg0) {
    const ret = ParseError.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_parseerror_unwrap(arg0) {
    const ret = ParseError.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_performance_7a3ffd0b17f663ad(arg0) {
    const ret = getObject(arg0).performance;
    return addHeapObject(ret);
};

export function __wbg_prototypesetcall_dfe9b766cdc1f1fd(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
};

export function __wbg_pythonconstant_new(arg0) {
    const ret = PythonConstant.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_pythonconstant_unwrap(arg0) {
    const ret = PythonConstant.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_pythonfunction_new(arg0) {
    const ret = PythonFunction.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_pythonfunction_unwrap(arg0) {
    const ret = PythonFunction.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_pythonfunctionargument_new(arg0) {
    const ret = PythonFunctionArgument.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_pythonfunctionargument_unwrap(arg0) {
    const ret = PythonFunctionArgument.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_pythonname_new(arg0) {
    const ret = PythonName.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_pythonname_unwrap(arg0) {
    const ret = PythonName.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_semantictoken_new(arg0) {
    const ret = SemanticToken.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_signatureinformation_new(arg0) {
    const ret = SignatureInformation.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_signatureinformation_unwrap(arg0) {
    const ret = SignatureInformation.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_static_accessor_GLOBAL_769e6b65d6557335() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_static_accessor_SELF_08f5a74c69739274() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_static_accessor_WINDOW_a8924b26aa92d024() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_textedit_new(arg0) {
    const ret = TextEdit.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_textedit_unwrap(arg0) {
    const ret = TextEdit.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_textrange_new(arg0) {
    const ret = TextRange.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_textrange_unwrap(arg0) {
    const ret = TextRange.__unwrap(getObject(arg0));
    return ret;
};

export function __wbg_value_57b7b035e117f7ee(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

export function __wbindgen_cast_2241b6af4c4b2941(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_cast_4625c577ab2ec9ee(arg0) {
    // Cast intrinsic for `U64 -> Externref`.
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
};

export function __wbindgen_cast_9ae0607507abb057(arg0) {
    // Cast intrinsic for `I64 -> Externref`.
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};
