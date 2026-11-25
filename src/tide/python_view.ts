import { Edge } from '@xyflow/react';
import {
  ConstantDefinitionNode,
  TamaroCardNode,
  TideNode,
} from '../../components/tide/cards';
import { TideJudiciousMetadata } from './judiciours_to_tide';
import { ImportedDefinition } from './language/definitions';
import { getConstantDefinition, getNode, getParameterName } from './utils';

export type PythonToken = {
  text: string;
  node_id?: string;
  missing?: boolean;
  /** Parameter name when this token stands for a missing argument. */
  parameter?: string;
};

export type PythonNode =
  | {
      kind: 'text';
      text: string;
      node_id: string;
      /** Import needed to use this name, when it is an imported definition. */
      import_reference?: { module: string; name: string };
      /** Root of the local definition this name refers to. */
      definition_id?: string;
    }
  | {
      kind: 'missing';
      node_id: string;
      /** Parameter name when the missing value is an argument. */
      parameter?: string;
    }
  | {
      kind: 'call';
      node_id: string;
      name: PythonNode;
      arguments: PythonNode[];
    }
  | {
      kind: 'definition';
      node_id: string;
      name: PythonNode;
      value: PythonNode;
    };

export type PythonLine = {
  kind: 'definition' | 'expression';
  tokens: PythonToken[];
  /** Card that is the root of this line. */
  root_id: string;
  node: PythonNode;
};

const present = (text?: string): text is string =>
  text !== undefined && text.length > 0;

type TextNodeReference = {
  import_reference?: { module: string; name: string };
  definition_id?: string;
};

function text_node(
  text: string,
  node_id: string,
  reference: TextNodeReference = {},
): PythonNode {
  return present(text)
    ? { kind: 'text', text, node_id, ...reference }
    : { kind: 'missing', node_id };
}

function missing_node(node_id: string, parameter?: string): PythonNode {
  return { kind: 'missing', node_id, parameter };
}

type ImportedDefinitions = ImportedDefinition<
  TideJudiciousMetadata,
  'evaluated'
>[];

function resolve_parameters(
  node: TamaroCardNode,
  imported_definitions: ImportedDefinitions,
): string[] {
  const tide_node = node.data.tide_node as unknown;

  if (tide_node !== null && typeof tide_node === 'object') {
    if ('parameters' in tide_node) {
      const parameters = (tide_node as { parameters?: { name: string }[] })
        .parameters;
      if (parameters !== undefined)
        return parameters.map((parameter) => parameter.name);
    }
  }

  const name =
    tide_node !== null &&
    typeof tide_node === 'object' &&
    'location' in tide_node
      ? (tide_node as { location: { name: string } }).location.name
      : node.data.input;
  const module_name = node.data.module;

  const definition = imported_definitions.find(
    (value) =>
      value.kind === 'function_definition' &&
      value.location.name === name &&
      (module_name === undefined || value.location.module === module_name),
  );

  return definition !== undefined && definition.kind === 'function_definition'
    ? definition.parameters.map((parameter) => parameter.name)
    : [];
}

function get_children(
  nodes: TideNode[],
  edges: Edge[],
  node_id: string,
): Map<string, TamaroCardNode> {
  const children = new Map<string, TamaroCardNode>();

  edges.forEach((edge) => {
    if (edge.target !== node_id) return;

    const child = getNode(nodes, edge.source);
    if (child === undefined || child.type === 'constant_definition') return;

    const parameter = getParameterName(edge.targetHandle ?? '');
    if (parameter === undefined) return;

    children.set(parameter, child);
  });

  return children;
}

function expression_tree(
  node: TamaroCardNode,
  nodes: TideNode[],
  edges: Edge[],
  imported_definitions: ImportedDefinitions,
  path: Set<string>,
): PythonNode {
  // The graph should be a tree, but malformed imports might contain cycles.
  if (path.has(node.id)) return missing_node(node.id);

  const next_path = new Set(path).add(node.id);

  switch (node.type) {
    case 'literal':
      return text_node(node.data.input, node.id);
    case 'constant': {
      const { input, module } = node.data;
      return present(module)
        ? text_node(input, node.id, {
            import_reference: { module, name: input },
          })
        : text_node(input, node.id, {
            definition_id: getConstantDefinition(nodes, input)?.id,
          });
    }
    case 'function': {
      const { input: name, module } = node.data;
      const children = get_children(nodes, edges, node.id);
      const parameters = resolve_parameters(node, imported_definitions);
      // Use the definition order when available, then append any other
      // connected cards (e.g. while the definition is still unavailable).
      const names = [
        ...parameters,
        ...Array.from(children.keys()).filter(
          (parameter) => !parameters.includes(parameter),
        ),
      ];

      return {
        kind: 'call',
        node_id: node.id,
        name: text_node(
          name,
          node.id,
          present(module) ? { import_reference: { module, name } } : {},
        ),
        arguments: names.map((parameter) => {
          const child = children.get(parameter);
          return child === undefined
            ? missing_node(node.id, parameter)
            : expression_tree(
                child,
                nodes,
                edges,
                imported_definitions,
                next_path,
              );
        }),
      };
    }
  }
}

/**
 * Newline, indented with two spaces per depth level (to save horizontal space).
 */
const newline = (depth: number): PythonToken => ({
  text: `\n${'  '.repeat(depth)}`,
});

