import type { Edge, Node } from "reactflow";
import type { CanvasNodeData } from "./types";

export function initialNodes(): Node<CanvasNodeData>[] {
  return [
    {
      id: "in-a",
      type: "inputNode",
      position: { x: 80, y: 120 },
      data: { kind: "INPUT", label: "A" },
    },
    {
      id: "in-b",
      type: "inputNode",
      position: { x: 80, y: 260 },
      data: { kind: "INPUT", label: "B" },
    },
    {
      id: "nand-1",
      type: "nandNode",
      position: { x: 340, y: 180 },
      data: { kind: "NAND", label: "NAND" },
    },
    {
      id: "out-1",
      type: "outputNode",
      position: { x: 640, y: 200 },
      data: { kind: "OUTPUT", label: "Out" },
    },
  ];
}

export function initialEdges(): Edge[] {
  return [];
}
