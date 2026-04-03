"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { INSPECTION_SECONDS } from "@/lib/constants";

export type TimerPhase =
  | "idle"         // waiting
  | "arming"       // spacebar held, about to start
  | "inspection"   // 15s countdown
  | "running"      // timing
  | "stopped";     // just finished, showing result

export interface TimerState {
  phase: TimerPhase;
  displayMs: number;         // what to show on screen (ms)
  inspectionLeft: number;    // seconds remaining in inspection
  startedAt: number | null;  // performance.now() when running started
}

const HOLD_DELAY = 300; // ms hold before armed

interface UseTimerOptions {
  onFinish: (rawMs: number) => void;
  inspectionEnabled: boolean;
}

export function useTimer({ onFinish, inspectionEnabled }: UseTimerOptions) {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [displayMs, setDisplayMs] = useState(0);
  const [inspectionLeft, setInspectionLeft] = useState(INSPECTION_SECONDS);

  const startedAt = useRef<number | null>(null);
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);
  const inspectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<TimerPhase>("idle");
  phaseRef.current = phase;

  const clearRaf = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  const clearInspection = () => {
    if (inspectionInterval.current !== null) {
      clearInterval(inspectionInterval.current);
      inspectionInterval.current = null;
    }
  };

  const startRunning = useCallback(() => {
    clearInspection();
    const now = performance.now();
    startedAt.current = now;
    setPhase("running");

    const tick = () => {
      setDisplayMs(Math.floor(performance.now() - startedAt.current!));
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, []);

  const startInspection = useCallback(() => {
    let left = INSPECTION_SECONDS;
    setInspectionLeft(left);
    setPhase("inspection");

    inspectionInterval.current = setInterval(() => {
      left -= 1;
      setInspectionLeft(left);
      if (left <= 0) {
        clearInspection();
        startRunning();
      }
    }, 1000);
  }, [startRunning]);

  const arm = useCallback(() => {
    if (phaseRef.current !== "idle" && phaseRef.current !== "stopped") return;
    holdTimeout.current = setTimeout(() => {
      setPhase("arming");
    }, HOLD_DELAY);
  }, []);

  const release = useCallback(() => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (phaseRef.current === "arming") {
      if (inspectionEnabled) {
        startInspection();
      } else {
        startRunning();
      }
    }
  }, [inspectionEnabled, startInspection, startRunning]);

  const stop = useCallback(() => {
    if (phaseRef.current !== "running") return;
    clearRaf();
    const elapsed = Math.floor(performance.now() - startedAt.current!);
    setDisplayMs(elapsed);
    setPhase("stopped");
    onFinish(elapsed);
  }, [onFinish]);

  const reset = useCallback(() => {
    clearRaf();
    clearInspection();
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    startedAt.current = null;
    setPhase("idle");
    setDisplayMs(0);
    setInspectionLeft(INSPECTION_SECONDS);
  }, []);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (e.repeat) return;
      e.preventDefault();

      if (phaseRef.current === "running") {
        stop();
        return;
      }
      if (phaseRef.current === "inspection") {
        startRunning();
        return;
      }
      arm();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      release();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [arm, release, stop, startRunning]);

  // Touch handling for mobile
  const handleTouchStart = useCallback(() => {
    if (phaseRef.current === "running") {
      stop();
      return;
    }
    if (phaseRef.current === "inspection") {
      startRunning();
      return;
    }
    arm();
  }, [arm, stop, startRunning]);

  const handleTouchEnd = useCallback(() => {
    release();
  }, [release]);

  return {
    phase,
    displayMs,
    inspectionLeft,
    reset,
    handleTouchStart,
    handleTouchEnd,
  };
}
