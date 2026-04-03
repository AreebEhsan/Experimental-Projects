"use client";

import { formatTime } from "@/lib/stats";

interface Solve {
  id: string;
  rawTime: number;
  time: number | null;
  scramble: string;
  penalty: "PLUS_TWO" | "DNF" | null;
  createdAt: string;
}

interface Props {
  solves: Solve[];
  onDelete: (id: string) => void;
  onPenalty: (id: string, penalty: "PLUS_TWO" | "DNF" | null) => void;
}

export default function SolveList({ solves, onDelete, onPenalty }: Props) {
  if (solves.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
        No solves yet. Start the timer!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-72">
      {solves.map((s, i) => (
        <div
          key={s.id}
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background: "var(--surface-raised)" }}
        >
          <span style={{ color: "var(--text-muted)", minWidth: 28 }}>
            {solves.length - i}
          </span>
          <span
            className="font-mono font-semibold tabular-nums"
            style={{
              color: s.penalty === "DNF" ? "var(--danger)" : "var(--text-primary)",
              minWidth: 60,
            }}
          >
            {s.penalty === "DNF" ? "DNF" : formatTime(s.time)}
            {s.penalty === "PLUS_TWO" && (
              <span style={{ color: "var(--warning)", fontSize: "0.7em" }}> +2</span>
            )}
          </span>
          <span
            className="truncate flex-1 text-xs"
            style={{ color: "var(--text-muted)" }}
            title={s.scramble}
          >
            {s.scramble}
          </span>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onPenalty(s.id, s.penalty === "PLUS_TWO" ? null : "PLUS_TWO")}
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                background: s.penalty === "PLUS_TWO" ? "var(--warning)" : "var(--surface)",
                color: s.penalty === "PLUS_TWO" ? "#000" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
              title="+2 penalty"
            >
              +2
            </button>
            <button
              onClick={() => onPenalty(s.id, s.penalty === "DNF" ? null : "DNF")}
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                background: s.penalty === "DNF" ? "var(--danger)" : "var(--surface)",
                color: s.penalty === "DNF" ? "#fff" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
              title="DNF"
            >
              DNF
            </button>
            <button
              onClick={() => onDelete(s.id)}
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                background: "var(--surface)",
                color: "var(--danger)",
                border: "1px solid var(--border)",
              }}
              title="Delete solve"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
