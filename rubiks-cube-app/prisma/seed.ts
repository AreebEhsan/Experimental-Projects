import { config } from "dotenv";
// Load .env.local first (takes precedence), then fall back to .env
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { OLL_ALGS, PLL_ALGS } from "./seed/algorithms";
import { DEFAULT_USER_ID, DEFAULT_SESSION_ID, DEFAULT_SESSION_NAME } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database…");

  // Default user + session
  await db.user.upsert({
    where: { id: DEFAULT_USER_ID },
    create: { id: DEFAULT_USER_ID, name: "Default User" },
    update: {},
  });

  await db.session.upsert({
    where: { id: DEFAULT_SESSION_ID },
    create: { id: DEFAULT_SESSION_ID, name: DEFAULT_SESSION_NAME, userId: DEFAULT_USER_ID },
    update: {},
  });

  // Algorithms
  const allAlgs = [...OLL_ALGS, ...PLL_ALGS];
  let created = 0;
  for (const alg of allAlgs) {
    await db.algorithm.upsert({
      where: { category_caseNumber: { category: alg.category, caseNumber: alg.caseNumber } },
      create: alg,
      update: { notation: alg.notation, description: alg.description },
    });
    created++;
  }

  console.log(`✓ Seeded ${created} algorithms (${OLL_ALGS.length} OLL + ${PLL_ALGS.length} PLL)`);
  console.log("✓ Default user and session created");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
