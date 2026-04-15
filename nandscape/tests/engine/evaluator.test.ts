import { describe, expect, it } from "vitest";
import type { Circuit, InputState } from "@/domain/circuit/types";
import { createNodeDefinition } from "@/domain/circuit/factory";
import { evaluateCircuit } from "@/engine/sim/evaluator";

function nandToOutputCircuit(): Circuit {
  return {
    id: "c1",
    name: "nand",
    nodes: {
      a: createNodeDefinition("a", "INPUT", "A"),
      b: createNodeDefinition("b", "INPUT", "B"),
      n1: createNodeDefinition("n1", "NAND", "N1"),
      out: createNodeDefinition("out", "OUTPUT", "Out"),
    },
    edges: {
      e1: { id: "e1", from: { nodeId: "a", portId: "out" }, to: { nodeId: "n1", portId: "a" } },
      e2: { id: "e2", from: { nodeId: "b", portId: "out" }, to: { nodeId: "n1", portId: "b" } },
      e3: {
        id: "e3",
        from: { nodeId: "n1", portId: "out" },
        to: { nodeId: "out", portId: "in" },
      },
    },
  };
}

function evaluateOutput(circuit: Circuit, a: 0 | 1, b: 0 | 1): number | null {
  const inputState: InputState = { byNodeId: { a, b } };
  return evaluateCircuit(circuit, inputState).outputState.byNodeId.out;
}

function andFromNandCircuit(): Circuit {
  return {
    id: "c2",
    name: "and-from-nand",
    nodes: {
      a: createNodeDefinition("a", "INPUT", "A"),
      b: createNodeDefinition("b", "INPUT", "B"),
      n1: createNodeDefinition("n1", "NAND", "N1"),
      n2: createNodeDefinition("n2", "NAND", "N2"),
      out: createNodeDefinition("out", "OUTPUT", "Out"),
    },
    edges: {
      e1: { id: "e1", from: { nodeId: "a", portId: "out" }, to: { nodeId: "n1", portId: "a" } },
      e2: { id: "e2", from: { nodeId: "b", portId: "out" }, to: { nodeId: "n1", portId: "b" } },
      e3: {
        id: "e3",
        from: { nodeId: "n1", portId: "out" },
        to: { nodeId: "n2", portId: "a" },
      },
      e4: {
        id: "e4",
        from: { nodeId: "n1", portId: "out" },
        to: { nodeId: "n2", portId: "b" },
      },
      e5: {
        id: "e5",
        from: { nodeId: "n2", portId: "out" },
        to: { nodeId: "out", portId: "in" },
      },
    },
  };
}

describe("evaluateCircuit", () => {
  it("evaluates primitive NAND truth behavior", () => {
    const circuit = nandToOutputCircuit();
    expect(evaluateOutput(circuit, 0, 0)).toBe(1);
    expect(evaluateOutput(circuit, 0, 1)).toBe(1);
    expect(evaluateOutput(circuit, 1, 0)).toBe(1);
    expect(evaluateOutput(circuit, 1, 1)).toBe(0);
  });

  it("detects combinational loops", () => {
    const circuit = nandToOutputCircuit();
    circuit.edges.e4 = {
      id: "e4",
      from: { nodeId: "n1", portId: "out" },
      to: { nodeId: "n1", portId: "a" },
    };
    const snapshot = evaluateCircuit(circuit, { byNodeId: { a: 0, b: 1 } });
    expect(snapshot.isValid).toBe(false);
    expect(snapshot.errors.some((item) => item.includes("Combinational loop"))).toBe(true);
  });

  it("evaluates composed AND from NAND gates", () => {
    const circuit = andFromNandCircuit();
    expect(evaluateOutput(circuit, 0, 0)).toBe(0);
    expect(evaluateOutput(circuit, 0, 1)).toBe(0);
    expect(evaluateOutput(circuit, 1, 0)).toBe(0);
    expect(evaluateOutput(circuit, 1, 1)).toBe(1);
  });
});
