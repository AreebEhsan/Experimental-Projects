"use client";

import { Position, Handle, type NodeProps } from "reactflow";
import type { CanvasNodeData } from "../types";
import { NodeShell } from "./node-shell";
import { useNandscapeStore } from "@/state/store";

const signalLabel = (value: number | null | undefined): string =>
  value === null || value === undefined ? "X" : String(value);

export function InputNode({ id, data }: NodeProps<CanvasNodeData>) {
  const value = useNandscapeStore((state) => state.inputValues[id] ?? 0);
  const toggleInput = useNandscapeStore((state) => state.toggleInput);

  return (
    <NodeShell
      title={data.label}
      subtitle="Input"
      signal={signalLabel(value)}
      accentClass="ring-1 ring-emerald-400/30"
    >
      <button
        type="button"
        onClick={() => toggleInput(id)}
        className="mt-3 w-full rounded-md border border-emerald-400/40 bg-emerald-500/10 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
      >
        Toggle
      </button>
      <Handle
        id="out"
        position={Position.Right}
        type="source"
        className="!h-2.5 !w-2.5 !border-2 !border-cyan-300 !bg-cyan-500"
      />
    </NodeShell>
  );
}
