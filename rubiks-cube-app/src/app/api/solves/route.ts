import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_USER_ID, DEFAULT_SESSION_ID } from "@/lib/constants";
import { effectiveTime } from "@/lib/stats";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? DEFAULT_SESSION_ID;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500);

  const solves = await db.solve.findMany({
    where: { sessionId, userId: DEFAULT_USER_ID },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(solves);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    rawTime,
    scramble,
    penalty = null,
    notes = "",
    sessionId = DEFAULT_SESSION_ID,
  } = body;

  if (typeof rawTime !== "number" || rawTime <= 0) {
    return NextResponse.json({ error: "rawTime must be a positive number (ms)" }, { status: 400 });
  }
  if (!scramble || typeof scramble !== "string") {
    return NextResponse.json({ error: "scramble required" }, { status: 400 });
  }

  const validPenalties = [null, "PLUS_TWO", "DNF"];
  if (!validPenalties.includes(penalty)) {
    return NextResponse.json({ error: "invalid penalty" }, { status: 400 });
  }

  const time = effectiveTime(rawTime, penalty);

  const solve = await db.solve.create({
    data: {
      rawTime,
      time,
      scramble,
      penalty: penalty ?? undefined,
      notes,
      sessionId,
      userId: DEFAULT_USER_ID,
    },
  });

  return NextResponse.json(solve, { status: 201 });
}
