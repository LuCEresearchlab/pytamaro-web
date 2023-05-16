use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use rustpython_parser::parse_program;
use rustpython_parser::ast::{Visitor, StmtImportFrom};

#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

struct ImportedNamesCollector {
    names: Vec<(String, String)>,
}
impl Visitor for ImportedNamesCollector {
    fn visit_stmt_ImportFrom(&mut self, node: StmtImportFrom) {
        if let Some(module) = node.module {
            for alias in &node.names {
                self.names.push((module.to_string(), alias.name.to_string()));
            }
        }
    }
}
 
#[wasm_bindgen]
pub fn imported_names(python_source: &str) -> Result<JsValue, JsValue> {
    match parse_program(python_source, "cell") {
        Ok(stmts) => {
            let mut collector = ImportedNamesCollector { names: Vec::new() };
            for stmt in stmts {
                collector.visit_stmt(stmt);
            }
            return Ok(serde_wasm_bindgen::to_value(&collector.names)?)
        },
        Err(e) => {
            return Err(JsValue::from_str(&format!("{}", e)));
        }
    }
}