"use client";

import { Position, Handle, type NodeProps } from "reactflow";
import type { CanvasNodeData } from "../types";
import { NodeShell } from "./node-shell";
import { useNandscapeStore } from "@/state/store";

const signalLabel = (value: number | null | undefined): string =>
  value === null || value === undefined ? "X" : String(value);

export function NandNode({ id, data }: NodeProps<CanvasNodeData>) {
  const signal = useNandscapeStore((state) => state.simulation?.nodeOutputs[id]?.[0] ?? null);

  return (
    <NodeShell
      title={data.label}
      subtitle="NAND"
      signal={signalLabel(signal)}
      accentClass="ring-1 ring-cyan-400/35"
    >
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">
        A,B -&gt; !(A.B)
      </p>
      <Handle
        id="a"
        position={Position.Left}
        type="target"
        style={{ top: 18 }}
        className="!h-2.5 !w-2.5 !border-2 !border-amber-300 !bg-amber-500"
      />
      <Handle
        id="b"
        position={Position.Left}
        type="target"
        style={{ top: 50 }}
        className="!h-2.5 !w-2.5 !border-2 !border-amber-300 !bg-amber-500"
      />
      <Handle
        id="out"
        position={Position.Right}
        type="source"
        className="!h-2.5 !w-2.5 !border-2 !border-cyan-300 !bg-cyan-500"
      />
    </NodeShell>
  );
}
