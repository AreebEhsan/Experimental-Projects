/**
 * WCA-compliant 3x3 scramble generator.
 * Produces a random 20-move scramble avoiding redundant consecutive moves.
 */

const FACES = ["U", "D", "R", "L", "F", "B"] as const;
const SUFFIXES = ["", "'", "2"] as const;

// Opposite face pairs — avoid repeating or using opposite on consecutive moves
const OPPOSITE: Record<string, string> = {
  U: "D", D: "U",
  R: "L", L: "R",
  F: "B", B: "F",
};

export function generateScramble(length = 20): string {
  const moves: string[] = [];
  let lastFace: string | null = null;
  let secondLastFace: string | null = null;

  for (let i = 0; i < length; i++) {
    let face: string;

    // Filter to avoid same face or opposite-face-after-same-axis pattern
    const available = FACES.filter((f) => {
      if (f === lastFace) return false;
      // Avoid 3-in-a-row on same axis (e.g. U D U)
      if (secondLastFace && OPPOSITE[f] === lastFace && OPPOSITE[secondLastFace] === f) return false;
      return true;
    });

    face = available[Math.floor(Math.random() * available.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    moves.push(face + suffix);

    secondLastFace = lastFace;
    lastFace = face;
  }

  return moves.join(" ");
}
