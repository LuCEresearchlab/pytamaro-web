use std::vec;

use python_analyzer::{
    analyze_file, find_imported_names, init_workspace, CalledName, ParseError, Position,
    PythonConstant, PythonFunction, PythonFunctionArgument, PythonName, Range, TextRange,
};
use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn test_find_imported_names() {
    let imported_names = find_imported_names("from mod import a, b\nfrom mod2 import c");
    assert_eq!(
        imported_names,
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

fn analyze(source: &str) -> python_analyzer::AnalysisResult {
    let mut workspace = init_workspace().expect("Workspace to be initialized");
    let file_handle = workspace
        .open_file("main.py", source)
        .expect("File to be created");
    analyze_file(&mut workspace, &file_handle)
}

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
                side_effects: false,
                start: 0,
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
                side_effects: false,
                start: 49,
            },
        ]
    );
}

#[wasm_bindgen_test]
fn test_defined_function_without_a_name_yet() {
    assert_eq!(analyze("def ").defined_functions, vec![]);
}

#[wasm_bindgen_test]
fn test_method_is_not_function() {
    assert_eq!(
        analyze("class A:\n    def f(self): pass").defined_functions,
        vec![]
    );
}

#[wasm_bindgen_test]
fn test_no_nested_functions() {
    assert_eq!(
        analyze("def f():\n    def g(): pass").defined_functions,
        vec![PythonFunction {
            name: "f".to_string(),
            args: vec![],
            return_type_str: "".to_string(),
            docstring: "".to_string(),
            explicit_return: false,
            side_effects: false,
            start: 0,
        }]
    );
}

#[wasm_bindgen_test]
fn test_ellipsis() {
    assert_eq!(analyze("1 + ...").ellipsis, vec![4]);
}

#[wasm_bindgen_test]
fn test_called_names() {
    assert_eq!(
        analyze("f(g())").called_names,
        vec![
            CalledName {
                name: "f".to_string(),
                start: 0
            },
            CalledName {
                name: "g".to_string(),
                start: 2
            }
        ],
    );
}

#[wasm_bindgen_test]
fn test_called_names_inside_expr() {
    assert_eq!(
        analyze("f() + g()").called_names,
        vec![
            CalledName {
                name: "f".to_string(),
                start: 0
            },
            CalledName {
                name: "g".to_string(),
                start: 6
            }
        ],
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
                location: Range {
                    start: Position {
                        line: 1,
                        column: 21
                    },
                    end: Position {
                        line: 1,
                        column: 22
                    }
                },
            },
            ParseError {
                message: "Expected an expression".to_string(),
                location: Range {
                    start: Position { line: 3, column: 3 },
                    end: Position { line: 3, column: 3 }
                },
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
    let mut workspace = init_workspace().expect("Workspace to be initialized");
    workspace.open_file("main.py", "1 + 'a'").unwrap();
    let result = workspace.check().unwrap();
    assert_eq!(result.len(), 1);
    let diagnostic = &result[0];
    assert_eq!(
        diagnostic.message(),
        "Operator `+` is not supported between objects of type `Literal[1]` and `Literal[\"a\"]`"
    );
}

#[wasm_bindgen_test]
fn test_pytamaro_success_import() {
    let mut workspace = init_workspace().expect("Workspace to be initialized");
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
    let mut workspace = init_workspace().expect("Workspace to be initialized");
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
    let mut workspace = init_workspace().expect("Workspace to be initialized");
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
    let mut workspace = init_workspace().expect("Workspace to be initialized");
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
    let mut workspace = init_workspace().expect("Workspace to be initialized");
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

#[wasm_bindgen_test]
fn test_possibly_unresolved_reference() {
    let mut workspace = init_workspace().expect("Workspace to be initialized");
    workspace
        .open_file(
            "main.py",
            "from random import randint\nif randint(0, 1) == 0: a = 1\na",
        )
        .unwrap();
    let result = workspace.check().unwrap();
    assert_eq!(result.len(), 1);
    let diagnostic = &result[0];
    assert_eq!(
        diagnostic.message(),
        "Name `a` used when possibly not defined"
    );
}

#[wasm_bindgen_test]
fn test_side_effects_builtins() {
    let result = analyze("def f(): print('Hello, World!')");
    let f = &result.defined_functions[0];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, true);
}

#[wasm_bindgen_test]
fn test_side_effects_propagate() {
    let result = analyze("def g(): print()\ndef f(): g()");
    let g = &result.defined_functions[0];
    assert_eq!(g.name, "g".to_string());
    assert_eq!(g.side_effects, true);
    let f = &result.defined_functions[1];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, true);
}

