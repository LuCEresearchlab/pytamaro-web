use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use rustpython_parser::{Mode, parse as parser_parse};
use rustpython_parser::ast::{Visitor, Stmt, StmtImportFrom, StmtFunctionDef, Expr, ExprCall};
use serde::{Deserialize, Serialize};
pub fn start() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(typescript_custom_section)]
const TYPES: &'static str = r#"
export interface PythonName {
    module: string;
    name: string;
};
export interface PythonFunction {
    name: string;
    args: PythonFunctionArgument[];
    return_type_str: string;
};
export interface PythonFunctionArgument {
    name: string;
    type_str: string;
};
"#;

#[derive(Serialize, Deserialize)]
struct PythonName {
    module: String,
    name: String,
}

struct ImportedNamesCollector {
    names: Vec<PythonName>,
}
impl Visitor for ImportedNamesCollector {
    fn visit_stmt_import_from(&mut self, node: StmtImportFrom) {
        if let Some(module) = node.module {
            for alias in &node.names {
                self.names.push(PythonName { module: module.to_string(), name: alias.name.to_string() });
            }
        }
    }
}

#[derive(Serialize, Deserialize)]
struct PythonFunction {
    name: String,
    args: Vec<PythonFunctionArgument>,
    return_type_str: String,
}

#[derive(Serialize, Deserialize)]
struct PythonFunctionArgument {
    name: String,
    type_str: String,
}

fn get_type_str(optional_expr: Option<Box<Expr>>) -> String {
    optional_expr.map_or(String::new(), |expr| expr.to_string())
}

struct FunctionDefinitionsCollector {
    functions: Vec<PythonFunction>,
}
impl Visitor for FunctionDefinitionsCollector {
    fn visit_stmt_function_def(&mut self, node: StmtFunctionDef) {
        self.functions.push(PythonFunction {
            name: node.name.to_string(),
            args: node.args.args.iter().map(|arg| PythonFunctionArgument {
                name: arg.def.arg.to_string(),
                type_str: get_type_str(arg.def.annotation.clone())
            }).collect(),
            return_type_str: get_type_str(node.returns.clone()),
        });
    }
}

struct CalledNamesCollector {
    names: Vec<String>,
}
impl Visitor for CalledNamesCollector {
    fn visit_expr_call(&mut self, node: ExprCall) {
        if let Expr::Name(name) = *node.func {
            self.names.push(name.id.to_string());
        }
    }
}

pub fn parse_to_stmts(python_source: &str) -> Result<Vec<Stmt>, String> {
    match parser_parse(python_source, Mode::Module, "cell") {
        Ok(m) => {
            return Ok(m.expect_module().body)
        },
        Err(e) => {
            return Err(format!("{}", e));
        }
    }
}

#[wasm_bindgen]
pub fn parse(python_source: &str) -> Result<JsValue, JsValue> {
    match parse_to_stmts(python_source) {
        Ok(_stmts) => {
            return Ok(serde_wasm_bindgen::to_value(&true)?)
        },
        Err(e) => {
            return Err(JsValue::from_str(e.to_string().as_str()));
        }
    }
}
 
#[wasm_bindgen]
pub fn imported_names(python_source: &str) -> Result<JsValue, JsValue> {
    match parse_to_stmts(python_source) {
        Ok(stmts) => {
            let mut collector = ImportedNamesCollector { names: Vec::new() };
            for stmt in stmts {
                collector.visit_stmt(stmt);
            }
            return Ok(serde_wasm_bindgen::to_value(&collector.names)?)
        },
        Err(e) => {
            return Err(JsValue::from_str(e.to_string().as_str()));
        }
    }
}

#[wasm_bindgen]
pub fn defined_functions(python_source: &str) -> Result<JsValue, JsValue> {
    match parse_to_stmts(python_source) {
        Ok(stmts) => {
            let mut collector = FunctionDefinitionsCollector {
                functions: Vec::new(),
            };
            for stmt in stmts {
                collector.visit_stmt(stmt);
            }
            return Ok(serde_wasm_bindgen::to_value(&collector.functions)?)
        },
        Err(e) => {
            return Err(JsValue::from_str(e.to_string().as_str()));
        }
    }
}

#[wasm_bindgen]
pub fn called_names(python_source: &str) -> Result<JsValue, JsValue> {
    match parse_to_stmts(python_source) {
        Ok(stmts) => {
            let mut collector = CalledNamesCollector {
                names: Vec::new(),
            };
            for stmt in stmts {
                collector.visit_stmt(stmt);
            }
            return Ok(serde_wasm_bindgen::to_value(&collector.names)?)
        },
        Err(e) => {
            return Err(JsValue::from_str(e.to_string().as_str()));
        }
    }
}