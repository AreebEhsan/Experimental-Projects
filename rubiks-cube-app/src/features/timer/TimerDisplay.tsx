"use client";

import { formatTime } from "@/lib/stats";
import { TimerPhase } from "./useTimer";

interface Props {
  phase: TimerPhase;
  displayMs: number;
  inspectionLeft: number;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}

export default function TimerDisplay({
  phase,
  displayMs,
  inspectionLeft,
  onTouchStart,
  onTouchEnd,
}: Props) {
  const color =
    phase === "arming"
      ? "var(--success)"
      : phase === "inspection"
      ? "var(--warning)"
      : phase === "running"
      ? "var(--text-primary)"
      : "var(--text-primary)";

  const label =
    phase === "idle"
      ? "Hold Space to start"
      : phase === "arming"
      ? "Release to start"
      : phase === "inspection"
      ? `Inspection: ${inspectionLeft}s`
      : phase === "stopped"
      ? "Press Space for next"
      : "";

  const display =
    phase === "inspection"
      ? `${inspectionLeft}`
      : formatTime(displayMs);

  return (
    <div
      className="flex flex-col items-center justify-center select-none cursor-pointer flex-1"
      onMouseDown={onTouchStart}
      onMouseUp={onTouchEnd}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="font-mono text-[clamp(4rem,15vw,9rem)] font-bold leading-none transition-colors duration-100 tabular-nums"
        style={{ color }}
      >
        {display}
      </div>
      <p className="mt-4 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
