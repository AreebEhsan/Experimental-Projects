export type Penalty = "PLUS_TWO" | "DNF" | null;

export interface SolveRecord {
  id: string;
  createdAt: string;
  rawTime: number;
  time: number | null;
  scramble: string;
  penalty: Penalty;
  notes: string;
  sessionId: string;
  userId: string;
}

export interface SessionRecord {
  id: string;
  name: string;
  createdAt: string;
  userId: string;
}

export interface SolveStats {
  count: number;
  current: number | null;
  best: number | null;
  worst: number | null;
  average: number | null;
  ao5: number | null;
  ao12: number | null;
}

export interface AlgorithmRecord {
  id: string;
  name: string;
  category: "OLL" | "PLL" | "F2L" | "COLL" | "WV";
  caseNumber: number;
  notation: string;
  description: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
}

export interface AlgorithmProgressRecord {
  algorithmId: string;
  learned: boolean;
  favorite: boolean;
}
