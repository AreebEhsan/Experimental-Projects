import type { Circuit, CircuitEdge, CircuitNode, NodeId, Port, Signal } from "./types";

const toPortKey = (nodeId: string, portId: string): string => `${nodeId}:${portId}`;

interface PortLookup {
  inputPortsByKey: Map<string, Port>;
  outputPortsByKey: Map<string, Port>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  incomingByPort: Map<string, CircuitEdge>;
  outgoingByPort: Map<string, CircuitEdge[]>;
  nodeById: Map<NodeId, CircuitNode>;
}

function buildPortLookup(nodes: Record<string, CircuitNode>): PortLookup {
  const inputPortsByKey = new Map<string, Port>();
  const outputPortsByKey = new Map<string, Port>();

  Object.values(nodes).forEach((node) => {
    node.inputPorts.forEach((port) =>
      inputPortsByKey.set(toPortKey(node.id, port.id), port),
    );
    node.outputPorts.forEach((port) =>
      outputPortsByKey.set(toPortKey(node.id, port.id), port),
    );
  });

  return { inputPortsByKey, outputPortsByKey };
}

export function validateCircuit(circuit: Circuit): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const incomingByPort = new Map<string, CircuitEdge>();
  const outgoingByPort = new Map<string, CircuitEdge[]>();
  const nodeById = new Map(Object.values(circuit.nodes).map((node) => [node.id, node]));
  const { inputPortsByKey, outputPortsByKey } = buildPortLookup(circuit.nodes);

  Object.values(circuit.edges).forEach((edge) => {
    const fromNode = nodeById.get(edge.from.nodeId);
    const toNode = nodeById.get(edge.to.nodeId);
    if (!fromNode || !toNode) {
      errors.push(`Edge ${edge.id} references a missing node.`);
      return;
    }

    const fromPortKey = toPortKey(edge.from.nodeId, edge.from.portId);
    const toPortKeyValue = toPortKey(edge.to.nodeId, edge.to.portId);

    if (!outputPortsByKey.has(fromPortKey)) {
      errors.push(`Edge ${edge.id} source must connect from an output port.`);
      return;
    }

    if (!inputPortsByKey.has(toPortKeyValue)) {
      errors.push(`Edge ${edge.id} target must connect to an input port.`);
      return;
    }

    if (incomingByPort.has(toPortKeyValue)) {
      errors.push(
        `Input port ${toNode.label}.${edge.to.portId} has more than one incoming wire.`,
      );
      return;
    }

    incomingByPort.set(toPortKeyValue, edge);
    const existing = outgoingByPort.get(fromPortKey) ?? [];
    existing.push(edge);
    outgoingByPort.set(fromPortKey, existing);
  });

  Object.values(circuit.nodes).forEach((node) => {
    if (node.kind === "NAND" || node.kind === "OUTPUT" || node.kind === "COMPOSITE") {
      node.inputPorts.forEach((port) => {
        const key = toPortKey(node.id, port.id);
        if (!incomingByPort.has(key)) {
          warnings.push(`Port ${node.label}.${port.name} is disconnected.`);
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    incomingByPort,
    outgoingByPort,
    nodeById,
  };
}

export function getInputSignalForPort(
  nodeId: string,
  portId: string,
  incomingByPort: Map<string, CircuitEdge>,
  outputSignalsByPort: Map<string, Signal>,
): Signal {
  const edge = incomingByPort.get(toPortKey(nodeId, portId));
  if (!edge) {
    return null;
  }
  return outputSignalsByPort.get(toPortKey(edge.from.nodeId, edge.from.portId)) ?? null;
}

export function buildDependencyMap(circuit: Circuit): Map<NodeId, Set<NodeId>> {
  const depsByNode = new Map<NodeId, Set<NodeId>>();
  Object.values(circuit.nodes).forEach((node) => depsByNode.set(node.id, new Set()));

  Object.values(circuit.edges).forEach((edge) => {
    const deps = depsByNode.get(edge.to.nodeId);
    if (deps) {
      deps.add(edge.from.nodeId);
    }
  });

  return depsByNode;
}
