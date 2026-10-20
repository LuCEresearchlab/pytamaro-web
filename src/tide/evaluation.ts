import {
  ConstantDefinitionNode,
  TamaroCardNode,
  TideNode,
  TideNodeMetadata,
} from '../../components/tide/cards';
import { TamaroCard } from './language/cards';
import { ImportedDefinition, LocalDefinition } from './language/definitions';
import { getNode } from './utils';

import { Edge } from '@xyflow/react';
import { getParameterName } from '../../components/tide/cards/function';
import {
  ExecutionResponse as ExecutorExecutionResponse,
  PythonMode,
} from '../execution/codeExecution';
import { ExecutionMetadata } from '../execution/messageTypes';
import { ToolboxFunction } from '../localStorage/schema';
import { PythonFile } from '../schemas/activitySchema';
import { JudiciousConstant, JudiciousFunction } from '../schemas/documentation';
import {
  TideJudiciousMetadata,
  toTideConstant,
  toTideFunction,
} from './judiciours_to_tide';
import { ProgramState } from './language/phases';
import code_created_phase from './language/phases/code_created';
import code_element_phase from './language/phases/code_element';
import evaluated_phase from './language/phases/evaluation';
import name_checked_phase from './language/phases/name';
import syntax_checked_phase from './language/phases/syntax';
import type_checked_phase from './language/phases/type';

function nodeToExpression(
  v: TamaroCardNode,
): TamaroCard<TideNodeMetadata, 'unconstructed'> {
  return {
    kind:
      v.type === 'constant'
        ? 'constant_use'
        : v.type === 'function'
          ? 'function_use'
          : 'literal',
    metadata: { node_id: v.id },
  };
}

export function tide_unconstructed(
  imported_definitions: ImportedDefinition<TideJudiciousMetadata>[],
  nodes: TideNode[],
  edges: Edge[],
): ProgramState<
  TideNodeMetadata,
  TideNodeMetadata,
  TideJudiciousMetadata,
  'unconstructed'
> {
  const not_roots = new Set(edges.map((v) => v.source));
  const roots = nodes.filter((v) => !not_roots.has(v.id));

  const local = roots
    .filter((v) => v.type === 'constant_definition')
    .map((v) => v as ConstantDefinitionNode);

  const expressions = roots
    .filter((v) => v.type !== 'constant_definition')
    .map((v) => v as TamaroCardNode);

  return {
    imported_definitions,
    expressions: expressions.map(nodeToExpression),
    local_definitions: local.map((v) => ({
      kind: 'constant_definition',
      subkind: 'local',
      metadata: { node_id: v.id },
    })),
  };
}

function constructed_phase(
  nodes: TideNode[],
  edges: Edge[],
  {
    expressions,
    imported_definitions,
    local_definitions,
  }: ProgramState<
    TideNodeMetadata,
    TideNodeMetadata,
    TideJudiciousMetadata,
    'unconstructed'
  >,
): ProgramState<
  TideNodeMetadata,
  TideNodeMetadata,
  TideJudiciousMetadata,
  'constructed'
> {
  function construct_local_definitions(
    card: LocalDefinition<TideNodeMetadata, TideNodeMetadata, 'unconstructed'>,
  ): LocalDefinition<TideNodeMetadata, TideNodeMetadata, 'constructed'> {
    const node = getNode(nodes, card.metadata.node_id)!;
    const local_root = edges
      .filter((v) => v.target === node.id)
      .map((v) => getNode(nodes, v.source)! as TamaroCardNode)
      .map((v) => construct_expression(nodeToExpression(v)))
      .find(() => true);

    switch (card.kind) {
      case 'constant_definition':
        return {
          ...card,
          location: { module: false, name: node.data.input },
          root: local_root,
        };
      case 'function_definition': {
        throw new Error('Not supported yet');
      }
    }
  }

  function construct_imported_definitions(
    def: ImportedDefinition<TideJudiciousMetadata, 'unconstructed'>,
  ): ImportedDefinition<TideJudiciousMetadata, 'constructed'> {
    switch (def.kind) {
      case 'constant_definition': {
        return toTideConstant(
          def.metadata.judicious as JudiciousConstant,
          def.metadata.module,
        );
      }
      case 'function_definition': {
        return toTideFunction(
          def.metadata.judicious as JudiciousFunction,
          def.metadata.module,
        );
      }
    }
  }

  function construct_expression(
    card: TamaroCard<TideNodeMetadata, 'unconstructed'>,
  ): TamaroCard<TideNodeMetadata, 'constructed'> {
    const node = getNode(nodes, card.metadata.node_id)!;
    switch (card.kind) {
      case 'function_use': {
        return {
          ...card,
          function_name: node.data.input,
          module: node.data.module,
          children: new Map(
            edges
              .filter((v) => v.target === card.metadata.node_id)
              .map((v) => [
                getParameterName(v.targetHandle!)!,
                construct_expression(
                  nodeToExpression(getNode(nodes, v.source)! as TamaroCardNode),
                ),
              ]),
          ),
        };
      }
      case 'constant_use': {
        return {
          ...card,
          constant_name: node.data.input,
          module: node.data.module,
        };
      }
      case 'literal':
        return {
          ...card,
          input: node.data.input,
        };
    }
  }

  return {
    expressions: expressions.map(construct_expression),
    local_definitions: local_definitions.map(construct_local_definitions),
    imported_definitions: imported_definitions.map(
      construct_imported_definitions,
    ),
  };
}

export function construct(
  imported_definitions: ImportedDefinition<TideJudiciousMetadata>[],
  nodes: TideNode[],
  edges: Edge[],
) {
  const state = tide_unconstructed(imported_definitions, nodes, edges);
  return constructed_phase(nodes, edges, state);
}

export function synchronous_phases(
  state: ProgramState<
    TideNodeMetadata,
    TideNodeMetadata,
    TideJudiciousMetadata,
    'constructed'
  >,
): ProgramState<
  TideNodeMetadata,
  TideNodeMetadata,
  TideJudiciousMetadata,
  'code_created'
> {
  return code_created_phase(
    code_element_phase(
      type_checked_phase(name_checked_phase(syntax_checked_phase(state))),
    ),
  );
}

export function evaluation(
  execute: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    pythonMode: PythonMode,
  ) => Promise<ExecutorExecutionResponse>,
  state: ProgramState<
    TideNodeMetadata,
    TideNodeMetadata,
    TideJudiciousMetadata,
    'code_created'
  >,
): Promise<
  ProgramState<
    TideNodeMetadata,
    TideNodeMetadata,
    TideJudiciousMetadata,
    'evaluated'
  >
> {
  return evaluated_phase(execute, state);
}
