export type NodeId = string;
export type PortId = string;
export type EdgeId = string;
export type CircuitId = string;

export type LogicBit = 0 | 1;
export type Signal = LogicBit | null;

export type NodeKind = "INPUT" | "OUTPUT" | "NAND" | "COMPOSITE";

export interface PortRef {
  nodeId: NodeId;
  portId: PortId;
}

export interface Port {
  id: PortId;
  name: string;
  direction: "IN" | "OUT";
}

export interface CircuitNode {
  id: NodeId;
  kind: NodeKind;
  label: string;
  inputPorts: Port[];
  outputPorts: Port[];
}

export interface CircuitEdge {
  id: EdgeId;
  from: PortRef;
  to: PortRef;
}

export interface Circuit {
  id: CircuitId;
  name: string;
  nodes: Record<NodeId, CircuitNode>;
  edges: Record<EdgeId, CircuitEdge>;
}

export interface InputState {
  byNodeId: Record<NodeId, LogicBit>;
}

export interface OutputState {
  byNodeId: Record<NodeId, Signal>;
}

export interface SimulationSnapshot {
  circuitId: CircuitId;
  inputState: InputState;
  outputState: OutputState;
  nodeOutputs: Record<NodeId, Signal[]>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  topoOrder: NodeId[];
}

export interface TruthTableRow {
  in: LogicBit[];
  out: LogicBit[];
}

export interface TruthTable {
  inputNames: string[];
  outputNames: string[];
  rows: TruthTableRow[];
  canonicalSignature: string;
}

export interface DiscoveryResult {
  id: string;
  status: "MATCH" | "NO_MATCH" | "INVALID_CANDIDATE";
  matchedGateId?: string;
  matchedName?: string;
  arity?: number;
  canonicalSignature?: string;
  diagnostics?: string[];
  discoveredAt: number;
}
