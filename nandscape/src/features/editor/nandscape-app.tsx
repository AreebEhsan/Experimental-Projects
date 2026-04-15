"use client";

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { InputNode } from "./nodes/input-node";
import { NandNode } from "./nodes/nand-node";
import { OutputNode } from "./nodes/output-node";
import { useNandscapeStore } from "@/state/store";
import type { CanvasNodeData } from "./types";

const nodeTypes: NodeTypes = {
  inputNode: InputNode,
  nandNode: NandNode,
  outputNode: OutputNode,
};

function DiscoveryBadge() {
  const latestDiscovery = useNandscapeStore((state) => state.latestDiscovery);
  if (!latestDiscovery || latestDiscovery.status !== "MATCH") {
    return null;
  }

  return (
    <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-emerald-100">
      <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">
        Discovery
      </p>
      <p className="mt-1 text-lg font-semibold">{latestDiscovery.matchedName}</p>
      <p className="mt-1 text-xs text-emerald-100/80">
        Signature {latestDiscovery.canonicalSignature}
      </p>
    </div>
  );
}

function InputsPanel() {
  const nodes = useNandscapeStore((state) => state.nodes);
  const inputValues = useNandscapeStore((state) => state.inputValues);
  const toggleInput = useNandscapeStore((state) => state.toggleInput);
  const inputs = nodes.filter((node) => node.data.kind === "INPUT");

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Inputs</p>
      <div className="mt-3 space-y-2">
        {inputs.length === 0 ? (
          <p className="text-xs text-slate-400">Add input nodes to begin simulation.</p>
        ) : null}
        {inputs.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => toggleInput(node.id)}
            className="flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm transition hover:border-cyan-400/60"
          >
            <span>{node.data.label}</span>
            <span className="rounded border border-slate-600 px-2 py-0.5 text-xs">
              {inputValues[node.id] ?? 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TruthTablePanel() {
  const table = useNandscapeStore((state) => state.activeTruthTable);
  const analysisError = useNandscapeStore((state) => state.analysisError);
  if (!table) {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Truth Table</p>
        <p className="mt-2 text-xs text-slate-400">{analysisError ?? "No analysis target yet."}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Truth Table</p>
      <div className="mt-2 overflow-x-auto rounded-md border border-slate-700 bg-slate-950">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              {table.inputNames.map((name) => (
                <th key={name} className="px-2 py-1 text-left font-medium">
                  {name}
                </th>
              ))}
              {table.outputNames.map((name) => (
                <th key={name} className="px-2 py-1 text-left font-medium text-cyan-300">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={index} className="border-b border-slate-800/70 last:border-0">
                {row.in.map((bit, bitIndex) => (
                  <td key={`${index}-${bitIndex}`} className="px-2 py-1.5 text-slate-200">
                    {bit}
                  </td>
                ))}
                {row.out.map((bit, bitIndex) => (
                  <td key={`${index}-${bitIndex}-out`} className="px-2 py-1.5 font-semibold text-cyan-300">
                    {bit}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Signature {table.canonicalSignature}</p>
    </div>
  );
}

function DiscoveryLogPanel() {
  const discoveries = useNandscapeStore((state) => state.discoveries);
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Discovered</p>
      <div className="mt-2 space-y-2">
        {discoveries.length === 0 ? (
          <p className="text-xs text-slate-400">No gate discovered yet.</p>
        ) : null}
        {discoveries.map((discovery) => (
          <div
            key={discovery.id}
            className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm"
          >
            <p className="font-semibold text-emerald-100">{discovery.matchedName}</p>
            <p className="text-[11px] text-emerald-100/80">
              {discovery.canonicalSignature}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPanel() {
  const simulation = useNandscapeStore((state) => state.simulation);
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Simulation</p>
      <p className="mt-2 text-sm text-slate-200">
        {simulation?.isValid ? "Combinational graph is valid." : "Simulation blocked by errors."}
      </p>
      <div className="mt-2 space-y-1">
        {(simulation?.errors ?? []).map((item) => (
          <p key={item} className="text-xs text-rose-300">
            {item}
          </p>
        ))}
        {(simulation?.warnings ?? []).map((item) => (
          <p key={item} className="text-xs text-amber-300">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function Sidebar() {
  const addNode = useNandscapeStore((state) => state.addNode);
  const analyzeSelection = useNandscapeStore((state) => state.analyzeSelection);
  const resetScene = useNandscapeStore((state) => state.resetScene);

  return (
    <aside className="w-72 space-y-3 border-r border-slate-800 bg-slate-950/60 p-4 backdrop-blur">
      <h2 className="text-base font-semibold text-white">Build From NAND</h2>
      <p className="text-xs text-slate-400">
        Place gates, wire them, and discover functions from real truth behavior.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => addNode("INPUT")}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:border-emerald-400/60"
        >
          + Input
        </button>
        <button
          type="button"
          onClick={() => addNode("OUTPUT")}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:border-rose-400/60"
        >
          + Output
        </button>
        <button
          type="button"
          onClick={() => addNode("NAND")}
          className="col-span-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:border-cyan-400/60"
        >
          + NAND Gate
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={analyzeSelection}
          className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-500/20"
        >
          Analyze
        </button>
        <button
          type="button"
          onClick={resetScene}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:border-slate-500"
        >
          Reset
        </button>
      </div>
      <InputsPanel />
    </aside>
  );
}

function CanvasPanel() {
  const nodes = useNandscapeStore((state) => state.nodes);
  const edges = useNandscapeStore((state) => state.edges);
  const onNodesChange = useNandscapeStore((state) => state.onNodesChange);
  const onEdgesChange = useNandscapeStore((state) => state.onEdgesChange);
  const onConnect = useNandscapeStore((state) => state.onConnect);
  const setSelectedNode = useNandscapeStore((state) => state.setSelectedNode);

  const typedNodes = nodes as Node<CanvasNodeData>[];
  const typedEdges = edges as Edge[];

  return (
    <main className="relative flex-1">
      <div className="absolute left-5 top-5 z-10 w-80">
        <DiscoveryBadge />
      </div>
      <ReactFlow
        nodes={typedNodes}
        edges={typedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        snapToGrid
        snapGrid={[16, 16]}
        proOptions={{ hideAttribution: true }}
        className="bg-[radial-gradient(circle_at_20%_20%,rgba(8,145,178,0.2),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.15),transparent_40%),linear-gradient(180deg,#020617,#0f172a)]"
      >
        <MiniMap
          nodeColor={(node) => {
            if (node.data.kind === "INPUT") return "#34d399";
            if (node.data.kind === "OUTPUT") return "#fb7185";
            return "#22d3ee";
          }}
          maskColor="rgba(2,6,23,0.7)"
          className="!bg-slate-950/80 !border !border-slate-700"
        />
        <Controls className="!border !border-slate-700 !bg-slate-950/80 !text-slate-200" />
        <Background variant={BackgroundVariant.Dots} color="#334155" gap={18} size={1.2} />
      </ReactFlow>
    </main>
  );
}

function InsightsPanel() {
  return (
    <aside className="w-80 space-y-3 border-l border-slate-800 bg-slate-950/60 p-4 backdrop-blur">
      <StatusPanel />
      <TruthTablePanel />
      <DiscoveryLogPanel />
    </aside>
  );
}

function NandscapeCore() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <CanvasPanel />
      <InsightsPanel />
    </div>
  );
}

export function NandscapeApp() {
  return (
    <ReactFlowProvider>
      <NandscapeCore />
    </ReactFlowProvider>
  );
}
