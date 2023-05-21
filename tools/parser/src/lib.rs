use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use rustpython_parser::parse_program;
use rustpython_parser::ast::{Visitor, StmtImportFrom, Stmt};
use serde::{Deserialize, Serialize};

#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(typescript_custom_section)]
const TYPES: &'static str = r#"
export interface PythonName {
    module: string;
    name: string;
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
    fn visit_stmt_ImportFrom(&mut self, node: StmtImportFrom) {
        if let Some(module) = node.module {
            for alias in &node.names {
                self.names.push(PythonName { module: module.to_string(), name: alias.name.to_string() });
            }
        }
    }
}

pub fn parse_to_stmts(python_source: &str) -> Result<Vec<Stmt>, String> {
    match parse_program(python_source, "cell") {
        Ok(stmts) => {
            return Ok(stmts)
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