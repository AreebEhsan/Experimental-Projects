import type { LogicBit, TruthTable } from "@/domain/circuit/types";

function generatePermutations(size: number): number[][] {
  const values = Array.from({ length: size }, (_, index) => index);
  const result: number[][] = [];

  function walk(remaining: number[], acc: number[]): void {
    if (remaining.length === 0) {
      result.push(acc);
      return;
    }

    remaining.forEach((value, index) => {
      const next = [...remaining.slice(0, index), ...remaining.slice(index + 1)];
      walk(next, [...acc, value]);
    });
  }

  walk(values, []);
  return result;
}

function rowIndexFromBits(bits: LogicBit[]): number {
  return bits.reduce<number>((acc, bit) => (acc << 1) | bit, 0);
}

function buildPermutationSignature(rawOutputs: LogicBit[], permutation: number[]): string {
  const arity = permutation.length;
  const rows = 1 << arity;
  let signature = "";

  for (let row = 0; row < rows; row += 1) {
    const permutedBits = Array.from({ length: arity }, (_, position) =>
      ((row >> (arity - position - 1)) & 1) as LogicBit,
    );

    const originalBits = Array<LogicBit>(arity).fill(0);
    permutation.forEach((originalPosition, newPosition) => {
      originalBits[originalPosition] = permutedBits[newPosition];
    });

    const originalIndex = rowIndexFromBits(originalBits);
    signature += rawOutputs[originalIndex];
  }

  return signature;
}

export function canonicalizeSingleOutputTable(table: TruthTable): string {
  if (table.outputNames.length !== 1) {
    throw new Error("MVP discovery supports single-output tables only.");
  }

  const arity = table.inputNames.length;
  const rawOutputs = table.rows.map((row) => row.out[0]);
  const permutations = generatePermutations(arity);
  const candidates = permutations.map((permutation) =>
    buildPermutationSignature(rawOutputs, permutation),
  );
  candidates.sort();
  return `${arity}:${candidates[0] ?? ""}`;
}
