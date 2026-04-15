import type { Circuit, NodeId } from "@/domain/circuit/types";
import { buildDependencyMap } from "@/domain/circuit/validation";

export interface TopologicalResult {
  order: NodeId[];
  hasCycle: boolean;
}

export function topologicalSort(circuit: Circuit): TopologicalResult {
  const depsByNode = buildDependencyMap(circuit);
  const indegree = new Map<NodeId, number>();
  const dependentsByNode = new Map<NodeId, Set<NodeId>>();

  Object.keys(circuit.nodes).forEach((nodeId) => {
    indegree.set(nodeId, 0);
    dependentsByNode.set(nodeId, new Set());
  });

  depsByNode.forEach((deps, nodeId) => {
    indegree.set(nodeId, deps.size);
    deps.forEach((depId) => {
      const dependents = dependentsByNode.get(depId);
      if (dependents) {
        dependents.add(nodeId);
      }
    });
  });

  const queue: NodeId[] = [];
  indegree.forEach((value, nodeId) => {
    if (value === 0) {
      queue.push(nodeId);
    }
  });

  const order: NodeId[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId) {
      break;
    }
    order.push(nodeId);

    const dependents = dependentsByNode.get(nodeId) ?? new Set<NodeId>();
    dependents.forEach((dependentId) => {
      const next = (indegree.get(dependentId) ?? 0) - 1;
      indegree.set(dependentId, next);
      if (next === 0) {
        queue.push(dependentId);
      }
    });
  }

  return {
    order,
    hasCycle: order.length !== Object.keys(circuit.nodes).length,
  };
}
