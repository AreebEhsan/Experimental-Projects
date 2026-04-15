import { NandscapeApp } from "@/features/editor/nandscape-app";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#020617]">
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-100">NANDSCAPE</h1>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
            Discovery engine for digital logic
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Build from NAND. Discover emergent gates from behavior.
        </p>
      </header>
      <NandscapeApp />
    </div>
  );
}