/**
 * Pretty-prints the expression tree as the tokens shown in the panel.
 *
 * Calls whose arguments are all atomic are kept on a single line.
 */
function pretty_python_tokens(node: PythonNode, depth = 0): PythonToken[] {
  switch (node.kind) {
    case 'text':
      return [{ text: node.text, node_id: node.node_id }];
    case 'missing':
      return [
        {
          text: '...',
          node_id: node.node_id,
          missing: true,
          parameter: node.parameter,
        },
      ];
    case 'call': {
      const tokens: PythonToken[] = [
        ...pretty_python_tokens(node.name, depth),
        { text: '(', node_id: node.node_id },
      ];

      const has_non_atomic = node.arguments.some(
        (argument) => argument.kind !== 'text' && argument.kind !== 'missing',
      );

      if (has_non_atomic) {
        node.arguments.forEach((argument, index) => {
          if (index > 0) tokens.push({ text: ',', node_id: node.node_id });
          tokens.push(newline(depth + 1));
          tokens.push(...pretty_python_tokens(argument, depth + 1));
        });

        tokens.push(newline(depth));
      } else {
        node.arguments.forEach((argument, index) => {
          if (index > 0) {
            tokens.push({ text: ',', node_id: node.node_id });
            tokens.push({ text: ' ' });
          }
          tokens.push(...pretty_python_tokens(argument, depth));
        });
      }

      tokens.push({ text: ')', node_id: node.node_id });
      return tokens;
    }
    case 'definition':
      return [
        ...pretty_python_tokens(node.name, depth),
        { text: ' ' },
        { text: '=', node_id: node.node_id },
        { text: ' ' },
        ...pretty_python_tokens(node.value, depth),
      ];
  }
}

export function build_python_view(
  nodes: TideNode[],
  edges: Edge[],
  imported_definitions: ImportedDefinitions = [],
): PythonLine[] {
  const not_roots = new Set(edges.map((edge) => edge.source));
  const roots = nodes.filter((node) => !not_roots.has(node.id));

  const definitions = roots.filter(
    (node): node is ConstantDefinitionNode =>
      node.type === 'constant_definition',
  );
  const expressions = roots.filter(
    (node): node is TamaroCardNode => node.type !== 'constant_definition',
  );

  const lines: PythonLine[] = [];

  definitions.forEach((definition) => {
    const root = edges
      .filter((edge) => edge.target === definition.id)
      .map((edge) => getNode(nodes, edge.source))
      .find(
        (node): node is TamaroCardNode =>
          node !== undefined && node.type !== 'constant_definition',
      );

    const node: PythonNode = {
      kind: 'definition',
      node_id: definition.id,
      name: text_node(definition.data.input, definition.id),
      value:
        root === undefined
          ? missing_node(definition.id)
          : expression_tree(
              root,
              nodes,
              edges,
              imported_definitions,
              new Set(),
            ),
    };

    lines.push({
      tokens: pretty_python_tokens(node),
      root_id: definition.id,
      kind: 'definition',
      node,
    });
  });

  expressions.forEach((expression) => {
    const node = expression_tree(
      expression,
      nodes,
      edges,
      imported_definitions,
      new Set(),
    );

    lines.push({
      tokens: pretty_python_tokens(node),
      root_id: expression.id,
      kind: 'expression',
      node,
    });
  });

  return lines;
}

function walk(node: PythonNode, visit: (node: PythonNode) => void) {
  visit(node);

  switch (node.kind) {
    case 'call':
      walk(node.name, visit);
      node.arguments.forEach((argument) => walk(argument, visit));
      break;
    case 'definition':
      walk(node.name, visit);
      walk(node.value, visit);
      break;
    case 'text':
    case 'missing':
      break;
  }
}

/**
 * Builds the executable Python source for a single root, ready for the
 * evaluator.
 *
 * The local constant definitions used by the root are included transitively
 * and in dependency order. Imports are collected from the referenced
 * definitions, bundled by module, and separated from the code by an empty
 * line.
 */
export function build_python_source(
  lines: PythonLine[],
  root_id: string,
): string | undefined {
  const lines_by_root = new Map(lines.map((line) => [line.root_id, line]));
  const root = lines_by_root.get(root_id);
  if (root === undefined) return undefined;

  const ordered: PythonLine[] = [];
  const visited = new Set<string>();

  function collect(line: PythonLine) {
    if (visited.has(line.root_id)) return;
    visited.add(line.root_id);

    walk(line.node, (node) => {
      if (node.kind !== 'text' || node.definition_id === undefined) return;

      const definition = lines_by_root.get(node.definition_id);
      if (definition !== undefined) collect(definition);
    });

    ordered.push(line);
  }

  collect(root);

  const imports = new Map<string, string[]>();
  ordered.forEach((line) =>
    walk(line.node, (node) => {
      if (node.kind !== 'text' || node.import_reference === undefined) return;

      const { module, name } = node.import_reference;
      const names = imports.get(module) ?? [];
      if (!names.includes(name)) names.push(name);
      imports.set(module, names);
    }),
  );

  const import_lines = Array.from(imports.entries()).map(
    ([module, names]) => `from ${module} import ${names.join(', ')}`,
  );
  const code_lines = ordered.map((line) =>
    pretty_python_tokens(line.node)
      .map((token) => token.text)
      .join(''),
  );

  return [
    ...import_lines,
    ...(import_lines.length > 0 && code_lines.length > 0 ? [''] : []),
    ...code_lines,
  ].join('\n');
}
