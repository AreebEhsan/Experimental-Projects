"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { CubeEngine } from "./CubeEngine";
import { parseMoves } from "@/lib/moves";

interface Props {
  /** Moves to animate on mount / when changed. */
  algorithm?: string;
  showControls?: boolean;
}

export default function CubeViewer({ algorithm, showControls = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CubeEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const orbitRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [algInput, setAlgInput] = useState(algorithm ?? "");

  // Init engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new CubeEngine(canvas);
    engineRef.current = engine;

    const loop = (now: number) => {
      engine.tickAnimation(now);
      engine.render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const obs = new ResizeObserver(() => {
      if (!canvas.parentElement) return;
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      if (width > 0 && height > 0) engine.resize(width, height);
    });
    if (canvas.parentElement) {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      if (width > 0 && height > 0) engine.resize(width, height);
      obs.observe(canvas.parentElement);
    }

    return () => {
      obs.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      engine.dispose();
    };
  }, []);

  // Play algorithm
  const playAlg = useCallback((alg: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.reset();
    const moves = parseMoves(alg);
    if (moves.length === 0) return;
    setIsPlaying(true);
    engine.enqueueMoves(moves, () => setIsPlaying(false));
  }, []);

  useEffect(() => {
    if (algorithm) {
      setAlgInput(algorithm);
      playAlg(algorithm);
    }
  }, [algorithm, playAlg]);

  // Orbit controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rotateCamera = (dx: number, dy: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      const yAxis = new THREE.Vector3(0, 1, 0);
      engine.camera.position.applyAxisAngle(yAxis, dx * 0.01);
      const right = new THREE.Vector3(1, 0, 0)
        .cross(engine.camera.position)
        .normalize();
      engine.camera.position.applyAxisAngle(right, dy * 0.01);
      engine.camera.lookAt(0, 0, 0);
    };

    const onMouseDown = (e: MouseEvent) => {
      orbitRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      const orbit = orbitRef.current;
      if (!orbit.active) return;
      rotateCamera(e.clientX - orbit.lastX, e.clientY - orbit.lastY);
      orbit.lastX = e.clientX;
      orbit.lastY = e.clientY;
    };
    const onMouseUp = () => { orbitRef.current.active = false; };

    let lastTX = 0, lastTY = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastTX = e.touches[0].clientX;
      lastTY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - lastTX;
      const dy = e.touches[0].clientY - lastTY;
      lastTX = e.touches[0].clientX;
      lastTY = e.touches[0].clientY;
      rotateCamera(dx, dy);
      e.preventDefault();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div
        className="relative flex-1 min-h-0 rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)" }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {showControls && (
        <div className="flex gap-2 flex-wrap">
          <input
            value={algInput}
            onChange={(e) => setAlgInput(e.target.value)}
            placeholder="Enter algorithm: R U R' U' …"
            className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm font-mono"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={() => playAlg(algInput)}
            disabled={isPlaying}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {isPlaying ? "Playing…" : "Play"}
          </button>
          <button
            onClick={() => {
              engineRef.current?.reset();
              setIsPlaying(false);
            }}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
