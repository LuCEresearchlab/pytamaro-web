use std::vec;

use python_analyzer::{
    ParseError, PositionEncoding, PythonConstant, PythonFunction, PythonFunctionArgument,
    PythonName, TextRange, Workspace, analyze, install_pytamaro,
};
use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn test_no_parse_errors() {
    assert_eq!(analyze("pass").parse_errors.len(), 0);
}

#[wasm_bindgen_test]
fn test_imported_names() {
    assert_eq!(
        analyze("from mod import a, b\nfrom mod2 import c").imported_names,
        vec![
            PythonName {
                module: "mod".to_string(),
                name: "a".to_string(),
            },
            PythonName {
                module: "mod".to_string(),
                name: "b".to_string(),
            },
            PythonName {
                module: "mod2".to_string(),
                name: "c".to_string(),
            },
        ]
    );
}

#[wasm_bindgen_test]
fn test_defined_functions() {
    assert_eq!(
        analyze("def f(a: int)->list[int]:\n    \"\"\"Doc\"\"\"\n    pass\ndef g(a, b = 1, *c): return 0").defined_functions,
        vec![
            PythonFunction {
                name: "f".to_string(),
                args: vec![
                    PythonFunctionArgument {
                        name: "a".to_string(),
                        type_str: "int".to_string(),
                        default: None,
                        variable_length: false,
                    },
                ],
                return_type_str: "list[int]".to_string(),
                docstring: "Doc".to_string(),
                explicit_return: false,
            },
            PythonFunction {
                name: "g".to_string(),
                args: vec![
                    PythonFunctionArgument {
                        name: "a".to_string(),
                        type_str: "".to_string(),
                        default: None,
                        variable_length: false,
                    },
                    PythonFunctionArgument {
                        name: "b".to_string(),
                        type_str: "".to_string(),
                        default: Some("1".to_string()),
                        variable_length: false,
                    },
                    PythonFunctionArgument {
                        name: "c".to_string(),
                        type_str: "".to_string(),
                        default: None,
                        variable_length: true,
                    },
                ],
                return_type_str: "".to_string(),
                docstring: "".to_string(),
                explicit_return: true,
            },
        ]
    );
}

#[wasm_bindgen_test]
fn test_ellipsis() {
    assert_eq!(analyze("1 + ...").has_ellipsis, true);
}

#[wasm_bindgen_test]
fn test_called_names() {
    assert_eq!(
        analyze("f(g())").called_names,
        vec!["f".to_string(), "g".to_string()],
    );
}

#[wasm_bindgen_test]
fn test_called_names_inside_expr() {
    assert_eq!(
        analyze("f() + g()").called_names,
        vec!["f".to_string(), "g".to_string()],
    );
}

#[wasm_bindgen_test]
fn test_imported_names_with_parse_errors() {
    let result = analyze("from mod import a, b,\n\n1+");
    assert_eq!(
        result.imported_names,
        vec![
            PythonName {
                module: "mod".to_string(),
                name: "a".to_string(),
            },
            PythonName {
                module: "mod".to_string(),
                name: "b".to_string(),
            },
        ]
    );
    assert_eq!(
        result.parse_errors,
        vec![
            ParseError {
                message: "Trailing comma not allowed".to_string(),
                location: TextRange { start: 20, end: 21 },
            },
            ParseError {
                message: "Expected an expression".to_string(),
                location: TextRange { start: 25, end: 25 },
            },
        ]
    );
}

#[wasm_bindgen_test]
fn test_import_ranges() {
    let result = analyze("from mod import a, b\nfrom mod2 import c");
    assert_eq!(
        result.import_ranges,
        vec![
            TextRange { start: 0, end: 20 },
            TextRange { start: 21, end: 39 }
        ]
    );
}

#[wasm_bindgen_test]
fn test_defined_constants() {
    let result =
        analyze("foo = 42\nbar = 42 ** 42\n\"\"\"squared\"\"\"\npi: float = 3.14\n\'tau/2\'");
    assert_eq!(
        result.defined_constants,
        vec![
            PythonConstant {
                name: "foo".to_string(),
                type_str: "".to_string(),
                docstring: "".to_string(),
            },
            PythonConstant {
                name: "bar".to_string(),
                type_str: "".to_string(),
                docstring: "squared".to_string(),
            },
            PythonConstant {
                name: "pi".to_string(),
                type_str: "float".to_string(),
                docstring: "tau/2".to_string(),
            },
        ]
    );
}

