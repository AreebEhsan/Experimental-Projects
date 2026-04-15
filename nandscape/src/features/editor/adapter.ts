import { createNodeDefinition } from "@/domain/circuit/factory";
import type { Circuit } from "@/domain/circuit/types";
import type { CanvasNodeData } from "@/features/editor/types";
import type { Edge, Node } from "reactflow";

export function toCircuit(nodes: Node<CanvasNodeData>[], edges: Edge[]): Circuit {
  const circuitNodes = nodes.reduce<Circuit["nodes"]>((acc, node) => {
    acc[node.id] = createNodeDefinition(node.id, node.data.kind, node.data.label);
    return acc;
  }, {});

  const circuitEdges = edges.reduce<Circuit["edges"]>((acc, edge) => {
    if (!edge.source || !edge.target || !edge.sourceHandle || !edge.targetHandle) {
      return acc;
    }
    acc[edge.id] = {
      id: edge.id,
      from: {
        nodeId: edge.source,
        portId: edge.sourceHandle,
      },
      to: {
        nodeId: edge.target,
        portId: edge.targetHandle,
      },
    };
    return acc;
  }, {});

  return {
    id: "active",
    name: "NAND Circuit",
    nodes: circuitNodes,
    edges: circuitEdges,
  };
}
