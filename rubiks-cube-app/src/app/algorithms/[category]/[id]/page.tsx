"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const CubeViewer = dynamic(
  () => import("@/features/cube-visualizer/CubeViewer"),
  { ssr: false }
);

interface Algorithm {
  id: string;
  name: string;
  category: string;
  caseNumber: number;
  notation: string;
  description: string;
  videoUrl?: string | null;
}

interface Progress {
  algorithmId: string;
  learned: boolean;
  favorite: boolean;
}

export default function AlgorithmDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = use(params);
  const [alg, setAlg] = useState<Algorithm | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [visualizing, setVisualizing] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/algorithms?category=${category.toUpperCase()}`).then((r) => r.json()),
      fetch("/api/algorithms/progress").then((r) => r.json()),
    ]).then(([algs, prog]: [Algorithm[], Progress[]]) => {
      const found = algs.find((a) => a.id === id) ?? null;
      setAlg(found);
      const p = prog.find((x) => x.algorithmId === id) ?? null;
      setProgress(p);
      setLoading(false);
    });
  }, [category, id]);

  const toggle = async (field: "learned" | "favorite") => {
    if (!alg) return;
    const newVal = !(progress?.[field] ?? false);
    const resp = await fetch("/api/algorithms/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ algorithmId: alg.id, [field]: newVal }),
    });
    const updated: Progress = await resp.json();
    setProgress(updated);
  };

  if (loading) {
    return (
      <div className="p-8 text-sm" style={{ color: "var(--text-muted)" }}>
        Loading…
      </div>
    );
  }

  if (!alg) {
    return (
      <div className="p-8 text-sm" style={{ color: "var(--danger)" }}>
        Algorithm not found.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/algorithms/${category}`}
          className="text-xs mb-4 inline-block"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to {category.toUpperCase()}
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {alg.name}
            </h1>
            <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {alg.category} #{alg.caseNumber}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggle("favorite")}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{
                background: progress?.favorite ? "var(--warning)" : "var(--surface)",
                color: progress?.favorite ? "#000" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {progress?.favorite ? "★ Favorited" : "☆ Favorite"}
            </button>
            <button
              onClick={() => toggle("learned")}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold"
              style={{
                background: progress?.learned ? "var(--accent)" : "var(--surface-raised)",
                color: progress?.learned ? "#fff" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {progress?.learned ? "✓ Learned" : "Mark as Learned"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notation + description */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
              Algorithm
            </div>
            <div
              className="font-mono text-sm leading-loose break-all"
              style={{ color: "var(--text-primary)" }}
            >
              {alg.notation}
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
              Description
            </div>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              {alg.description}
            </p>
          </div>

          {alg.videoUrl && (
            <a
              href={alg.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-lg text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--accent)",
              }}
            >
              ▶ Watch tutorial
            </a>
          )}

          <button
            onClick={() => setVisualizing((v) => !v)}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {visualizing ? "Hide" : "Visualize"} on 3D Cube
          </button>
        </div>

        {/* 3D Cube */}
        {visualizing && (
          <div className="h-72 lg:h-auto min-h-[280px]">
            <CubeViewer algorithm={alg.notation} showControls={false} />
          </div>
        )}
      </div>
    </div>
  );
}
