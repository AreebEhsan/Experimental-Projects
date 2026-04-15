"use client";

import { Position, Handle, type NodeProps } from "reactflow";
import type { CanvasNodeData } from "../types";
import { NodeShell } from "./node-shell";
import { useNandscapeStore } from "@/state/store";

const signalLabel = (value: number | null | undefined): string =>
  value === null || value === undefined ? "X" : String(value);

export function OutputNode({ id, data }: NodeProps<CanvasNodeData>) {
  const signal = useNandscapeStore((state) => state.simulation?.outputState.byNodeId[id] ?? null);

  return (
    <NodeShell
      title={data.label}
      subtitle="Output"
      signal={signalLabel(signal)}
      accentClass="ring-1 ring-rose-400/30"
    >
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">Observe result</p>
      <Handle
        id="in"
        position={Position.Left}
        type="target"
        className="!h-2.5 !w-2.5 !border-2 !border-amber-300 !bg-amber-500"
      />
    </NodeShell>
  );
}
