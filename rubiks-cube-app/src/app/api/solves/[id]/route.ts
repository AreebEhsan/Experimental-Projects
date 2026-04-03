import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { effectiveTime } from "@/lib/stats";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { penalty, notes } = body;

  const existing = await db.solve.findFirst({
    where: { id, userId: DEFAULT_USER_ID },
  });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const newPenalty = penalty !== undefined ? penalty : existing.penalty;
  const newNotes = notes !== undefined ? notes : existing.notes;
  const newTime = effectiveTime(existing.rawTime, newPenalty);

  const updated = await db.solve.update({
    where: { id },
    data: { penalty: newPenalty ?? undefined, notes: newNotes, time: newTime },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await db.solve.findFirst({
    where: { id, userId: DEFAULT_USER_ID },
  });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await db.solve.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
