import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_USER_ID, DEFAULT_SESSION_ID, DEFAULT_SESSION_NAME } from "@/lib/constants";

async function ensureDefaultUser() {
  await db.user.upsert({
    where: { id: DEFAULT_USER_ID },
    create: { id: DEFAULT_USER_ID, name: "Default User" },
    update: {},
  });
}

async function ensureDefaultSession() {
  await ensureDefaultUser();
  await db.session.upsert({
    where: { id: DEFAULT_SESSION_ID },
    create: { id: DEFAULT_SESSION_ID, name: DEFAULT_SESSION_NAME, userId: DEFAULT_USER_ID },
    update: {},
  });
}

export async function GET() {
  await ensureDefaultSession();
  const sessions = await db.session.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  await ensureDefaultUser();
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const session = await db.session.create({
    data: { name: name.trim(), userId: DEFAULT_USER_ID },
  });
  return NextResponse.json(session, { status: 201 });
}
