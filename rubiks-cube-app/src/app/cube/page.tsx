import CubeViewer from "@/features/cube-visualizer/CubeViewer";

export default function CubePage() {
  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          3D Cube Visualizer
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Drag to rotate. Enter an algorithm and press Play.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <CubeViewer showControls />
      </div>
    </div>
  );
}
