/**
 * Core speedcubing stats utilities.
 * All times in milliseconds. DNF is represented as null.
 */

/** Format milliseconds to a human-readable timer string. */
export function formatTime(ms: number | null): string {
  if (ms === null) return "DNF";
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  return seconds.toFixed(2);
}

/** Effective time of a solve in ms. null means DNF. */
export function effectiveTime(
  rawTime: number,
  penalty: "PLUS_TWO" | "DNF" | null
): number | null {
  if (penalty === "DNF") return null;
  if (penalty === "PLUS_TWO") return rawTime + 2000;
  return rawTime;
}

/**
 * Compute average-of-N, trimming best and worst.
 * Returns null if more than 1 DNF in the window (DNF result).
 * For Ao5: trim 1 best + 1 worst. For Ao12: trim 1 best + 1 worst.
 */
export function computeAoN(times: (number | null)[]): number | null {
  if (times.length < 3) return null;

  const dnfCount = times.filter((t) => t === null).length;
  const trimCount = times.length <= 5 ? 1 : 1; // trim 1 each side

  // More than 1 DNF → entire average is DNF
  if (dnfCount > trimCount) return null;

  // Sort: finite values first, nulls (DNF) at end
  const sorted = [...times].sort((a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
  });

  // Remove best (first) and worst (last)
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

  // If any remaining are DNF → result is DNF
  if (trimmed.some((t) => t === null)) return null;

  const sum = (trimmed as number[]).reduce((a, b) => a + b, 0);
  return Math.round(sum / trimmed.length);
}

export interface SolveStats {
  count: number;
  current: number | null;
  best: number | null;
  worst: number | null;
  average: number | null;
  ao5: number | null;
  ao12: number | null;
}

/**
 * Compute all MVP stats from an array of solves (newest first).
 * Each solve has an `time` field (null = DNF).
 */
export function computeStats(
  solves: { time: number | null }[]
): SolveStats {
  const count = solves.length;

  if (count === 0) {
    return { count: 0, current: null, best: null, worst: null, average: null, ao5: null, ao12: null };
  }

  // solves[0] is most recent
  const current = solves[0].time;

  const validTimes = solves
    .map((s) => s.time)
    .filter((t): t is number => t !== null);

  const best = validTimes.length > 0 ? Math.min(...validTimes) : null;
  const worst = validTimes.length > 0 ? Math.max(...validTimes) : null;

  const allTimes = solves.map((s) => s.time);
  const average =
    validTimes.length > 0
      ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
      : null;

  const ao5 =
    count >= 5 ? computeAoN(allTimes.slice(0, 5)) : null;
  const ao12 =
    count >= 12 ? computeAoN(allTimes.slice(0, 12)) : null;

  return { count, current, best, worst, average, ao5, ao12 };
}
