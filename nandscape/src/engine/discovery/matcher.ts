import type { DiscoveryResult, TruthTable } from "@/domain/circuit/types";
import { getDiscoveryCatalog } from "./catalog";

export function matchDiscovery(
  table: TruthTable | undefined,
  diagnostics: string[] = [],
): DiscoveryResult {
  if (!table) {
    return {
      id: crypto.randomUUID(),
      status: "INVALID_CANDIDATE",
      diagnostics,
      discoveredAt: Date.now(),
    };
  }

  const signature = table.canonicalSignature;
  const arity = table.inputNames.length;
  const hit = getDiscoveryCatalog().find(
    (entry) => entry.arity === arity && entry.canonicalSignature === signature,
  );

  if (!hit) {
    return {
      id: crypto.randomUUID(),
      status: "NO_MATCH",
      arity,
      canonicalSignature: signature,
      diagnostics,
      discoveredAt: Date.now(),
    };
  }

  return {
    id: crypto.randomUUID(),
    status: "MATCH",
    matchedGateId: hit.id,
    matchedName: hit.name,
    arity,
    canonicalSignature: signature,
    diagnostics,
    discoveredAt: Date.now(),
  };
}