#[wasm_bindgen_test]
fn test_side_effects_random() {
    let result = analyze("from random import randint\ndef f(): return randint(0, 10)");
    let f = &result.defined_functions[0];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, true);
}

#[wasm_bindgen_test]
fn test_side_effects_pytamaro() {
    let result = analyze(
        "from pytamaro import show_graphic, empty_graphic\ndef f(): show_graphic(empty_graphic())",
    );
    let f = &result.defined_functions[0];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, true);
}

#[wasm_bindgen_test]
fn test_side_effects_global_assign() {
    let result = analyze(
        "
def f():
    global x
    x = 1
",
    );
    let f = &result.defined_functions[0];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, true);
}

#[wasm_bindgen_test]
fn test_side_effects_global_aug_assign() {
    let result = analyze(
        "
x = 0
def f():
    global x
    x += 1
",
    );
    let f = &result.defined_functions[0];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, true);
}

#[wasm_bindgen_test]
fn test_side_effects_global_ann_assign() {
    let result = analyze(
        "
def f():
    global x
    x: int = 1
",
    );
    let f = &result.defined_functions[0];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, true);
}

#[wasm_bindgen_test]
fn test_side_effects_global_no_use() {
    let result = analyze(
        "
def f():
    global x
    pass
",
    );
    let f = &result.defined_functions[0];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, false);
}

#[wasm_bindgen_test]
fn test_side_effects_global_outside_function() {
    let result = analyze(
        "
global x
",
    );
    assert_eq!(result.defined_functions.len(), 0);
}

#[wasm_bindgen_test]
fn test_side_effects_across_files() {
    let mut workspace = init_workspace().expect("Workspace to be initialized");
    workspace
        .open_file("a.py", "def g(): print('Hello from g!')")
        .expect("First file to be created");
    let file = workspace
        .open_file("b.py", "from a import g\ndef f(): g()")
        .expect("Second file to be created");
    let result = analyze_file(&mut workspace, &file);
    assert_eq!(result.defined_functions.len(), 1);
    let f = &result.defined_functions[0];
    assert_eq!(f.name, "f".to_string());
    assert_eq!(f.side_effects, true);
}

#[wasm_bindgen_test]
fn test_last_expr_range_empty() {
    let result = analyze("");
    assert_eq!(result.last_expr_range, None);
}

#[wasm_bindgen_test]
fn test_last_expr_range_single() {
    let result = analyze("1 + 2");
    assert_eq!(
        result.last_expr_range,
        Some(Range {
            start: Position { line: 1, column: 1 },
            end: Position { line: 1, column: 6 }
        })
    );
}

#[wasm_bindgen_test]
fn test_last_expr_range_utf16() {
    let result = analyze("var = 'perché'\nvar");
    assert_eq!(
        result.last_expr_range,
        Some(Range {
            start: Position { line: 2, column: 1 },
            end: Position { line: 2, column: 4 }
        })
    );
}
#[wasm_bindgen_test]
fn test_last_expr_range_multiple() {
    let result = analyze("1 + 2\n3 + 4");
    assert_eq!(
        result.last_expr_range,
        Some(Range {
            start: Position { line: 2, column: 1 },
            end: Position { line: 2, column: 6 }
        })
    );
}

#[wasm_bindgen_test]
fn test_last_expr_range_end_with_stmt() {
    let result = analyze("1 + 2\nx = 3");
    assert_eq!(result.last_expr_range, None);
}
