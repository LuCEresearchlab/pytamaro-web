import * as wasm from "./python_analyzer_bg.wasm";
export * from "./python_analyzer_bg.js";
import { __wbg_set_wasm } from "./python_analyzer_bg.js";
__wbg_set_wasm(wasm);