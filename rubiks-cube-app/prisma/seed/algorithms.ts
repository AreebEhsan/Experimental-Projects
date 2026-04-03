/**
 * Seed data for OLL (57 cases) and PLL (21 cases).
 * Notation: standard WCA / Cubeskills notation.
 */

export interface AlgSeedEntry {
  name: string;
  category: "OLL" | "PLL";
  caseNumber: number;
  notation: string;
  description: string;
}

export const OLL_ALGS: AlgSeedEntry[] = [
  // --- OLL 1-9: Dot/Awkward shapes ---
  { name: "OLL 1", category: "OLL", caseNumber: 1, notation: "R U2 R2 F R F' U2 R' F R F'", description: "All edges bad, 4 corners good." },
  { name: "OLL 2", category: "OLL", caseNumber: 2, notation: "F R U R' U' F' f R U R' U' f'", description: "All edges bad, 4 corners good — mirror of OLL 1." },
  { name: "OLL 3", category: "OLL", caseNumber: 3, notation: "f U R U' R' f' U' F R U R' U' F'", description: "All edges bad, 2 adjacent corners good." },
  { name: "OLL 4", category: "OLL", caseNumber: 4, notation: "f R U R' U' f' U F R U R' U' F'", description: "All edges bad, 2 adjacent corners good." },
  { name: "OLL 5", category: "OLL", caseNumber: 5, notation: "r' U2 R U R' U r", description: "Square shape left-back." },
  { name: "OLL 6", category: "OLL", caseNumber: 6, notation: "r U2 R' U' R U' r'", description: "Square shape right-back." },
  { name: "OLL 7", category: "OLL", caseNumber: 7, notation: "r U R' U R U2 r'", description: "Small L shape." },
  { name: "OLL 8", category: "OLL", caseNumber: 8, notation: "r' U' R U' R' U2 r", description: "Small L shape mirror." },
  { name: "OLL 9", category: "OLL", caseNumber: 9, notation: "R U R' U' R' F R2 U R' U' F'", description: "Fish shape top-right." },
  { name: "OLL 10", category: "OLL", caseNumber: 10, notation: "R U R' U R' F R F' R U2 R'", description: "Fish shape top-left." },
  { name: "OLL 11", category: "OLL", caseNumber: 11, notation: "r' R2 U R' U R U2 R' U M'", description: "Small T shape." },
  { name: "OLL 12", category: "OLL", caseNumber: 12, notation: "M' R' U' R U' R' U2 R U' R r'", description: "Small T shape mirror." },
  { name: "OLL 13", category: "OLL", caseNumber: 13, notation: "F U R U' R2 F' R U R U' R'", description: "Knight move shape." },
  { name: "OLL 14", category: "OLL", caseNumber: 14, notation: "R' F R U R' F' R F U' F'", description: "Knight move shape mirror." },
  { name: "OLL 15", category: "OLL", caseNumber: 15, notation: "r' U' r R' U' R U r' U r", description: "Awkward L shape." },
  { name: "OLL 16", category: "OLL", caseNumber: 16, notation: "r U r' R U R' U' r U' r'", description: "Awkward L shape mirror." },
  { name: "OLL 17", category: "OLL", caseNumber: 17, notation: "R U R' U R' F R F' U2 R' F R F'", description: "Cross with corner in front." },
  { name: "OLL 18", category: "OLL", caseNumber: 18, notation: "r U R' U R U2 r2 U' R U' R' U2 r", description: "Cross — awkward." },
  { name: "OLL 19", category: "OLL", caseNumber: 19, notation: "r' R U R U R' U' r R2' F R F'", description: "Cross — awkward." },
  { name: "OLL 20", category: "OLL", caseNumber: 20, notation: "r U R' U' r' F R F' R U R' U' R' F R F'", description: "All edges and corners bad." },
  // --- OLL 21-27: Cross already done ---
  { name: "OLL 21", category: "OLL", caseNumber: 21, notation: "R U2 R' U' R U R' U' R U' R'", description: "Cross done. Sune." },
  { name: "OLL 22", category: "OLL", caseNumber: 22, notation: "R U2 R2 U' R2 U' R2 U2 R", description: "Cross done. Bruno." },
  { name: "OLL 23", category: "OLL", caseNumber: 23, notation: "R2 D' R U2 R' D R U2 R", description: "Cross done. Headlights front." },
  { name: "OLL 24", category: "OLL", caseNumber: 24, notation: "r U R' U' r' F R F'", description: "Cross done. No headlights." },
  { name: "OLL 25", category: "OLL", caseNumber: 25, notation: "F' r U R' U' r' F R", description: "Cross done. No headlights mirror." },
  { name: "OLL 26", category: "OLL", caseNumber: 26, notation: "R U2 R' U' R U' R'", description: "Cross done. Antisune." },
  { name: "OLL 27", category: "OLL", caseNumber: 27, notation: "R U R' U R U2 R'", description: "Cross done. Sune." },
  { name: "OLL 28", category: "OLL", caseNumber: 28, notation: "r U R' U' r' R U R U' R'", description: "Cross done. Arrow front-left." },
  { name: "OLL 29", category: "OLL", caseNumber: 29, notation: "R U R' U' R U' R' F' U' F R U R'", description: "P shape." },
  { name: "OLL 30", category: "OLL", caseNumber: 30, notation: "F R' F R2 U' R' U' R U R' F2", description: "P shape mirror." },
  { name: "OLL 31", category: "OLL", caseNumber: 31, notation: "R' U' F U R U' R' F' R", description: "C shape." },
  { name: "OLL 32", category: "OLL", caseNumber: 32, notation: "R U B' U' R' U R B R'", description: "C shape mirror." },
  { name: "OLL 33", category: "OLL", caseNumber: 33, notation: "R U R' U' R' F R F'", description: "T shape." },
  { name: "OLL 34", category: "OLL", caseNumber: 34, notation: "R U R2 U' R' F R U R U' F'", description: "C shape variant." },
  { name: "OLL 35", category: "OLL", caseNumber: 35, notation: "R U2 R2 F R F' R U2 R'", description: "Fish head right." },
  { name: "OLL 36", category: "OLL", caseNumber: 36, notation: "R' U' R U' R' U R U R B' R' B", description: "W shape." },
  { name: "OLL 37", category: "OLL", caseNumber: 37, notation: "F R U' R' U' R U R' F'", description: "Fish head left." },
  { name: "OLL 38", category: "OLL", caseNumber: 38, notation: "R U R' U R U' R' U' R' F R F'", description: "W shape mirror." },
  { name: "OLL 39", category: "OLL", caseNumber: 39, notation: "R U R' F' U' F U R U2 R'", description: "Big L left." },
  { name: "OLL 40", category: "OLL", caseNumber: 40, notation: "R' F R U R' U' F' U R", description: "Big L right." },
  { name: "OLL 41", category: "OLL", caseNumber: 41, notation: "R U R' U R U2 R' F R U R' U' F'", description: "Awkward skip." },
  { name: "OLL 42", category: "OLL", caseNumber: 42, notation: "R' U' R U' R' U2 R F R U R' U' F'", description: "Awkward skip mirror." },
  { name: "OLL 43", category: "OLL", caseNumber: 43, notation: "R' U' F' U F R", description: "P shape right." },
  { name: "OLL 44", category: "OLL", caseNumber: 44, notation: "f R U R' U' f'", description: "P shape left." },
  { name: "OLL 45", category: "OLL", caseNumber: 45, notation: "F R U R' U' F'", description: "T shape cross." },
  { name: "OLL 46", category: "OLL", caseNumber: 46, notation: "R' U' R' F R F' U R", description: "Small L back-left." },
  { name: "OLL 47", category: "OLL", caseNumber: 47, notation: "R' U' R' F R F' R' F R F' U R", description: "Pi shape — corners ok." },
  { name: "OLL 48", category: "OLL", caseNumber: 48, notation: "F R U R' U' R U R' U' F'", description: "Pi shape — corners ok mirror." },
  { name: "OLL 49", category: "OLL", caseNumber: 49, notation: "r U' r2 U r2 U r2 U' r", description: "Cross, side square." },
  { name: "OLL 50", category: "OLL", caseNumber: 50, notation: "r' U r2 U' r2 U' r2 U r'", description: "Cross, side square mirror." },
  { name: "OLL 51", category: "OLL", caseNumber: 51, notation: "f R U R' U' R U R' U' f'", description: "I shape." },
  { name: "OLL 52", category: "OLL", caseNumber: 52, notation: "R U R' U R U' B U' B' R'", description: "I shape variant." },
  { name: "OLL 53", category: "OLL", caseNumber: 53, notation: "r' U2 R U R' U' R U R' U r", description: "Diagonal skip." },
  { name: "OLL 54", category: "OLL", caseNumber: 54, notation: "r U2 R' U' R U R' U' R U' r'", description: "Diagonal skip mirror." },
  { name: "OLL 55", category: "OLL", caseNumber: 55, notation: "R U2 R2 U' R U' R' U2 F R F'", description: "Z shape." },
  { name: "OLL 56", category: "OLL", caseNumber: 56, notation: "r' U' r U' R' U R U' R' U R r' U r", description: "Z shape mirror." },
  { name: "OLL 57", category: "OLL", caseNumber: 57, notation: "R U R' U' M' U R U' r'", description: "All corners good, all edges bad (dot with cross)." },
];

