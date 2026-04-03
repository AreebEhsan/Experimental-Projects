import { NextRequest, NextResponse } from "next/server";
import { SOLVER_API_URL } from "@/lib/constants";

const CUBE_STRING_LENGTH = 54;
const VALID_FACES = new Set(["U", "R", "F", "D", "L", "B"]);

function validateCubeString(s: string): string | null {
  if (s.length !== CUBE_STRING_LENGTH) {
    return `Cube string must be exactly ${CUBE_STRING_LENGTH} characters, got ${s.length}`;
  }
  const chars = s.toUpperCase().split("");
  if (!chars.every((c) => VALID_FACES.has(c))) {
    return "Cube string contains invalid characters. Use U R F D L B only.";
  }
  const counts: Record<string, number> = {};
  for (const c of chars) counts[c] = (counts[c] ?? 0) + 1;
  for (const face of VALID_FACES) {
    if (counts[face] !== 9) {
      return `Each face must appear exactly 9 times. ${face} appears ${counts[face] ?? 0} times.`;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { cubeString } = await req.json();
  if (!cubeString || typeof cubeString !== "string") {
    return NextResponse.json({ error: "cubeString required" }, { status: 400 });
  }

  const validationError = validateCubeString(cubeString.toUpperCase());
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  try {
    const resp = await fetch(`${SOLVER_API_URL}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cube_string: cubeString.toUpperCase() }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: data.detail ?? "Solver error" }, { status: resp.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Solver service unreachable: ${msg}` },
      { status: 503 }
    );
  }
}
