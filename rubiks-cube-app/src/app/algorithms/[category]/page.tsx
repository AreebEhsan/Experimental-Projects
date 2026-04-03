"use client";

import { useEffect, useState, use } from "react";
import AlgorithmCard from "@/features/algorithms/AlgorithmCard";

interface Algorithm {
  id: string;
  name: string;
  category: string;
  caseNumber: number;
  notation: string;
  description: string;
}

interface Progress {
  algorithmId: string;
  learned: boolean;
  favorite: boolean;
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const CAT = category.toUpperCase();

  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "learned" | "unlearned">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/algorithms?category=${CAT}`).then((r) => r.json()),
      fetch("/api/algorithms/progress").then((r) => r.json()),
    ]).then(([algs, prog]: [Algorithm[], Progress[]]) => {
      setAlgorithms(algs);
      const map: Record<string, Progress> = {};
      for (const p of prog) map[p.algorithmId] = p;
      setProgress(map);
      setLoading(false);
    });
  }, [CAT]);

  const toggleProgress = async (
    algorithmId: string,
    field: "learned" | "favorite"
  ) => {
    const current = progress[algorithmId];
    const newVal = !(current?.[field] ?? false);

    const resp = await fetch("/api/algorithms/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ algorithmId, [field]: newVal }),
    });
    const updated: Progress = await resp.json();
    setProgress((prev) => ({ ...prev, [algorithmId]: updated }));
  };

  const filtered = algorithms.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.notation.toLowerCase().includes(search.toLowerCase());

    const p = progress[a.id];
    const matchFilter =
      filter === "all" ||
      (filter === "learned" && p?.learned) ||
      (filter === "unlearned" && !p?.learned);

    return matchSearch && matchFilter;
  });

  const learnedCount = algorithms.filter((a) => progress[a.id]?.learned).length;

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-baseline gap-3 mb-1">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {CAT}
          </h1>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {learnedCount}/{algorithms.length} learned
          </span>
        </div>
        {/* Progress bar */}
        <div
          className="h-1.5 rounded-full overflow-hidden w-full max-w-xs"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              background: "var(--accent)",
              width: algorithms.length
                ? `${(learnedCount / algorithms.length) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or moves…"
          className="flex-1 min-w-[160px] rounded-lg px-3 py-2 text-sm"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
        {(["all", "learned", "unlearned"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-2 rounded-lg text-sm capitalize"
            style={{
              background: filter === f ? "var(--accent)" : "var(--surface)",
              color: filter === f ? "#fff" : "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto">
          {filtered.map((alg) => (
            <AlgorithmCard
              key={alg.id}
              {...alg}
              learned={progress[alg.id]?.learned ?? false}
              favorite={progress[alg.id]?.favorite ?? false}
              onToggleLearn={() => toggleProgress(alg.id, "learned")}
              onToggleFav={() => toggleProgress(alg.id, "favorite")}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
              No algorithms match your filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
