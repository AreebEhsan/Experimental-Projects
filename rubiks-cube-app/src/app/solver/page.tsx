"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const CubeViewer = dynamic(
  () => import("@/features/cube-visualizer/CubeViewer"),
  { ssr: false }
);

// A solved cube string — useful as a template
const SOLVED = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";
const FACES = ["U", "R", "F", "D", "L", "B"] as const;
const FACE_LABELS: Record<string, string> = {
  U: "Top (U)", R: "Right (R)", F: "Front (F)",
  D: "Bottom (D)", L: "Left (L)", B: "Back (B)",
};
const STICKER_COLORS: Record<string, string> = {
  U: "#ffffff", R: "#ff8800", F: "#00aa00",
  D: "#ffff00", L: "#ff0000", B: "#0055ff",
};
// Face order in the 54-char string
const FACE_OFFSETS: Record<string, number> = {
  U: 0, R: 9, F: 18, D: 27, L: 36, B: 45,
};

export default function SolverPage() {
  const [cubeString, setCubeString] = useState(SOLVED);
  const [solution, setSolution] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visualizeSolution, setVisualizeSolution] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "grid">("grid");

  const handleSolve = async () => {
    setError(null);
    setSolution(null);
    setVisualizeSolution(false);
    setLoading(true);

    try {
      const resp = await fetch("/api/solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cubeString }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error ?? "Unknown error");
      } else {
        setSolution(data.solution);
      }
    } catch {
      setError("Network error — is the solver service running?");
    } finally {
      setLoading(false);
    }
  };

  const updateSticker = (faceIndex: number, stickerIndex: number, color: string) => {
    const offset = faceIndex * 9 + stickerIndex;
    const chars = cubeString.split("");
    chars[offset] = color;
    setCubeString(chars.join(""));
  };

  const getFaceChar = (faceIndex: number, stickerIndex: number): string => {
    return cubeString[faceIndex * 9 + stickerIndex] ?? "U";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Kociemba Solver
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Input your cube state to get an optimal solution.
        </p>
      </div>

      {/* Input tabs */}
      <div className="flex gap-2 border-b pb-3" style={{ borderColor: "var(--border)" }}>
        {(["grid", "manual"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{
              background: activeTab === tab ? "var(--accent)" : "var(--surface)",
              color: activeTab === tab ? "#fff" : "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {tab === "grid" ? "Color Grid" : "Manual String"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="flex flex-col gap-4">
          {activeTab === "grid" ? (
            <div>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Click a sticker, then choose its color. Face order: U R F D L B (top→bottom, left→right).
              </p>
              <div className="flex flex-col gap-3">
                {FACES.map((face, fi) => (
                  <div key={face}>
                    <div className="text-xs mb-1 font-medium" style={{ color: "var(--text-muted)" }}>
                      {FACE_LABELS[face]}
                    </div>
                    <div className="grid grid-cols-3 gap-1 w-24">
                      {Array.from({ length: 9 }).map((_, si) => {
                        const char = getFaceChar(fi, si);
                        return (
                          <select
                            key={si}
                            value={char}
                            onChange={(e) => updateSticker(fi, si, e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer text-[0px]"
                            style={{
                              background: STICKER_COLORS[char] ?? "#888",
                              border: "2px solid var(--border)",
                            }}
                            title={`Face ${face}, sticker ${si + 1}: ${char}`}
                          >
                            {Object.entries(STICKER_COLORS).map(([c, color]) => (
                              <option key={c} value={c} style={{ background: color }}>
                                {c}
                              </option>
                            ))}
                          </select>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs block mb-2" style={{ color: "var(--text-muted)" }}>
                54-character cube state string (U R F D L B, 9 chars each):
              </label>
              <textarea
                value={cubeString}
                onChange={(e) => setCubeString(e.target.value.toUpperCase())}
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm font-mono resize-none"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${cubeString.length === 54 ? "var(--border)" : "var(--danger)"}`,
                  color: "var(--text-primary)",
                }}
                spellCheck={false}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: cubeString.length === 54 ? "var(--success)" : "var(--danger)" }}>
                  {cubeString.length}/54 chars
                </span>
                <button
                  onClick={() => setCubeString(SOLVED)}
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Reset to solved
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleSolve}
            disabled={loading || cubeString.length !== 54}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "Solving…" : "Solve"}
          </button>

          {error && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{ background: "rgba(255,77,77,0.1)", border: "1px solid var(--danger)", color: "var(--danger)" }}
            >
              {error}
            </div>
          )}

          {solution && (
            <div
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Solution
              </div>
              <div className="font-mono text-sm leading-loose break-all" style={{ color: "var(--text-primary)" }}>
                {solution}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {solution.split(" ").filter(Boolean).length} moves
              </div>
              <button
                onClick={() => setVisualizeSolution((v) => !v)}
                className="px-4 py-2 rounded-lg text-sm font-semibold self-start"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {visualizeSolution ? "Hide" : "Visualize"} Solution
              </button>
            </div>
          )}
        </div>

        {/* Visualizer */}
        <div>
          {visualizeSolution && solution ? (
            <div className="h-80">
              <CubeViewer algorithm={solution} showControls={false} />
            </div>
          ) : (
            <div
              className="h-80 rounded-xl flex items-center justify-center text-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              Solution visualization will appear here
            </div>
          )}

          <div
            className="mt-4 rounded-xl p-4 text-xs"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Cube String Format</div>
            <div className="font-mono leading-loose break-all">UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB</div>
            <div className="mt-1">Faces in order: U R F D L B · 9 characters each · reading left→right, top→bottom</div>
          </div>
        </div>
      </div>
    </div>
  );
}
