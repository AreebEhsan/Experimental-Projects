import type { NodeKind, Signal } from "@/domain/circuit/types";

export interface CanvasNodeData {
  kind: NodeKind;
  label: string;
  signal?: Signal;
}
