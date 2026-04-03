import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const algorithms = await db.algorithm.findMany({
    where: {
      ...(category ? { category: category as "OLL" | "PLL" } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: [{ category: "asc" }, { caseNumber: "asc" }],
  });

  return NextResponse.json(algorithms);
}
