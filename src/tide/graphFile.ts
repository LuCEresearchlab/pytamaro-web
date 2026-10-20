'use client';
import { Edge } from '@xyflow/react';
import { TideNode } from '../../components/tide/cards';

export interface TideGraphFile {
  nodes: TideNode[];
  edges: Edge[];
}

/**
 * Serialize the graph to the format used by the import/export feature.
 */
export function serializeGraphFile(nodes: TideNode[], edges: Edge[]): string {
  return JSON.stringify({ nodes, edges });
}

/**
 * Parse the content of an imported file.
 * Returns undefined (instead of throwing) when the content is not a valid
 * TIDE graph file.
 */
export function parseGraphFile(content: string): TideGraphFile | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return undefined;
  }

  if (typeof parsed !== 'object' || parsed === null) return undefined;

  const { nodes, edges } = parsed as { nodes?: unknown; edges?: unknown };

  if (!Array.isArray(nodes) || !Array.isArray(edges)) return undefined;

  // Every node needs an id and a data object, every edge needs an id and
  // both of its endpoints, otherwise the graph cannot be displayed.
  const valid_nodes = nodes.every(
    (node) =>
      typeof node === 'object' &&
      node !== null &&
      typeof (node as TideNode).id === 'string' &&
      typeof (node as TideNode).data === 'object' &&
      (node as TideNode).data !== null,
  );
  if (!valid_nodes) return undefined;

  const valid_edges = edges.every(
    (edge) =>
      typeof edge === 'object' &&
      edge !== null &&
      typeof (edge as Edge).id === 'string' &&
      typeof (edge as Edge).source === 'string' &&
      typeof (edge as Edge).target === 'string',
  );
  if (!valid_edges) return undefined;

  return { nodes: nodes as TideNode[], edges: edges as Edge[] };
}
