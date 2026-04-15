"use client";

import type {
  DiscoveryResult,
  InputState,
  NodeKind,
  SimulationSnapshot,
  TruthTable,
} from "@/domain/circuit/types";
import { evaluateCircuit } from "@/engine/sim/evaluator";
import { matchDiscovery } from "@/engine/discovery/matcher";
import { generateTruthTableForOutput } from "@/engine/truth-table/generator";
import { toCircuit } from "@/features/editor/adapter";
import { initialEdges, initialNodes } from "@/features/editor/initial-graph";
import type { CanvasNodeData } from "@/features/editor/types";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "reactflow";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NandscapeState {
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
  inputValues: InputState["byNodeId"];
  selectedNodeId?: string;
  simulation: SimulationSnapshot | null;
  activeTruthTable: TruthTable | null;
  latestDiscovery: DiscoveryResult | null;
  discoveries: DiscoveryResult[];
  analysisError: string | null;
  addNode: (kind: NodeKind) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  toggleInput: (nodeId: string) => void;
  setSelectedNode: (nodeId?: string) => void;
  analyzeSelection: () => void;
  resetScene: () => void;
}

type InputValues = InputState["byNodeId"];

const seedInputs = (nodes: Node<CanvasNodeData>[]): InputValues =>
  nodes.reduce<InputState["byNodeId"]>((acc, node) => {
    if (node.data.kind === "INPUT") {
      acc[node.id] = 0;
    }
    return acc;
  }, {});

function withKindType(kind: NodeKind): Node<CanvasNodeData>["type"] {
  if (kind === "INPUT") {
    return "inputNode";
  }
  if (kind === "OUTPUT") {
    return "outputNode";
  }
  if (kind === "NAND") {
    return "nandNode";
  }
  return "compositeNode";
}

function withLabel(kind: NodeKind, nodes: Node<CanvasNodeData>[]): string {
  const count = nodes.filter((node) => node.data.kind === kind).length + 1;
  if (kind === "INPUT") {
    return `I${count}`;
  }
  if (kind === "OUTPUT") {
    return `O${count}`;
  }
  return `NAND ${count}`;
}

function firstOutputNodeId(nodes: Node<CanvasNodeData>[]): string | undefined {
  return nodes.find((node) => node.data.kind === "OUTPUT")?.id;
}

function recompute(state: Pick<NandscapeState, "nodes" | "edges" | "inputValues" | "selectedNodeId" | "discoveries">): Pick<
  NandscapeState,
  "simulation" | "activeTruthTable" | "analysisError" | "latestDiscovery" | "discoveries"
> {
  const circuit = toCircuit(state.nodes, state.edges);
  const inputState: InputState = { byNodeId: state.inputValues };
  const simulation = evaluateCircuit(circuit, inputState);

  const selectedNode = state.nodes.find((node) => node.id === state.selectedNodeId);
  const selectedOutputId =
    selectedNode?.data.kind === "OUTPUT" ? selectedNode.id : firstOutputNodeId(state.nodes);

  if (!selectedOutputId) {
    return {
      simulation,
      activeTruthTable: null,
      analysisError: "Add an output node to analyze a function.",
      latestDiscovery: null,
      discoveries: state.discoveries,
    };
  }

  const tableResult = generateTruthTableForOutput(circuit, selectedOutputId, inputState, {
    maxInputs: 8,
  });

  if (tableResult.error) {
    return {
      simulation,
      activeTruthTable: null,
      analysisError: tableResult.error,
      latestDiscovery: matchDiscovery(undefined, [tableResult.error]),
      discoveries: state.discoveries,
    };
  }

  const discovery = matchDiscovery(tableResult.table);
  const hasMatch = discovery.status === "MATCH" && discovery.matchedGateId;
  let discoveries = state.discoveries;
  if (
    hasMatch &&
    !state.discoveries.some((item) => item.matchedGateId === discovery.matchedGateId)
  ) {
    discoveries = [...state.discoveries, discovery];
  }

  return {
    simulation,
    activeTruthTable: tableResult.table ?? null,
    analysisError: null,
    latestDiscovery: discovery,
    discoveries,
  };
}

function isValidConnection(
  connection: Connection,
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
): boolean {
  if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
    return false;
  }

  const source = nodes.find((node) => node.id === connection.source);
  const target = nodes.find((node) => node.id === connection.target);
  if (!source || !target) {
    return false;
  }

  if (source.data.kind === "OUTPUT") {
    return false;
  }
  if (target.data.kind === "INPUT") {
    return false;
  }

  const targetTaken = edges.some(
    (edge) =>
      edge.target === connection.target &&
      edge.targetHandle === connection.targetHandle,
  );

  return !targetTaken;
}

const baseNodes = initialNodes();
const baseEdges = initialEdges();
const baseInputs = seedInputs(baseNodes);
const boot = recompute({
  nodes: baseNodes,
  edges: baseEdges,
  inputValues: baseInputs,
  selectedNodeId: undefined,
  discoveries: [],
});

