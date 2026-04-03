/**
 * Three.js Rubik's Cube engine.
 * Manages cubie meshes, face rotations, and animation queue.
 */

import * as THREE from "three";
import type { FaceName, MoveDir, ParsedMove } from "@/lib/moves";

const CUBIE_SIZE = 0.95;
const GAP = 1.0;
const ANIM_DURATION = 180; // ms per 90° rotation

// Face → rotation axis and layer selection
const FACE_AXIS: Record<FaceName, THREE.Vector3> = {
  U: new THREE.Vector3(0, 1, 0),
  D: new THREE.Vector3(0, -1, 0),
  R: new THREE.Vector3(1, 0, 0),
  L: new THREE.Vector3(-1, 0, 0),
  F: new THREE.Vector3(0, 0, 1),
  B: new THREE.Vector3(0, 0, -1),
};

// Axis component and value for layer membership
const FACE_LAYER: Record<FaceName, { axis: "x" | "y" | "z"; val: number }> = {
  U: { axis: "y", val: 1 },
  D: { axis: "y", val: -1 },
  R: { axis: "x", val: 1 },
  L: { axis: "x", val: -1 },
  F: { axis: "z", val: 1 },
  B: { axis: "z", val: -1 },
};

// Sticker colors
const FACE_COLORS: Record<FaceName, number> & { inside: number } = {
  U: 0xffffff, // white
  D: 0xffff00, // yellow
  R: 0xff4400, // orange
  L: 0xff0000, // red (standard: red left, orange right; adjusted for visual clarity)
  F: 0x00aa00, // green
  B: 0x0055ff, // blue
  inside: 0x111111,
};

function makeCubie(x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x * GAP, y * GAP, z * GAP);

  // Core (dark)
  const coreGeo = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
  const coreMat = new THREE.MeshLambertMaterial({ color: FACE_COLORS.inside });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  // Stickers: thin planes slightly offset from each face
  const stickerGeo = new THREE.PlaneGeometry(CUBIE_SIZE * 0.82, CUBIE_SIZE * 0.82);
  const offset = CUBIE_SIZE / 2 + 0.005;

  const stickers: Array<{ face: FaceName; pos: [number, number, number]; rot: [number, number, number] }> = [
    { face: "U", pos: [0, offset, 0], rot: [-Math.PI / 2, 0, 0] },
    { face: "D", pos: [0, -offset, 0], rot: [Math.PI / 2, 0, 0] },
    { face: "R", pos: [offset, 0, 0], rot: [0, Math.PI / 2, 0] },
    { face: "L", pos: [-offset, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { face: "F", pos: [0, 0, offset], rot: [0, 0, 0] },
    { face: "B", pos: [0, 0, -offset], rot: [0, Math.PI, 0] },
  ];

  for (const { face, pos, rot } of stickers) {
    const shouldShow =
      (face === "U" && y === 1) ||
      (face === "D" && y === -1) ||
      (face === "R" && x === 1) ||
      (face === "L" && x === -1) ||
      (face === "F" && z === 1) ||
      (face === "B" && z === -1);

    if (!shouldShow) continue;

    const mat = new THREE.MeshLambertMaterial({ color: FACE_COLORS[face] });
    const mesh = new THREE.Mesh(stickerGeo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    group.add(mesh);
  }

  return group;
}

export class CubeEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  private cubies: THREE.Group[] = [];
  private animating = false;
  private queue: ParsedMove[] = [];
  private pivotGroup: THREE.Group | null = null;
  private animStart = 0;
  private animTarget = 0;
  private animAxis = new THREE.Vector3();
  private animCubies: THREE.Group[] = [];
  private onQueueEmpty?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);

    this.camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
    this.camera.position.set(4, 3.5, 5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.width, canvas.height);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 8, 5);
    this.scene.add(dir);

    this.buildCube();
  }

  private buildCube() {
    this.cubies = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue; // core
          const cubie = makeCubie(x, y, z);
          this.cubies.push(cubie);
          this.scene.add(cubie);
        }
      }
    }
  }

  reset() {
    this.queue = [];
    this.animating = false;
    if (this.pivotGroup) {
      this.scene.remove(this.pivotGroup);
      this.pivotGroup = null;
    }
    this.cubies.forEach((c) => this.scene.remove(c));
    this.buildCube();
  }

  enqueueMove(move: ParsedMove) {
    this.queue.push(move);
    if (!this.animating) this.processNext();
  }

  enqueueMoves(moves: ParsedMove[], onDone?: () => void) {
    this.queue.push(...moves);
    this.onQueueEmpty = onDone;
    if (!this.animating) this.processNext();
  }

  private processNext() {
    const move = this.queue.shift();
    if (!move) {
      this.animating = false;
      this.onQueueEmpty?.();
      return;
    }
    this.animating = true;
    this.startMoveAnim(move);
  }

  private getCubiesInLayer(face: FaceName): THREE.Group[] {
    const { axis, val } = FACE_LAYER[face];
    return this.cubies.filter(
      (c) => Math.round(c.position[axis]) === val
    );
  }

  private startMoveAnim(move: ParsedMove) {
    const layerCubies = this.getCubiesInLayer(move.face);
    const pivot = new THREE.Group();
    this.scene.add(pivot);

    for (const c of layerCubies) {
      this.scene.remove(c);
      pivot.add(c);
    }

    this.pivotGroup = pivot;
    this.animCubies = layerCubies;
    this.animAxis = FACE_AXIS[move.face].clone();
    const sign = move.dir === -1 ? 1 : -1; // Three.js rotation direction
    this.animTarget = (Math.PI / 2) * Math.abs(move.dir) * sign;
    this.animStart = performance.now();
  }

  tickAnimation(now: number): boolean {
    if (!this.animating || !this.pivotGroup) return false;

    const elapsed = now - this.animStart;
    const totalDuration = ANIM_DURATION * Math.abs(this.animTarget) / (Math.PI / 2);
    const t = Math.min(elapsed / totalDuration, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out

    const currentAngle = this.animTarget * eased;
    this.pivotGroup.setRotationFromAxisAngle(this.animAxis, currentAngle);

    if (t >= 1) {
      // Snap to exact rotation and detach cubies
      this.pivotGroup.setRotationFromAxisAngle(this.animAxis, this.animTarget);
      this.pivotGroup.updateMatrixWorld();

      for (const c of this.animCubies) {
        this.pivotGroup.remove(c);
        c.applyMatrix4(this.pivotGroup.matrixWorld);
        // Round positions to avoid floating point drift
        c.position.set(
          Math.round(c.position.x),
          Math.round(c.position.y),
          Math.round(c.position.z)
        );
        // Normalize quaternion
        c.quaternion.normalize();
        this.scene.add(c);
      }

      this.scene.remove(this.pivotGroup);
      this.pivotGroup = null;
      this.processNext();
    }

    return true;
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
