import { describe, expect, it } from "vitest";
import type { Circuit, InputState } from "@/domain/circuit/types";
import { createNodeDefinition } from "@/domain/circuit/factory";
import { matchDiscovery } from "@/engine/discovery/matcher";
import { generateTruthTableForOutput } from "@/engine/truth-table/generator";

function xorFromNandCircuit(): Circuit {
  return {
    id: "xor",
    name: "xor-from-nand",
    nodes: {
      a: createNodeDefinition("a", "INPUT", "A"),
      b: createNodeDefinition("b", "INPUT", "B"),
      n1: createNodeDefinition("n1", "NAND", "N1"),
      n2: createNodeDefinition("n2", "NAND", "N2"),
      n3: createNodeDefinition("n3", "NAND", "N3"),
      n4: createNodeDefinition("n4", "NAND", "N4"),
      out: createNodeDefinition("out", "OUTPUT", "Out"),
    },
    edges: {
      e1: { id: "e1", from: { nodeId: "a", portId: "out" }, to: { nodeId: "n1", portId: "a" } },
      e2: { id: "e2", from: { nodeId: "b", portId: "out" }, to: { nodeId: "n1", portId: "b" } },
      e3: { id: "e3", from: { nodeId: "a", portId: "out" }, to: { nodeId: "n2", portId: "a" } },
      e4: {
        id: "e4",
        from: { nodeId: "n1", portId: "out" },
        to: { nodeId: "n2", portId: "b" },
      },
      e5: { id: "e5", from: { nodeId: "b", portId: "out" }, to: { nodeId: "n3", portId: "a" } },
      e6: {
        id: "e6",
        from: { nodeId: "n1", portId: "out" },
        to: { nodeId: "n3", portId: "b" },
      },
      e7: {
        id: "e7",
        from: { nodeId: "n2", portId: "out" },
        to: { nodeId: "n4", portId: "a" },
      },
      e8: {
        id: "e8",
        from: { nodeId: "n3", portId: "out" },
        to: { nodeId: "n4", portId: "b" },
      },
      e9: {
        id: "e9",
        from: { nodeId: "n4", portId: "out" },
        to: { nodeId: "out", portId: "in" },
      },
    },
  };
}

describe("discovery matching", () => {
  it("matches XOR for canonicalized two-input truth behavior", () => {
    const circuit = xorFromNandCircuit();
    const state: InputState = { byNodeId: { a: 0, b: 0 } };
    const result = generateTruthTableForOutput(circuit, "out", state);
    expect(result.error).toBeUndefined();
    expect(result.table?.canonicalSignature).toBe("2:0110");

    const match = matchDiscovery(result.table);
    expect(match.status).toBe("MATCH");
    expect(match.matchedName).toBe("XOR");
  });

  it("returns NO_MATCH when behavior is not in the catalog", () => {
    const passthrough: Circuit = {
      id: "passthrough",
      name: "passthrough",
      nodes: {
        a: createNodeDefinition("a", "INPUT", "A"),
        out: createNodeDefinition("out", "OUTPUT", "Out"),
      },
      edges: {
        e1: {
          id: "e1",
          from: { nodeId: "a", portId: "out" },
          to: { nodeId: "out", portId: "in" },
        },
      },
    };

    const result = generateTruthTableForOutput(passthrough, "out", {
      byNodeId: { a: 0 },
    });
    expect(result.error).toBeUndefined();
    const match = matchDiscovery(result.table);
    expect(match.status).toBe("NO_MATCH");
  });
});
