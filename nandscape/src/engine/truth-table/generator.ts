import type {
  Circuit,
  InputState,
  LogicBit,
  NodeId,
  TruthTable,
  TruthTableRow,
} from "@/domain/circuit/types";
import { evaluateCircuit } from "@/engine/sim/evaluator";
import { canonicalizeSingleOutputTable } from "./canonical";

export interface TruthTableOptions {
  maxInputs?: number;
}

function buildReverseAdjacency(circuit: Circuit): Map<NodeId, NodeId[]> {
  const map = new Map<NodeId, NodeId[]>();
  Object.keys(circuit.nodes).forEach((id) => map.set(id, []));

  Object.values(circuit.edges).forEach((edge) => {
    const upstream = map.get(edge.to.nodeId) ?? [];
    upstream.push(edge.from.nodeId);
    map.set(edge.to.nodeId, upstream);
  });

  return map;
}

function collectDependencyCone(circuit: Circuit, targetNodeId: NodeId): Set<NodeId> {
  const reverseAdjacency = buildReverseAdjacency(circuit);
  const visited = new Set<NodeId>();
  const stack: NodeId[] = [targetNodeId];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current)) {
      continue;
    }
    visited.add(current);
    const upstream = reverseAdjacency.get(current) ?? [];
    upstream.forEach((nodeId) => {
      if (!visited.has(nodeId)) {
        stack.push(nodeId);
      }
    });
  }

  return visited;
}

function combinations(arity: number): LogicBit[][] {
  const total = 1 << arity;
  return Array.from({ length: total }, (_, row) =>
    Array.from({ length: arity }, (_, col) => ((row >> (arity - col - 1)) & 1) as LogicBit),
  );
}

export function generateTruthTableForOutput(
  circuit: Circuit,
  outputNodeId: NodeId,
  baseInputState: InputState,
  options: TruthTableOptions = {},
): { table?: TruthTable; error?: string } {
  const outputNode = circuit.nodes[outputNodeId];
  if (!outputNode || outputNode.kind !== "OUTPUT") {
    return { error: "Select an output node to generate a truth table." };
  }

  const cone = collectDependencyCone(circuit, outputNodeId);
  const inputNodes = Object.values(circuit.nodes)
    .filter((node) => cone.has(node.id) && node.kind === "INPUT")
    .sort((a, b) => a.label.localeCompare(b.label));

  const maxInputs = options.maxInputs ?? 8;
  if (inputNodes.length > maxInputs) {
    return {
      error: `Truth table input limit exceeded (${inputNodes.length}/${maxInputs}).`,
    };
  }

  const rows: TruthTableRow[] = [];
  const allCombinations = combinations(inputNodes.length);

  for (const combination of allCombinations) {
    const composedState: InputState = {
      byNodeId: { ...baseInputState.byNodeId },
    };

    inputNodes.forEach((node, index) => {
      composedState.byNodeId[node.id] = combination[index];
    });

    const snapshot = evaluateCircuit(circuit, composedState);
    if (!snapshot.isValid) {
      return {
        error: `Cannot generate table: ${snapshot.errors.join(" ")}`,
      };
    }

    const outputValue = snapshot.outputState.byNodeId[outputNodeId];
    if (outputValue === null || outputValue === undefined) {
      return { error: "Output is undefined for at least one row." };
    }

    rows.push({
      in: combination,
      out: [outputValue],
    });
  }

  const table: TruthTable = {
    inputNames: inputNodes.map((node) => node.label),
    outputNames: [outputNode.label],
    rows,
    canonicalSignature: "",
  };
  table.canonicalSignature = canonicalizeSingleOutputTable(table);
  return { table };
}
