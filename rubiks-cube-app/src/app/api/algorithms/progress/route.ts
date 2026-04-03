import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  const progress = await db.algorithmProgress.findMany({
    where: { userId: DEFAULT_USER_ID },
  });
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  const { algorithmId, learned, favorite } = await req.json();

  if (!algorithmId) {
    return NextResponse.json({ error: "algorithmId required" }, { status: 400 });
  }

  const progress = await db.algorithmProgress.upsert({
    where: { userId_algorithmId: { userId: DEFAULT_USER_ID, algorithmId } },
    create: {
      userId: DEFAULT_USER_ID,
      algorithmId,
      learned: learned ?? false,
      favorite: favorite ?? false,
    },
    update: {
      ...(learned !== undefined ? { learned } : {}),
      ...(favorite !== undefined ? { favorite } : {}),
    },
  });

  return NextResponse.json(progress);
}