#[wasm_bindgen_test]
fn test_check_type_error() {
    let mut workspace = Workspace::new(
        "/",
        PositionEncoding::Utf32,
        js_sys::JSON::parse("{}").unwrap(),
    )
    .unwrap();
    workspace.open_file("main.py", "1 + 'a'").unwrap();
    let result = workspace.check().unwrap();
    assert_eq!(result.len(), 1);
    let diagnostic = &result[0];
    assert_eq!(
        diagnostic.message(),
        "Operator `+` is unsupported between objects of type `Literal[1]` and `Literal[\"a\"]`"
    );
}

#[wasm_bindgen_test]
fn test_pytamaro_success_import() {
    let mut workspace = Workspace::new(
        "/",
        PositionEncoding::Utf32,
        js_sys::JSON::parse("{}").unwrap(),
    )
    .unwrap();
    install_pytamaro(&mut workspace).expect("PyTamaro to be installed");
    workspace
        .open_file(
            "main.py",
            "from pytamaro import rectangle, red, show_graphic",
        )
        .unwrap();
    let result = workspace.check().unwrap();
    assert_eq!(result.len(), 0);
}

#[wasm_bindgen_test]
fn test_pytamaro_submodule_success_import() {
    let mut workspace = Workspace::new(
        "/",
        PositionEncoding::Utf32,
        js_sys::JSON::parse("{}").unwrap(),
    )
    .unwrap();
    install_pytamaro(&mut workspace).expect("PyTamaro to be installed");
    workspace
        .open_file(
            "main.py",
            "from pytamaro.it import rettangolo, rosso, visualizza_grafica",
        )
        .unwrap();
    let result = workspace.check().unwrap();
    assert_eq!(result.len(), 0);
}

#[wasm_bindgen_test]
fn test_pytamaro_fail_import() {
    let mut workspace = Workspace::new(
        "/",
        PositionEncoding::Utf32,
        js_sys::JSON::parse("{}").unwrap(),
    )
    .unwrap();
    install_pytamaro(&mut workspace).expect("PyTamaro to be installed");
    workspace
        .open_file("main.py", "from pytamaro import _")
        .unwrap();
    let result = workspace.check().unwrap();
    assert_eq!(result.len(), 1);
    let diagnostic = &result[0];
    assert_eq!(diagnostic.message(), "Module `pytamaro` has no member `_`");
}

#[wasm_bindgen_test]
fn test_pytamaro_call_wrong_argument_type() {
    let mut workspace = Workspace::new(
        "/",
        PositionEncoding::Utf32,
        js_sys::JSON::parse("{}").unwrap(),
    )
    .unwrap();
    install_pytamaro(&mut workspace).expect("PyTamaro to be installed");
    workspace
        .open_file(
            "main.py",
            "from pytamaro import rectangle\nrectangle(100, 100, 'red')",
        )
        .unwrap();
    let result = workspace.check().unwrap();
    assert_eq!(result.len(), 1);
    let diagnostic = &result[0];
    assert_eq!(
        diagnostic.message(),
        "Argument to function `rectangle` is incorrect: Expected `Color`, found `Literal[\"red\"]`"
    );
}

#[wasm_bindgen_test]
fn test_pytamaro_call_wrong_argument_type_alias() {
    let mut workspace = Workspace::new(
        "/",
        PositionEncoding::Utf32,
        js_sys::JSON::parse("{}").unwrap(),
    )
    .unwrap();
    install_pytamaro(&mut workspace).expect("PyTamaro to be installed");
    workspace
        .open_file(
            "main.py",
            "from pytamaro.it import rettangolo\nrettangolo(100, 100, 'rosso')",
        )
        .unwrap();
    let result = workspace.check().unwrap();
    assert_eq!(result.len(), 1);
    let diagnostic = &result[0];
    assert_eq!(
        diagnostic.message(),
        // Ideally this would say "Expected `Colore`", but the type alias is resolved to the original name.
        "Argument to function `rettangolo` is incorrect: Expected `Color`, found `Literal[\"rosso\"]`"
    );
}
