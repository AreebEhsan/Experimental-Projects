/**
 * Rubik's Cube move parsing utilities.
 * Parses standard SiGN notation: R U R' U' F2 etc.
 */

export type FaceName = "U" | "D" | "R" | "L" | "F" | "B";
export type MoveDir = 1 | -1 | 2; // CW, CCW, double

export interface ParsedMove {
  face: FaceName;
  dir: MoveDir; // 1 = CW 90°, -1 = CCW 90°, 2 = 180°
}

const FACE_RE = /^([UDRLBF])(w)?(['2]?)$/;

export function parseMove(token: string): ParsedMove | null {
  const m = token.trim().match(FACE_RE);
  if (!m) return null;
  const face = m[1] as FaceName;
  const suffix = m[3];
  const dir: MoveDir = suffix === "'" ? -1 : suffix === "2" ? 2 : 1;
  return { face, dir };
}

export function parseMoves(alg: string): ParsedMove[] {
  return alg
    .split(/\s+/)
    .map(parseMove)
    .filter((m): m is ParsedMove => m !== null);
}

/** Invert a move sequence (for undoing). */
export function invertMoves(moves: ParsedMove[]): ParsedMove[] {
  return [...moves].reverse().map((m) => ({
    face: m.face,
    dir: m.dir === 2 ? 2 : m.dir === 1 ? -1 : 1,
  }));
}
