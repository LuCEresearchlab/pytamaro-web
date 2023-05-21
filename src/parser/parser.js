import * as wasm from "./parser_bg.wasm";
import { __wbg_set_wasm } from "./parser_bg.js";
__wbg_set_wasm(wasm);
export * from "./parser_bg.js";

wasm.__wbindgen_start();
