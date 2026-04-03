"use client";

import { formatTime } from "@/lib/stats";
import type { SolveStats } from "@/lib/stats";

interface Props {
  stats: SolveStats;
}

const rows = [
  { key: "current", label: "Current" },
  { key: "best", label: "PB" },
  { key: "worst", label: "Worst" },
  { key: "average", label: "Mean" },
  { key: "ao5", label: "Ao5" },
  { key: "ao12", label: "Ao12" },
] as const;

export default function StatsPanel({ stats }: Props) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1 w-full"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Stats
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {stats.count} solve{stats.count !== 1 ? "s" : ""}
        </span>
      </div>
      {rows.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between py-1 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
          <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {stats[key] !== null ? formatTime(stats[key] as number) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
