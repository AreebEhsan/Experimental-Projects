export interface DiscoveryCatalogEntry {
  id: string;
  name: string;
  arity: number;
  canonicalSignature: string;
  description: string;
}

const functionSignatures: DiscoveryCatalogEntry[] = [
  {
    id: "not",
    name: "NOT",
    arity: 1,
    canonicalSignature: "1:10",
    description: "Signal inversion from NAND with tied inputs.",
  },
  {
    id: "nand",
    name: "NAND",
    arity: 2,
    canonicalSignature: "2:1110",
    description: "The universal primitive gate.",
  },
  {
    id: "and",
    name: "AND",
    arity: 2,
    canonicalSignature: "2:0001",
    description: "Conjunction discovered through NAND composition.",
  },
  {
    id: "or",
    name: "OR",
    arity: 2,
    canonicalSignature: "2:0111",
    description: "Disjunction via De Morgan over NAND.",
  },
  {
    id: "nor",
    name: "NOR",
    arity: 2,
    canonicalSignature: "2:1000",
    description: "NOT of OR.",
  },
  {
    id: "xor",
    name: "XOR",
    arity: 2,
    canonicalSignature: "2:0110",
    description: "Exclusive disjunction.",
  },
  {
    id: "xnor",
    name: "XNOR",
    arity: 2,
    canonicalSignature: "2:1001",
    description: "Equality detector.",
  },
];

export function getDiscoveryCatalog(): DiscoveryCatalogEntry[] {
  return functionSignatures;
}
