import type { CircuitNode, NodeKind, Port } from "./types";

function inputPort(id: string, name: string): Port {
  return { id, name, direction: "IN" };
}

function outputPort(id: string, name: string): Port {
  return { id, name, direction: "OUT" };
}

export function createNodeDefinition(
  id: string,
  kind: NodeKind,
  label: string,
): CircuitNode {
  if (kind === "INPUT") {
    return {
      id,
      kind,
      label,
      inputPorts: [],
      outputPorts: [outputPort("out", "Out")],
    };
  }

  if (kind === "OUTPUT") {
    return {
      id,
      kind,
      label,
      inputPorts: [inputPort("in", "In")],
      outputPorts: [],
    };
  }

  if (kind === "NAND") {
    return {
      id,
      kind,
      label,
      inputPorts: [inputPort("a", "A"), inputPort("b", "B")],
      outputPorts: [outputPort("out", "Out")],
    };
  }

  return {
    id,
    kind,
    label,
    inputPorts: [inputPort("in", "In")],
    outputPorts: [outputPort("out", "Out")],
  };
}
