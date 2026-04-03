"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateScramble } from "@/lib/scramble";
import { computeStats } from "@/lib/stats";
import { DEFAULT_SESSION_ID } from "@/lib/constants";
import { useTimer } from "@/features/timer/useTimer";
import TimerDisplay from "@/features/timer/TimerDisplay";
import StatsPanel from "@/features/analytics/StatsPanel";
import SolveList from "@/features/analytics/SolveList";

interface Solve {
  id: string;
  rawTime: number;
  time: number | null;
  scramble: string;
  penalty: "PLUS_TWO" | "DNF" | null;
  createdAt: string;
}

export default function TimerPage() {
  const [scramble, setScramble] = useState(() => generateScramble());
  const [solves, setSolves] = useState<Solve[]>([]);
  const [sessionId] = useState(DEFAULT_SESSION_ID);
  const [inspectionEnabled, setInspectionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const currentScramble = useRef(scramble);
  currentScramble.current = scramble;

  // Load solves
  useEffect(() => {
    fetch(`/api/solves?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setSolves(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  const onFinish = useCallback(
    async (rawMs: number) => {
      const body = {
        rawTime: rawMs,
        scramble: currentScramble.current,
        sessionId,
      };

      try {
        const resp = await fetch("/api/solves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const saved: Solve = await resp.json();
        setSolves((prev) => [saved, ...prev]);
        setScramble(generateScramble());
      } catch {
        // Still show the time, just log
        console.error("Failed to save solve");
      }
    },
    [sessionId]
  );

  const { phase, displayMs, inspectionLeft, reset, handleTouchStart, handleTouchEnd } =
    useTimer({ onFinish, inspectionEnabled });

  const handleDelete = async (id: string) => {
    await fetch(`/api/solves/${id}`, { method: "DELETE" });
    setSolves((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePenalty = async (id: string, penalty: "PLUS_TWO" | "DNF" | null) => {
    const resp = await fetch(`/api/solves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ penalty }),
    });
    const updated: Solve = await resp.json();
    setSolves((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const stats = computeStats(solves);

  return (
    <div className="flex flex-col h-full">
      {/* Scramble bar */}
      <div
        className="px-6 py-4 text-center text-sm font-mono border-b"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
          letterSpacing: "0.05em",
        }}
      >
        {scramble}
        <button
          onClick={() => setScramble(generateScramble())}
          className="ml-4 text-xs px-2 py-1 rounded"
          style={{
            color: "var(--text-muted)",
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
          title="New scramble"
        >
          ↻
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Timer center */}
        <div className="flex flex-col flex-1 min-w-0">
          <TimerDisplay
            phase={phase}
            displayMs={displayMs}
            inspectionLeft={inspectionLeft}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {/* Controls bar */}
          <div
            className="flex items-center justify-center gap-4 px-6 py-3 border-t text-xs"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inspectionEnabled}
                onChange={(e) => setInspectionEnabled(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              15s inspection
            </label>
            <button
              onClick={reset}
              className="px-3 py-1 rounded"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className="w-72 shrink-0 border-l p-4 flex flex-col gap-4 overflow-y-auto hidden md:flex"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <StatsPanel stats={stats} />
          {loading ? (
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Loading…
            </div>
          ) : (
            <SolveList
              solves={solves}
              onDelete={handleDelete}
              onPenalty={handlePenalty}
            />
          )}
        </aside>
      </div>

      {/* Mobile stats strip */}
      <div
        className="md:hidden flex justify-around px-4 py-3 border-t text-xs"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {(["best", "ao5", "ao12"] as const).map((k) => (
          <div key={k} className="flex flex-col items-center gap-0.5">
            <span style={{ color: "var(--text-muted)" }}>
              {k === "best" ? "PB" : k.toUpperCase()}
            </span>
            <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
              {stats[k] !== null
                ? (() => {
                    const v = stats[k];
                    if (v === null) return "—";
                    const s = v / 1000;
                    const m = Math.floor(s / 60);
                    const rem = (s % 60).toFixed(2).padStart(5, "0");
                    return m > 0 ? `${m}:${rem}` : (s % 60).toFixed(2);
                  })()
                : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
