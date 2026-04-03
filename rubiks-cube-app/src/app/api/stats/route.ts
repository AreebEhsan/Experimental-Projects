import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_USER_ID, DEFAULT_SESSION_ID } from "@/lib/constants";
import { computeStats } from "@/lib/stats";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? DEFAULT_SESSION_ID;

  const solves = await db.solve.findMany({
    where: { sessionId, userId: DEFAULT_USER_ID },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { time: true },
  });

  const stats = computeStats(solves);
  return NextResponse.json(stats);
}