export const PLL_ALGS: AlgSeedEntry[] = [
  { name: "Aa Perm", category: "PLL", caseNumber: 1, notation: "x R' U R' D2 R U' R' D2 R2 x'", description: "3-cycle of corners, front-left diagonal." },
  { name: "Ab Perm", category: "PLL", caseNumber: 2, notation: "x R2 D2 R U R' D2 R U' R x'", description: "3-cycle of corners, front-right diagonal." },
  { name: "E Perm", category: "PLL", caseNumber: 3, notation: "x' R U' R' D R U R' D' R U R' D R U' R' D' x", description: "Opposite corners swap + opposite edges swap." },
  { name: "F Perm", category: "PLL", caseNumber: 4, notation: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", description: "Adjacent corner swap + adjacent edge swap diagonal." },
  { name: "Ga Perm", category: "PLL", caseNumber: 5, notation: "R2 U R' U R' U' R U' R2 D U' R' U R D'", description: "4-cycle of corners + 4-cycle of edges (G perms)." },
  { name: "Gb Perm", category: "PLL", caseNumber: 6, notation: "R' U' R U D' R2 U R' U R U' R U' R2 D", description: "G perm variant B." },
  { name: "Gc Perm", category: "PLL", caseNumber: 7, notation: "R2 F2 R U2 R U2 R' F R U R' U' R' F R2", description: "G perm variant C." },
  { name: "Gd Perm", category: "PLL", caseNumber: 8, notation: "R U R' U' D R2 U' R U' R' U R' U R2 D'", description: "G perm variant D." },
  { name: "H Perm", category: "PLL", caseNumber: 9, notation: "M2 U M2 U2 M2 U M2", description: "Swap opposite edges on both layers — pure edge 4-cycle." },
  { name: "Ja Perm", category: "PLL", caseNumber: 10, notation: "x R2 F R F' R U2 r' U r U2 x'", description: "Adjacent swap: 2 corners + 1 edge pair." },
  { name: "Jb Perm", category: "PLL", caseNumber: 11, notation: "R U R' F' R U R' U' R' F R2 U' R'", description: "Adjacent swap mirror of Ja." },
  { name: "Na Perm", category: "PLL", caseNumber: 12, notation: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", description: "Double adjacent corner swap." },
  { name: "Nb Perm", category: "PLL", caseNumber: 13, notation: "R' U R U' R' F' U' F R U R' F R' F' R U' R", description: "Double adjacent corner swap mirror." },
  { name: "Ra Perm", category: "PLL", caseNumber: 14, notation: "R U R' F' R U2 R' U2 R' F R U R U2 R'", description: "3-cycle of adjacent corners + 1 edge pair." },
  { name: "Rb Perm", category: "PLL", caseNumber: 15, notation: "R' U2 R U2 R' F R U R' U' R' F' R2", description: "3-cycle mirror of Ra." },
  { name: "T Perm", category: "PLL", caseNumber: 16, notation: "R U R' U' R' F R2 U' R' U' R U R' F'", description: "Adjacent corner swap + adjacent edge swap same side." },
  { name: "Ua Perm", category: "PLL", caseNumber: 17, notation: "M2 U M U2 M' U M2", description: "3-cycle of edges, clockwise." },
  { name: "Ub Perm", category: "PLL", caseNumber: 18, notation: "M2 U' M U2 M' U' M2", description: "3-cycle of edges, counter-clockwise." },
  { name: "V Perm", category: "PLL", caseNumber: 19, notation: "R' U R' d' R' F' R2 U' R' U R' F R F", description: "Diagonal corner swap + adjacent edge swap." },
  { name: "Y Perm", category: "PLL", caseNumber: 20, notation: "F R U' R' U' R U R' F' R U R' U' R' F R F'", description: "Diagonal corner swap + adjacent edge swap different." },
  { name: "Z Perm", category: "PLL", caseNumber: 21, notation: "M' U M2 U M2 U M' U2 M2", description: "Swap opposite edges in both layers (checkerboard pattern)." },
];
