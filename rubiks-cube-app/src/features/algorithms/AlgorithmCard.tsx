"use client";

import Link from "next/link";

interface Props {
  id: string;
  name: string;
  category: string;
  caseNumber: number;
  notation: string;
  description: string;
  learned: boolean;
  favorite: boolean;
  onToggleLearn: () => void;
  onToggleFav: () => void;
}

export default function AlgorithmCard({
  id,
  name,
  category,
  caseNumber,
  notation,
  description,
  learned,
  favorite,
  onToggleLearn,
  onToggleFav,
}: Props) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2 transition-all hover:scale-[1.01]"
      style={{
        background: "var(--surface)",
        border: `1px solid ${learned ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/algorithms/${category.toLowerCase()}/${id}`}
          className="font-semibold text-sm hover:underline"
          style={{ color: "var(--text-primary)" }}
        >
          {name}
        </Link>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onToggleFav}
            title="Favorite"
            className="text-base leading-none"
            style={{ color: favorite ? "var(--warning)" : "var(--border)" }}
          >
            ★
          </button>
          <button
            onClick={onToggleLearn}
            className="text-xs px-2 py-0.5 rounded font-medium"
            style={{
              background: learned ? "var(--accent)" : "var(--surface-raised)",
              color: learned ? "#fff" : "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {learned ? "✓" : "Learn"}
          </button>
        </div>
      </div>

      <div
        className="font-mono text-xs leading-relaxed break-all"
        style={{ color: "var(--text-muted)" }}
      >
        {notation}
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>
    </div>
  );
}
