import type {
  Circuit,
  InputState,
  LogicBit,
  NodeId,
  Signal,
  SimulationSnapshot,
} from "@/domain/circuit/types";
import { getInputSignalForPort, validateCircuit } from "@/domain/circuit/validation";
import { topologicalSort } from "./topo-sort";

const toPortKey = (nodeId: string, portId: string): string => `${nodeId}:${portId}`;

function evaluateNand(a: Signal, b: Signal): Signal {
  if (a === null || b === null) {
    return null;
  }
  return a === 1 && b === 1 ? 0 : 1;
}

export function evaluateCircuit(circuit: Circuit, inputState: InputState): SimulationSnapshot {
  const validation = validateCircuit(circuit);
  const topo = topologicalSort(circuit);

  const errors = [...validation.errors];
  if (topo.hasCycle) {
    errors.push("Combinational loop detected. Cycles are not supported in MVP.");
  }

  const outputSignalsByPort = new Map<string, Signal>();
  const nodeOutputs: Record<NodeId, Signal[]> = {};

  topo.order.forEach((nodeId) => {
    const node = circuit.nodes[nodeId];
    if (!node) {
      return;
    }

    if (node.kind === "INPUT") {
      const value: LogicBit = inputState.byNodeId[node.id] ?? 0;
      nodeOutputs[node.id] = [value];
      outputSignalsByPort.set(toPortKey(node.id, "out"), value);
      return;
    }

    if (node.kind === "NAND") {
      const a = getInputSignalForPort(
        node.id,
        "a",
        validation.incomingByPort,
        outputSignalsByPort,
      );
      const b = getInputSignalForPort(
        node.id,
        "b",
        validation.incomingByPort,
        outputSignalsByPort,
      );
      const out = evaluateNand(a, b);
      nodeOutputs[node.id] = [out];
      outputSignalsByPort.set(toPortKey(node.id, "out"), out);
      return;
    }

    if (node.kind === "OUTPUT") {
      const inSignal = getInputSignalForPort(
        node.id,
        "in",
        validation.incomingByPort,
        outputSignalsByPort,
      );
      nodeOutputs[node.id] = [inSignal];
      return;
    }

    const inputSignal = getInputSignalForPort(
      node.id,
      "in",
      validation.incomingByPort,
      outputSignalsByPort,
    );
    nodeOutputs[node.id] = [inputSignal];
    outputSignalsByPort.set(toPortKey(node.id, "out"), inputSignal);
  });

  const outputState = Object.values(circuit.nodes).reduce<Record<string, Signal>>(
    (acc, node) => {
      if (node.kind === "OUTPUT") {
        const current = nodeOutputs[node.id]?.[0] ?? null;
        acc[node.id] = current;
      }
      return acc;
    },
    {},
  );

  return {
    circuitId: circuit.id,
    inputState,
    outputState: { byNodeId: outputState },
    nodeOutputs,
    isValid: errors.length === 0,
    errors,
    warnings: validation.warnings,
    topoOrder: topo.order,
  };
}