export const useNandscapeStore = create<NandscapeState>()(
  persist(
    (set) => ({
      nodes: baseNodes,
      edges: baseEdges,
      inputValues: baseInputs,
      selectedNodeId: undefined,
      simulation: boot.simulation,
      activeTruthTable: boot.activeTruthTable,
      analysisError: boot.analysisError,
      latestDiscovery: boot.latestDiscovery,
      discoveries: boot.discoveries,
      addNode: (kind) =>
        set((state) => {
          const nextId = crypto.randomUUID();
          const baseX = 160 + (state.nodes.length % 4) * 220;
          const baseY = 80 + Math.floor(state.nodes.length / 4) * 130;
          const nextNode: Node<CanvasNodeData> = {
            id: nextId,
            type: withKindType(kind),
            position: { x: baseX, y: baseY },
            data: {
              kind,
              label: withLabel(kind, state.nodes),
            },
          };
          const nodes = [...state.nodes, nextNode];
          const inputValues =
            kind === "INPUT"
              ? ({ ...state.inputValues, [nextId]: 0 } as InputValues)
              : { ...state.inputValues };
          const derived = recompute({
            nodes,
            edges: state.edges,
            inputValues,
            selectedNodeId: state.selectedNodeId,
            discoveries: state.discoveries,
          });
          return { nodes, inputValues, ...derived };
        }),
      onNodesChange: (changes) =>
        set((state) => {
          const nodes = applyNodeChanges(changes, state.nodes);
          const selectedNode = nodes.find((node) => node.selected);
          const derived = recompute({
            nodes,
            edges: state.edges,
            inputValues: state.inputValues,
            selectedNodeId: selectedNode?.id,
            discoveries: state.discoveries,
          });
          return {
            nodes,
            selectedNodeId: selectedNode?.id,
            ...derived,
          };
        }),
      onEdgesChange: (changes) =>
        set((state) => {
          const edges = applyEdgeChanges(changes, state.edges);
          const derived = recompute({
            nodes: state.nodes,
            edges,
            inputValues: state.inputValues,
            selectedNodeId: state.selectedNodeId,
            discoveries: state.discoveries,
          });
          return { edges, ...derived };
        }),
      onConnect: (connection) =>
        set((state) => {
          if (!isValidConnection(connection, state.nodes, state.edges)) {
            return {};
          }
          const edges = addEdge(
            {
              ...connection,
              id: crypto.randomUUID(),
              type: "smoothstep",
              animated: false,
            },
            state.edges,
          );
          const derived = recompute({
            nodes: state.nodes,
            edges,
            inputValues: state.inputValues,
            selectedNodeId: state.selectedNodeId,
            discoveries: state.discoveries,
          });
          return { edges, ...derived };
        }),
      toggleInput: (nodeId) =>
        set((state) => {
          const value = state.inputValues[nodeId] ?? 0;
          const nextValue = (value === 0 ? 1 : 0) as 0 | 1;
          const inputValues = {
            ...state.inputValues,
            [nodeId]: nextValue,
          } as InputValues;
          const derived = recompute({
            nodes: state.nodes,
            edges: state.edges,
            inputValues,
            selectedNodeId: state.selectedNodeId,
            discoveries: state.discoveries,
          });
          return { inputValues, ...derived };
        }),
      setSelectedNode: (nodeId) =>
        set((state) => {
          const derived = recompute({
            nodes: state.nodes,
            edges: state.edges,
            inputValues: state.inputValues,
            selectedNodeId: nodeId,
            discoveries: state.discoveries,
          });
          return {
            selectedNodeId: nodeId,
            ...derived,
          };
        }),
      analyzeSelection: () =>
        set((state) => {
          const derived = recompute({
            nodes: state.nodes,
            edges: state.edges,
            inputValues: state.inputValues,
            selectedNodeId: state.selectedNodeId,
            discoveries: state.discoveries,
          });
          return derived;
        }),
      resetScene: () => {
        const nodes = initialNodes();
        const edges = initialEdges();
        const inputValues = seedInputs(nodes);
        const derived = recompute({
          nodes,
          edges,
          inputValues,
          selectedNodeId: undefined,
          discoveries: [],
        });
        set({
          nodes,
          edges,
          inputValues,
          selectedNodeId: undefined,
          ...derived,
        });
      },
    }),
    {
      name: "nandscape-mvp",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        inputValues: state.inputValues,
        discoveries: state.discoveries,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        const derived = recompute({
          nodes: state.nodes,
          edges: state.edges,
          inputValues: state.inputValues,
          selectedNodeId: state.selectedNodeId,
          discoveries: state.discoveries,
        });
        state.simulation = derived.simulation;
        state.activeTruthTable = derived.activeTruthTable;
        state.analysisError = derived.analysisError;
        state.latestDiscovery = derived.latestDiscovery;
        state.discoveries = derived.discoveries;
      },
    },
  ),
);
