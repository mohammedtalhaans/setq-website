import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import MachineAnnotation from "./MachineAnnotation.jsx";
import "../styles/gym-scene.css";

const ZONES = ["strength", "cardio", "recovery"];
const LABELS = {
  strength: "Strength machines",
  cardio: "Cardio",
  recovery: "Open floor",
};
const PI = Math.PI;
const EQUIPMENT_TOP_ANCHORS = {
  "lat-pulldown": [-3.82, 2.57, -1.93],
  "cable-station": [-1.47, 2.7, -2.61],
  "chest-press": [-3.38, 2.05, -0.12],
  "bench-01": [-1.38, 0.8, 0.43],
  "bench-02": [-3.82, 0.8, 2.52],
  "dumbbell-rack": [-3.63, 1.16, 3.28],
  "treadmill-01": [1.51, 1.61, -2.61],
  "treadmill-02": [2.81, 1.61, -2.61],
  "bike-01": [4.15, 1.43, -2.26],
  "mat-01": [1.44, 0.34, 2.19],
  "mat-02": [3.23, 0.34, 2.19],
  "kettlebell-rack": [4.37, 0.52, 1.83],
};

// Anchors sit near the machine base so an HTML card has room above it on a
// narrow screen. pickPoint lies on an actual visible equipment surface.
export const GYM_EQUIPMENT = [
  {
    id: "lat-pulldown",
    name: "Lat pulldown",
    zone: "strength",
    floor: [-3.82, 0.055, -1.94],
    anchor: [-3.82, 0.35, -1.62],
    pickPoint: [-3.82, 0.72, -2.19],
    footprint: [1.38, 1.88],
  },
  {
    id: "cable-station",
    name: "Dual cable station",
    zone: "strength",
    floor: [-1.47, 0.055, -2.61],
    anchor: [-1.47, 0.35, -2.4],
    pickPoint: [-0.66, 0.75, -2.5],
    footprint: [2.13, 1.3],
  },
  {
    id: "chest-press",
    name: "Chest press",
    zone: "strength",
    floor: [-3.38, 0.055, 0.33],
    anchor: [-3.38, 0.35, 0.5],
    pickPoint: [-3.38, 1.36, 0.02],
    footprint: [1.56, 1.85],
  },
  {
    id: "bench-01",
    name: "Adjustable bench",
    zone: "strength",
    floor: [-1.38, 0.055, 0.43],
    anchor: [-1.38, 0.3, 0.48],
    pickPoint: [-1.33, 0.72, 0.19],
    footprint: [1.02, 1.94],
    rotation: -0.22,
  },
  {
    id: "bench-02",
    name: "Flat bench",
    zone: "recovery",
    floor: [-3.82, 0.055, 2.52],
    anchor: [-3.82, 0.3, 2.52],
    pickPoint: [-4.08, 0.72, 2.52],
    footprint: [1.02, 1.94],
    rotation: PI / 2,
  },
  {
    id: "dumbbell-rack",
    name: "Dumbbell rack",
    zone: "recovery",
    floor: [-3.63, 0.055, 3.28],
    anchor: [-3.63, 0.3, 3.28],
    pickPoint: [-3.63, 0.92, 3.29],
    footprint: [2.98, 0.76],
  },
  {
    id: "treadmill-01",
    name: "Treadmill 01",
    zone: "cardio",
    floor: [1.51, 0.055, -1.8],
    anchor: [1.51, 0.28, -1.5],
    pickPoint: [1.51, 0.256, -1.12],
    footprint: [1.15, 2.5],
  },
  {
    id: "treadmill-02",
    name: "Treadmill 02",
    zone: "cardio",
    floor: [2.81, 0.055, -1.8],
    anchor: [2.81, 0.28, -1.5],
    pickPoint: [2.81, 0.256, -1.12],
    footprint: [1.15, 2.5],
  },
  {
    id: "bike-01",
    name: "Stationary bike",
    zone: "cardio",
    floor: [4.15, 0.055, -1.64],
    anchor: [4.15, 0.3, -1.45],
    pickPoint: [4.23, 0.52, -1.92],
    footprint: [0.95, 1.68],
  },
  {
    id: "mat-01",
    name: "Stretching station 01",
    zone: "recovery",
    floor: [1.44, 0.055, 2.19],
    anchor: [1.44, 0.14, 2.19],
    pickPoint: [1.44, 0.088, 1.89],
    footprint: [1.06, 1.98],
  },
  {
    id: "mat-02",
    name: "Stretching station 02",
    zone: "recovery",
    floor: [3.23, 0.055, 2.19],
    anchor: [3.23, 0.14, 2.19],
    pickPoint: [2.92, 0.09, 1.72],
    footprint: [1.06, 1.98],
  },
  {
    id: "kettlebell-rack",
    name: "Kettlebell set",
    zone: "recovery",
    floor: [4.37, 0.055, 1.83],
    anchor: [4.37, 0.19, 1.83],
    pickPoint: [4.37, 0.28, 1.33],
    footprint: [0.65, 1.55],
  },
].map((item) => ({ ...item, topAnchor: EQUIPMENT_TOP_ANCHORS[item.id] }));
const EQUIPMENT_BY_ID = Object.fromEntries(
  GYM_EQUIPMENT.map((item) => [item.id, item]),
);

function equipmentForHit(event) {
  if (event.object.userData.equipmentId)
    return event.object.userData.equipmentId;
  const ranges = event.object.userData.equipmentRanges;
  if (!ranges || event.faceIndex == null) return null;
  // Per-material batches retain triangle intervals from the original pieces.
  // Raycasting remains exact without adding large invisible collision volumes.
  let low = 0,
    high = ranges.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1,
      range = ranges[mid];
    if (event.faceIndex < range.start) high = mid - 1;
    else if (event.faceIndex >= range.end) low = mid + 1;
    else return range.id;
  }
  return null;
}

/** All geometry is original. One scene unit is approximately one metre. */
function buildGym() {
  const root = new THREE.Group();
  root.name = "SetQ architectural gym — illustrative";
  const resources = {
    geometries: new Set(),
    materials: new Set(),
    textures: new Set(),
  };
  const batches = new Map();
  let equipmentId = null;
  const dynamic = {};
  const inlays = {};
  const material = (color, roughness = 0.7, metalness = 0, extra = {}) => {
    const result = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      ...extra,
    });
    resources.materials.add(result);
    return result;
  };
  const m = {
    plaster: material("#e9e4d8", 0.96),
    ivory: material("#f6f3e9", 0.76),
    stone: material("#cfc8b7", 0.88),
    wood: material("#b09b78", 0.67),
    woodDark: material("#81674f", 0.78),
    steel: material("#5a4232", 0.39, 0.42),
    rubber: material("#292720", 0.91),
    leather: material("#79604a", 0.64),
    sage: material("#889775", 0.75),
    sageDark: material("#56634e", 0.79),
    chrome: material("#b8b9ad", 0.29, 0.83),
    brass: material("#ae9468", 0.32, 0.74),
    screen: material("#343b32", 0.5),
    light: material("#e4d3ad", 0.7, 0, {
      emissive: "#e4d3ad",
      emissiveIntensity: 0.25,
    }),
    skin: material("#b28b6c", 0.86),
    clothing: material("#e5dcca", 0.89),
  };

  // Deterministic paper-scale grain. Small, local maps avoid external requests.
  const grain = document.createElement("canvas");
  grain.width = grain.height = 128;
  const ctx = grain.getContext("2d");
  ctx.fillStyle = "#b5a481";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 110; i++) {
    ctx.strokeStyle = `rgba(70,49,27,${0.03 + (i % 7) * 0.008})`;
    ctx.beginPath();
    ctx.moveTo((i * 17) % 128, 0);
    ctx.bezierCurveTo(
      ((i * 17) % 128) + 3,
      35,
      ((i * 17) % 128) - 2,
      85,
      ((i * 17) % 128) + 1,
      128,
    );
    ctx.stroke();
  }
  const woodMap = new THREE.CanvasTexture(grain);
  woodMap.colorSpace = THREE.SRGBColorSpace;
  woodMap.wrapS = woodMap.wrapT = THREE.RepeatWrapping;
  resources.textures.add(woodMap);
  m.wood.map = woodMap;
  m.wood.color.set("#ffffff");

  const add = (
    geometry,
    mat,
    parent = root,
    pos = [0, 0, 0],
    rotation = [0, 0, 0],
    merged = true,
  ) => {
    if (merged && parent === root) {
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(...pos),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
        new THREE.Vector3(1, 1, 1),
      );
      const geom = geometry.index ? geometry.toNonIndexed() : geometry;
      if (geom !== geometry) geometry.dispose();
      geom.applyMatrix4(matrix);
      geom.clearGroups();
      geom.userData.equipmentId = equipmentId;
      if (!batches.has(mat)) batches.set(mat, []);
      batches.get(mat).push(geom);
      return null;
    }
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(...pos);
    object.rotation.set(...rotation);
    object.castShadow = object.receiveShadow = true;
    object.userData.equipmentId = equipmentId;
    parent.add(object);
    resources.geometries.add(geometry);
    return object;
  };
  const box = (
    w,
    h,
    d,
    pos,
    mat = m.steel,
    radius = 0.025,
    parent = root,
    rotation = [0, 0, 0],
  ) =>
    add(
      radius
        ? new RoundedBoxGeometry(
            w,
            h,
            d,
            2,
            Math.min(radius, w / 2, h / 2, d / 2),
          )
        : new THREE.BoxGeometry(w, h, d),
      mat,
      parent,
      pos,
      rotation,
    );
  const cylinder = (
    r,
    h,
    pos,
    mat = m.chrome,
    parent = root,
    rotation = [0, 0, 0],
    rTop = r,
  ) =>
    add(new THREE.CylinderGeometry(rTop, r, h, 18), mat, parent, pos, rotation);
  const sphere = (r, pos, mat = m.rubber, parent = root) =>
    add(new THREE.SphereGeometry(r, 16, 12), mat, parent, pos);
  const rod = (a, b, r = 0.025, mat = m.steel, parent = root) => {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b),
      dir = end.clone().sub(start);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    const e = new THREE.Euler().setFromQuaternion(q);
    return add(
      new THREE.CylinderGeometry(r, r, dir.length(), 12),
      mat,
      parent,
      start.add(end).multiplyScalar(0.5).toArray(),
      e.toArray().slice(0, 3),
    );
  };
  const cable = (points, r = 0.011, mat = m.rubber, parent = root) =>
    add(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        points.length * 5,
        r,
        6,
        false,
      ),
      mat,
      parent,
    );
  const torus = (r, tube, pos, mat, rotation = [PI / 2, 0, 0], parent = root) =>
    add(new THREE.TorusGeometry(r, tube, 6, 24), mat, parent, pos, rotation);
  const text = (
    str,
    w,
    h,
    pos,
    color = "#5a4232",
    rotation = [0, 0, 0],
    font = "500 120px Arial",
  ) => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = Math.max(128, Math.round((1024 * h) / w));
    const context = c.getContext("2d");
    context.fillStyle = color;
    context.font = font;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(str, 512, c.height / 2);
    const map = new THREE.CanvasTexture(c);
    // Front-facing wall planes use increasing U along world +X. Keep canvas
    // Y correction explicit; a horizontal texture flip would mirror SetQ.
    map.flipY = true;
    map.anisotropy = 4;
    map.colorSpace = THREE.SRGBColorSpace;
    resources.textures.add(map);
    const mat = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    resources.materials.add(mat);
    const mesh = add(
      new THREE.PlaneGeometry(w, h),
      mat,
      root,
      pos,
      rotation,
      false,
    );
    mesh.castShadow = false;
  };

  // Grounding is a deliberately soft studio shadow, plus physical key shadows.
  const shade = document.createElement("canvas");
  shade.width = shade.height = 128;
  const sh = shade.getContext("2d");
  const gradient = sh.createRadialGradient(64, 64, 10, 64, 64, 64);
  gradient.addColorStop(0, "rgba(49,39,28,.24)");
  gradient.addColorStop(0.62, "rgba(49,39,28,.12)");
  gradient.addColorStop(1, "rgba(49,39,28,0)");
  sh.fillStyle = gradient;
  sh.fillRect(0, 0, 128, 128);
  const shadeMap = new THREE.CanvasTexture(shade);
  resources.textures.add(shadeMap);
  const shadeMat = new THREE.MeshBasicMaterial({
    map: shadeMap,
    transparent: true,
    depthWrite: false,
  });
  resources.materials.add(shadeMat);
  const contact = (x, z, w, d, y = 0.005) => {
    const mesh = add(
      new THREE.PlaneGeometry(w, d),
      shadeMat,
      root,
      [x, y, z],
      [-PI / 2, 0, 0],
      false,
    );
    mesh.castShadow = mesh.receiveShadow = false;
    mesh.raycast = () => {};
  };
  contact(0, 0, 15.6, 12.4, -0.48);
  box(11.2, 0.42, 8.1, [0, -0.25, 0], m.plaster, 0.2);
  box(10.98, 0.035, 7.88, [0, -0.023, 0], m.wood, 0.015);
  box(11.03, 0.038, 7.93, [0, -0.08, 0], m.brass, 0.05);
  // Thin oak floor boards and restrained seams add a believable scale.
  for (let x = -5.15; x < 5.5; x += 0.45)
    box(0.008, 0.003, 7.7, [x, 0.001, 0], m.woodDark, 0);
  for (let z = -2.9; z < 3.9; z += 1.85) {
    for (let i = 0; i < 12; i++)
      box(
        0.445,
        0.003,
        0.007,
        [-5.15 + i * 0.9 + (z > 0 ? 0.45 : 0), 0.002, z],
        m.woodDark,
        0,
      );
  }

  // Low cutaway architecture leaves the foreground equipment readable.
  box(11.2, 0.72, 0.19, [0, 0.34, -3.92], m.plaster, 0.055);
  box(0.18, 0.72, 7.88, [-5.49, 0.34, 0], m.plaster, 0.045);
  box(11.2, 0.065, 0.23, [0, 0.73, -3.92], m.stone, 0.035);
  box(0.23, 0.065, 7.9, [-5.49, 0.73, 0], m.stone, 0.035);
  box(2.95, 2.28, 0.16, [-3.65, 1.14, -3.93], m.plaster, 0.05);
  for (let i = 0; i < 15; i++)
    box(0.075, 2.22, 0.11, [-5 + i * 0.19, 1.16, -3.805], m.wood, 0.015);
  box(2.99, 0.055, 0.21, [-3.65, 2.32, -3.92], m.woodDark, 0.015);
  // The wall signature is understated, as on a real fitness studio wall.
  box(2.0, 1.37, 0.14, [0.35, 1.05, -3.94], m.plaster, 0.025);
  text(
    "SetQ",
    1.52,
    0.64,
    [0.35, 1.15, -3.855],
    "#5a4232",
    [0, 0, 0],
    "600 340px Arial",
  );
  text(
    "A MORE CONNECTED FLOOR",
    1.55,
    0.13,
    [0.35, 0.73, -3.85],
    "#88775c",
    [0, 0, 0],
    "500 51px Arial",
  );
  // Rail lighting, a wash of daylight, and a short architectural window.
  box(3.1, 0.06, 0.06, [2.72, 2.13, -3.68], m.brass, 0.012);
  box(3, 0.022, 0.045, [2.72, 2.087, -3.68], m.light, 0.008);
  for (let i = 0; i < 3; i++) {
    const x = 1.7 + i * 1.02;
    box(0.08, 1.48, 0.09, [x, 1.15, -3.89], m.wood, 0.014);
  }

  function zoneInlay(id, x, z, w, d) {
    const mat = material("#a9b198", 0.93);
    const slab = add(
      new RoundedBoxGeometry(w, 0.018, d, 3, 0.035),
      mat,
      root,
      [x, 0.012, z],
      [0, 0, 0],
      false,
    );
    slab.castShadow = false;
    inlays[id] = mat;
    // A quiet brass threshold separates material zones.
    box(w - 0.12, 0.012, 0.025, [x, 0.03, z + d / 2 - 0.06], m.brass, 0.006);
    return slab;
  }
  zoneInlay("strength", -2.48, -0.62, 5.65, 5.66);
  zoneInlay("cardio", 2.42, -1.4, 3.66, 4.12);
  zoneInlay("recovery", 2.54, 2.19, 3.98, 2.26);
  text(
    "STRENGTH",
    1.25,
    0.14,
    [-2.5, 0.04, 2.16],
    "#627053",
    [-PI / 2, 0, 0],
    "500 70px Arial",
  );
  text(
    "CARDIO",
    0.9,
    0.14,
    [2.42, 0.04, 0.65],
    "#627053",
    [-PI / 2, 0, 0],
    "500 70px Arial",
  );

  // Original distance-field mark: one finite, non-additive sage ring. The
  // distance + smoothstep construction follows The Book of Shaders ch. 5/7.
  // It is a visual activity cue, not a claimed ultrasonic field of view.
  const signal = new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 1 },
      uEnabled: { value: 0 },
      uColor: { value: new THREE.Color("#56634e") },
    },
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 vUv;
      uniform float uProgress; uniform float uEnabled; uniform vec3 uColor;
      void main() {
        float d = distance(vUv, vec2(0.5));
        float radius = mix(0.13, 0.46, smoothstep(0.0, 1.0, uProgress));
        float band = 1.0 - smoothstep(0.005, 0.016, abs(d - radius));
        float fade = smoothstep(0.0, 0.16, uProgress) * (1.0 - smoothstep(0.58, 1.0, uProgress));
        gl_FragColor = vec4(uColor, band * fade * uEnabled * 0.32);
        #include <colorspace_fragment>
      }`,
  });
  resources.materials.add(signal);
  const signalPlane = add(
    new THREE.PlaneGeometry(2.12, 2.12),
    signal,
    root,
    [-3.38, 0.041, 0.33],
    [-PI / 2, 0, 0],
    false,
  );
  signalPlane.castShadow = signalPlane.receiveShadow = false;
  signalPlane.raycast = () => {};
  dynamic.signal = signal;

  function node(x, y, z, facing = 0) {
    const group = new THREE.Group();
    root.add(group);
    group.position.set(x, y, z);
    group.rotation.y = facing;
    box(0.115, 0.026, 0.094, [0, 0, 0], m.rubber, 0.014, group);
    box(0.12, 0.035, 0.098, [0, 0.03, 0], m.ivory, 0.019, group);
    cylinder(0.006, 0.006, [0.034, 0.049, -0.02], m.sageDark, group);
    box(0.012, 0.006, 0.034, [-0.041, 0.05, 0], m.brass, 0.002, group);
  }

  // Lat pulldown: a stack, guide rods, pulleys, seat and shaped pullbar.
  function latPulldown(x, z) {
    contact(x, z, 2.15, 2.5, 0.035);
    box(1.18, 0.13, 1.61, [x, 0.095, z], m.steel, 0.035);
    for (const dx of [-0.48, 0.48]) {
      box(0.1, 2.34, 0.1, [x + dx, 1.26, z - 0.47], m.steel, 0.022);
      box(0.23, 0.052, 0.25, [x + dx, 0.04, z - 0.47], m.rubber, 0.02);
      cylinder(0.027, 1.5, [x + dx * 0.62, 0.94, z - 0.45]);
    }
    box(1.16, 0.12, 0.28, [x, 2.45, z - 0.47], m.steel, 0.03);
    box(0.11, 0.11, 1.2, [x, 2.45, z + 0.01], m.steel, 0.022);
    box(0.74, 1.72, 0.12, [x, 1.1, z - 0.63], m.woodDark, 0.035);
    const stack = new THREE.Group();
    root.add(stack);
    stack.position.set(x, 0, z - 0.4);
    for (let i = 0; i < 11; i++) {
      box(0.57, 0.078, 0.31, [0, 0.29 + i * 0.087, 0], m.rubber, 0.015, stack);
      box(
        0.038,
        0.032,
        0.005,
        [0.24, 0.29 + i * 0.087, 0.158],
        m.brass,
        0.002,
        stack,
      );
    }
    cylinder(0.038, 0.13, [x + 0.16, 0.72, z - 0.16], m.brass, root, [
      PI / 2,
      0,
      0,
    ]);
    node(x + 0.24, 1.68, z - 0.44);
    cylinder(0.11, 0.08, [x, 2.48, z + 0.4], m.brass, root, [0, 0, PI / 2]);
    cable([
      [x, 1.27, z - 0.4],
      [x, 2.5, z - 0.4],
      [x, 2.5, z + 0.43],
      [x, 2.04, z + 0.44],
    ]);
    cable(
      [
        [x - 0.57, 1.91, z + 0.44],
        [x - 0.4, 2.07, z + 0.44],
        [x, 2.11, z + 0.44],
        [x + 0.4, 2.07, z + 0.44],
        [x + 0.57, 1.91, z + 0.44],
      ],
      0.037,
      m.chrome,
    );
    for (const dx of [-0.5, 0.5])
      rod(
        [x + dx, 1.96, z + 0.44],
        [x + dx * 1.25, 1.85, z + 0.44],
        0.044,
        m.rubber,
      );
    box(0.075, 0.61, 0.075, [x, 0.41, z + 0.36], m.steel, 0.01);
    box(0.56, 0.14, 0.56, [x, 0.74, z + 0.32], m.leather, 0.062);
    box(0.56, 0.045, 0.05, [x, 0.81, z + 0.32], m.woodDark, 0.008);
    rod([x - 0.4, 0.94, z + 0.18], [x + 0.4, 0.94, z + 0.18], 0.032);
    for (const dx of [-0.24, 0.24])
      cylinder(0.1, 0.3, [x + dx, 0.96, z + 0.18], m.leather, root, [
        0,
        0,
        PI / 2,
      ]);
    dynamic.stack = stack;
  }
  equipmentId = "lat-pulldown";
  latPulldown(-3.82, -1.94);
  equipmentId = null;

  // Two-sided functional trainer, recognisable from its cable paths and handles.
  function cableStation(x, z) {
    contact(x, z, 2.68, 1.35, 0.035);
    for (const dx of [-0.81, 0.81]) {
      box(0.39, 0.13, 0.98, [x + dx, 0.095, z], m.steel, 0.04);
      box(0.13, 2.5, 0.13, [x + dx, 1.36, z], m.steel, 0.025);
      box(0.41, 2.2, 0.17, [x + dx, 1.22, z - 0.2], m.woodDark, 0.035);
      cylinder(0.032, 2.02, [x + dx, 1.18, z + 0.1]);
      for (let i = 0; i < 9; i++)
        box(
          0.35,
          0.075,
          0.24,
          [x + dx, 0.3 + i * 0.088, z - 0.01],
          m.rubber,
          0.015,
        );
      box(0.2, 0.25, 0.18, [x + dx, 1.6, z + 0.12], m.chrome, 0.015);
      cylinder(0.092, 0.06, [x + dx, 1.6, z + 0.25], m.brass, root, [
        PI / 2,
        0,
        0,
      ]);
      cable(
        [
          [x + dx, 2.49, z + 0.1],
          [x + dx, 1.6, z + 0.28],
          [x + dx * 0.58, 1.18, z + 0.5],
        ],
        0.012,
      );
      const hx = x + dx * 0.58;
      cable(
        [
          [hx, 1.17, z + 0.5],
          [hx - 0.09, 1.03, z + 0.5],
          [hx + 0.09, 1.03, z + 0.5],
          [hx, 1.17, z + 0.5],
        ],
        0.025,
        m.rubber,
      );
      node(x + dx, 1.35, z - 0.07);
    }
    box(1.94, 0.12, 0.14, [x, 2.64, z], m.steel, 0.032);
    rod([x - 0.6, 2.64, z + 0.17], [x + 0.6, 2.64, z + 0.17], 0.035, m.chrome);
    box(1.66, 0.045, 0.05, [x, 2.58, z + 0.09], m.brass, 0.01);
  }
  equipmentId = "cable-station";
  cableStation(-1.47, -2.61);
  equipmentId = null;

  // Chest press with individual arms, pivot bosses and upholstered back pad.
  function chestPress(x, z) {
    contact(x, z, 2.24, 2.12, 0.035);
    box(1.12, 0.14, 1.53, [x, 0.105, z], m.steel, 0.045);
    for (const dx of [-0.43, 0.43]) {
      rod([x + dx, 0.17, z - 0.45], [x + dx, 1.98, z - 0.45], 0.057);
      box(0.23, 0.09, 0.35, [x + dx, 0.04, z - 0.45], m.rubber, 0.025);
      cylinder(0.12, 0.1, [x + dx, 1.57, z - 0.38], m.brass, root, [
        0,
        0,
        PI / 2,
      ]);
      rod([x + dx, 1.57, z - 0.36], [x + dx * 1.52, 1.14, z + 0.46], 0.042);
      rod(
        [x + dx * 1.52, 1.14, z + 0.46],
        [x + dx * 0.95, 1.14, z + 0.58],
        0.038,
        m.chrome,
      );
      cylinder(0.052, 0.23, [x + dx, 1.14, z + 0.58], m.rubber, root, [
        0,
        0,
        PI / 2,
      ]);
    }
    box(0.72, 1.5, 0.21, [x, 1.0, z - 0.66], m.woodDark, 0.07);
    for (let i = 0; i < 10; i++)
      box(0.49, 0.074, 0.24, [x, 0.24 + i * 0.085, z - 0.44], m.rubber, 0.01);
    box(0.09, 0.72, 0.1, [x, 0.52, z + 0.04], m.steel, 0.02);
    box(0.51, 0.16, 0.55, [x, 0.81, z + 0.15], m.sageDark, 0.06);
    box(
      0.48,
      0.75,
      0.14,
      [x, 1.38, z - 0.05],
      m.sageDark,
      0.055,
      root,
      [-0.13, 0, 0],
    );
    node(x + 0.24, 1.63, z - 0.57);
  }
  equipmentId = "chest-press";
  chestPress(-3.38, 0.33);
  equipmentId = null;

  function bench(x, z, angle = 0) {
    // A separate local assembly permits natural, non-grid orientation.
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = angle;
    root.add(group);
    box(
      0.58,
      0.14,
      1.12,
      [0, 0.65, -0.26],
      m.leather,
      0.075,
      group,
      [-0.12, 0, 0],
    );
    box(0.58, 0.14, 0.49, [0, 0.61, 0.58], m.leather, 0.065, group);
    box(
      0.48,
      0.023,
      0.01,
      [0, 0.723, -0.26],
      m.woodDark,
      0.002,
      group,
      [-0.12, 0, 0],
    );
    rod([0, 0.52, -0.7], [0, 0.52, 0.8], 0.055, m.steel, group);
    for (const dz of [-0.65, 0.66]) {
      rod([0, 0.53, dz], [0, 0.14, dz + 0.17], 0.062, m.steel, group);
      box(0.8, 0.09, 0.15, [0, 0.09, dz + 0.17], m.steel, 0.025, group);
      for (const dx of [-0.34, 0.34])
        box(0.16, 0.07, 0.2, [dx, 0.035, dz + 0.17], m.rubber, 0.022, group);
    }
    rod([0, 0.2, -0.54], [0, 0.49, 0.27], 0.025, m.brass, group);
    contact(x, z, 1.28, 2.06, 0.035);
  }
  equipmentId = "bench-01";
  bench(-1.38, 0.43, -0.22);
  equipmentId = "bench-02";
  bench(-3.82, 2.52, PI / 2);
  equipmentId = null;

  function dumbbell(x, y, z, r = 0.095, parent = root) {
    rod([x - 0.18, y, z], [x + 0.18, y, z], 0.027, m.chrome, parent);
    for (const dx of [-0.16, 0.16]) {
      cylinder(r, 0.1, [x + dx, y, z], m.rubber, parent, [0, 0, PI / 2]);
      cylinder(r * 0.6, 0.008, [x + dx * 1.34, y, z], m.brass, parent, [
        0,
        0,
        PI / 2,
      ]);
    }
  }
  // A populated freeweight rack, not identical generic blocks.
  equipmentId = "dumbbell-rack";
  for (const x of [-4.95, -2.3]) {
    box(0.1, 0.9, 0.1, [x, 0.48, 3.3], m.steel, 0.02);
    box(0.34, 0.08, 0.54, [x, 0.06, 3.29], m.steel, 0.025);
  }
  for (const y of [0.44, 0.9]) {
    box(2.78, 0.06, 0.35, [-3.63, y, 3.28], m.steel, 0.01, root, [0.12, 0, 0]);
    box(2.78, 0.044, 0.025, [-3.63, y + 0.07, 3.44], m.brass, 0.006);
    for (let i = 0; i < 7; i++)
      dumbbell(-4.71 + i * 0.36, y + 0.13, 3.28, 0.07 + i * 0.008);
  }

  equipmentId = null;
  function treadmill(x, z) {
    contact(x, z, 1.45, 2.92, 0.036);
    box(0.99, 0.16, 2.28, [x, 0.14, z], m.steel, 0.095);
    box(0.71, 0.032, 1.91, [x, 0.236, z + 0.12], m.rubber, 0.04);
    for (const dx of [-0.45, 0.45]) {
      box(0.105, 0.045, 2.12, [x + dx, 0.235, z + 0.02], m.chrome, 0.025);
      rod([x + dx, 0.18, z - 0.91], [x + dx, 1.38, z - 0.78], 0.044);
      rod([x + dx, 1.38, z - 0.78], [x + dx, 1.18, z + 0.02], 0.038);
      rod([x + dx, 1.21, z - 0.12], [x + dx, 1.18, z + 0.04], 0.045, m.rubber);
    }
    box(
      0.77,
      0.16,
      0.45,
      [x, 1.42, z - 0.81],
      m.steel,
      0.07,
      root,
      [0.48, 0, 0],
    );
    box(
      0.3,
      0.015,
      0.25,
      [x, 1.507, z - 0.78],
      m.screen,
      0.024,
      root,
      [0.48, 0, 0],
    );
    box(
      0.15,
      0.005,
      0.028,
      [x, 1.558, z - 0.83],
      m.sage,
      0.005,
      root,
      [0.48, 0, 0],
    );
    for (const dx of [-0.27, 0.27])
      cylinder(
        0.072,
        0.02,
        [x + dx, 1.5, z - 0.74],
        m.rubber,
        root,
        [0.48, 0, 0],
      );
    for (let i = 0; i < 8; i++)
      box(0.66, 0.004, 0.006, [x, 0.256, z - 0.65 + i * 0.21], m.stone, 0.002);
    box(0.9, 0.09, 0.15, [x, 0.26, z + 1.08], m.rubber, 0.045);
  }
  equipmentId = "treadmill-01";
  treadmill(1.51, -1.8);
  equipmentId = "treadmill-02";
  treadmill(2.81, -1.8);
  equipmentId = null;

  function bike(x, z) {
    contact(x, z, 1.28, 1.8, 0.036);
    for (const dz of [-0.52, 0.56])
      box(0.72, 0.1, 0.13, [x, 0.08, z + dz], m.steel, 0.04);
    rod([x, 0.14, z - 0.52], [x, 0.64, z + 0.26], 0.074);
    rod([x, 0.16, z + 0.56], [x, 0.64, z + 0.26], 0.06);
    cylinder(0.35, 0.14, [x, 0.52, z - 0.28], m.steel, root, [0, 0, PI / 2]);
    cylinder(0.24, 0.155, [x, 0.52, z - 0.28], m.brass, root, [0, 0, PI / 2]);
    cylinder(0.225, 0.165, [x, 0.52, z - 0.28], m.rubber, root, [0, 0, PI / 2]);
    rod([x, 0.58, z + 0.22], [x, 1.05, z + 0.29], 0.035, m.chrome);
    box(0.38, 0.1, 0.3, [x, 1.06, z + 0.3], m.leather, 0.08);
    rod([x, 0.42, z - 0.43], [x, 1.29, z - 0.6], 0.036, m.chrome);
    cable(
      [
        [x - 0.29, 1.38, z - 0.73],
        [x - 0.29, 1.31, z - 0.5],
        [x, 1.29, z - 0.52],
        [x + 0.29, 1.31, z - 0.5],
        [x + 0.29, 1.38, z - 0.73],
      ],
      0.033,
      m.rubber,
    );
    box(
      0.26,
      0.03,
      0.22,
      [x, 1.34, z - 0.61],
      m.screen,
      0.025,
      root,
      [0.24, 0, 0],
    );
    const crank = new THREE.Group();
    root.add(crank);
    crank.position.set(x, 0.48, z + 0.05);
    rod([-0.13, 0, 0], [-0.13, 0.14, 0.11], 0.021, m.chrome, crank);
    rod([0.13, 0, 0], [0.13, -0.14, -0.11], 0.021, m.chrome, crank);
    box(0.16, 0.035, 0.1, [-0.18, 0.14, 0.11], m.rubber, 0.01, crank);
    box(0.16, 0.035, 0.1, [0.18, -0.14, -0.11], m.rubber, 0.01, crank);
    dynamic.crank = crank;
  }
  equipmentId = "bike-01";
  bike(4.15, -1.64);
  equipmentId = null;

  // Open floor: aligned mats, cork rollers, a towel and small weights.
  for (const x of [1.44, 3.23]) {
    equipmentId = x === 1.44 ? "mat-01" : "mat-02";
    box(0.87, 0.045, 1.8, [x, 0.055, 2.19], m.sageDark, 0.12);
    box(0.81, 0.008, 1.7, [x, 0.082, 2.19], m.sage, 0.095);
    cylinder(0.105, 0.61, [x + 0.2, 0.18, 2.74], m.wood, root, [0, 0, PI / 2]);
    box(0.33, 0.085, 0.18, [x - 0.15, 0.13, 1.42], m.woodDark, 0.025);
    dumbbell(x - 0.12, 0.18, 2.26, 0.09);
  }
  equipmentId = null;
  // Kettlebells with dark handles and brass collars.
  equipmentId = "kettlebell-rack";
  for (let i = 0; i < 3; i++) {
    const x = 4.37,
      z = 1.33 + i * 0.5;
    sphere(0.16 + i * 0.016, [x, 0.19, z], i === 1 ? m.sageDark : m.steel);
    torus(0.108, 0.026, [x, 0.38 + i * 0.012, z], m.rubber, [0, 0, 0]);
    cylinder(0.08, 0.02, [x, 0.32 + i * 0.015, z], m.brass);
  }
  equipmentId = null;

  // Reception ledge, ribbed cabinetry, towels and water bottles.
  box(0.79, 0.94, 1.61, [4.73, 0.49, -3.04], m.woodDark, 0.05);
  for (let i = 0; i < 9; i++)
    box(0.041, 0.8, 0.05, [4.34, 0.5, -3.71 + i * 0.15], m.wood, 0.01);
  box(0.92, 0.075, 1.73, [4.7, 1.0, -3.03], m.ivory, 0.035);
  for (let i = 0; i < 3; i++)
    box(0.43, 0.07, 0.37, [4.72, 1.08 + i * 0.07, -3.28], m.clothing, 0.055);
  for (let i = 0; i < 2; i++) {
    cylinder(0.063, 0.28, [4.65 + i * 0.19, 1.17, -2.59], m.sageDark);
    cylinder(0.034, 0.04, [4.65 + i * 0.19, 1.33, -2.59], m.brass);
  }
  // Botanical leaves are broad ovals, not polygons floating around the hero.
  function plant(x, z, height = 1.24) {
    cylinder(0.25, 0.48, [x, 0.24, z], m.plaster, root, [0, 0, 0], 0.31);
    cylinder(0.235, 0.02, [x, 0.485, z], m.woodDark);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.399,
        y = 0.68 + (i * height) / 10;
      const dx = Math.cos(a) * 0.25,
        dz = Math.sin(a) * 0.25;
      rod([x, 0.46, z], [x + dx, y, z + dz], 0.012, m.woodDark);
      const leaf = new THREE.SphereGeometry(1, 10, 8);
      leaf.scale(0.12, 0.025, 0.3);
      leaf.rotateX(-0.52);
      leaf.rotateY(a);
      add(leaf, i % 2 ? m.sageDark : m.sage, root, [
        x + dx * 1.25,
        y + 0.06,
        z + dz * 1.25,
      ]);
    }
  }
  plant(-5.02, -3.24, 1.45);
  plant(5.0, 3.14, 1.15);

  // Finish static batches into approximately a dozen material draw calls.
  for (const [mat, geometries] of batches) {
    let triangleOffset = 0;
    const equipmentRanges = geometries.map((geometry) => {
      const start = triangleOffset;
      triangleOffset += geometry.attributes.position.count / 3;
      return { start, end: triangleOffset, id: geometry.userData.equipmentId };
    });
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((geometry) => geometry.dispose());
    if (!merged) throw new Error("Gym geometry could not be assembled");
    const mesh = new THREE.Mesh(merged, mat);
    mesh.userData.equipmentRanges = equipmentRanges;
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    resources.geometries.add(merged);
  }
  root.userData.dispose = () => {
    resources.geometries.forEach((value) => value.dispose());
    resources.materials.forEach((value) => value.dispose());
    resources.textures.forEach((value) => value.dispose());
  };
  return { root, dynamic, inlays };
}

function SceneContent({
  activeZone,
  onZoneChange,
  reducedMotion,
  visible,
  hovering,
  selectedId,
  onSelectEquipment,
  onProject,
  inspectionRefs,
  getCardSize,
  invalidateRef,
}) {
  const { camera, size, gl, scene, invalidate } = useThree();
  const gym = useMemo(buildGym, []);
  const motion = useRef({
    start: null,
    reveal: true,
    cameraStart: new THREE.Vector3(11, 9.8, 12.8),
  });
  const cameraTarget = useRef(new THREE.Vector3());
  const prevZone = useRef(activeZone);
  const shadowLight = useRef();
  const [hoveredId, setHoveredId] = useState(null);
  const projectionPoint = useRef(new THREE.Vector3());
  const lastProjection = useRef(null);
  const framing = useRef({
    start: null,
    fromX: 0,
    fromY: 0,
    x: 0,
    y: 0,
    fromZoom: 1,
    zoom: 1,
  });
  useEffect(() => {
    invalidateRef.current = invalidate;
    return () => {
      invalidateRef.current = null;
    };
  }, [invalidate, invalidateRef]);

  useEffect(() => {
    lastProjection.current = null;
    const frame = framing.current;
    frame.start = performance.now();
    frame.fromX = frame.x;
    frame.fromY = frame.y;
    frame.fromZoom = frame.zoom;
    invalidate();
  }, [selectedId, onProject, invalidate]);

  useEffect(
    () => () => {
      gl.domElement.style.cursor = "default";
    },
    [gl],
  );

  useEffect(() => {
    camera.zoom = Math.min(size.width / 14.4, size.height / 10.6);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  useEffect(() => {
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(environment, 0.06);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.32;
    environment.dispose();
    pmrem.dispose();
    invalidate();
    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, scene, invalidate]);

  useEffect(() => () => gym.root.userData.dispose(), [gym]);

  useEffect(() => {
    const changed = prevZone.current !== activeZone;
    prevZone.current = activeZone;
    Object.entries(gym.inlays).forEach(([zone, mat]) =>
      mat.color.set(zone === activeZone ? "#a3af8c" : "#c3c6b4"),
    );
    if (reducedMotion || !visible) {
      gym.root.scale.setScalar(1);
      gym.root.position.y = 0;
      gym.dynamic.stack.position.y = 0;
      gym.dynamic.crank.rotation.x = 0;
      gym.dynamic.signal.uniforms.uEnabled.value = 0;
      motion.current.start = null;
      camera.lookAt(0, 0.55, 0);
      invalidate();
      return;
    }
    if (changed || motion.current.reveal || hovering) {
      motion.current.start = performance.now();
      motion.current.cameraStart.copy(camera.position);
      invalidate();
    }
  }, [activeZone, reducedMotion, visible, hovering, gym, camera, invalidate]);

  useFrame(() => {
    if (!visible) return;
    if (!reducedMotion && motion.current.start !== null) {
      const elapsed = (performance.now() - motion.current.start) / 1000;
      const progress = Math.min(elapsed / 1.5, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const target =
        activeZone === "cardio"
          ? [10.1, 10.0, 13.5]
          : activeZone === "recovery"
            ? [11.8, 10.3, 12.4]
            : [11, 9.8, 12.8];
      cameraTarget.current.set(...target);
      camera.position.lerpVectors(
        motion.current.cameraStart,
        cameraTarget.current,
        ease,
      );
      camera.lookAt(0, 0.55, 0);
      if (motion.current.reveal) {
        gym.root.scale.setScalar(0.94 + 0.06 * ease);
        gym.root.position.y = -0.16 * (1 - ease);
      }
      gym.dynamic.stack.position.y =
        activeZone === "strength" ? Math.sin(progress * PI) * 0.18 : 0;
      gym.dynamic.crank.rotation.x =
        activeZone === "cardio" ? ease * PI * 2 : 0;
      gym.dynamic.signal.uniforms.uProgress.value = progress;
      gym.dynamic.signal.uniforms.uEnabled.value =
        activeZone === "strength" ? 1 : 0;
      if (shadowLight.current) shadowLight.current.shadow.needsUpdate = true;
      if (progress < 1) invalidate();
      else {
        motion.current.start = null;
        motion.current.reveal = false;
      }
    }

    // Projection runs only on a requested frame, including a final settled
    // frame after resize/selection. The HTML card is moved imperatively.
    camera.updateMatrixWorld();
    gym.root.updateMatrixWorld(true);
    const project = (point) => {
      projectionPoint.current
        .fromArray(point)
        .applyMatrix4(gym.root.matrixWorld)
        .project(camera);
      return {
        x: ((projectionPoint.current.x + 1) * size.width) / 2,
        y: ((1 - projectionPoint.current.y) * size.height) / 2,
      };
    };
    const frame = framing.current;
    const baseZoom = Math.min(size.width / 14.4, size.height / 10.6);
    const framingProgress =
      reducedMotion || frame.start === null
        ? 1
        : Math.min((performance.now() - frame.start) / 550, 1);
    const framingEase = 1 - Math.pow(1 - framingProgress, 3);
    let targetX = 0,
      targetY = 0,
      targetZoom = 1;
    camera.clearViewOffset();
    camera.zoom = baseZoom;
    camera.updateProjectionMatrix();
    if (selectedId) {
      const item = EQUIPMENT_BY_ID[selectedId],
        cardSize = getCardSize();
      const margin = size.width < 420 ? 12 : 18;
      const headY = cardSize.height + margin + 24;
      const bottom = size.height - 50;
      const head = project(item.topAnchor);
      const yaw = item.rotation || 0;
      let extent = 1;
      for (const dx of [-item.footprint[0] / 2, item.footprint[0] / 2]) {
        for (const dz of [-item.footprint[1] / 2, item.footprint[1] / 2]) {
          const point = project([
            item.floor[0] + dx * Math.cos(yaw) + dz * Math.sin(yaw),
            item.floor[1],
            item.floor[2] - dx * Math.sin(yaw) + dz * Math.cos(yaw),
          ]);
          extent = Math.max(extent, point.y - head.y);
        }
      }
      // Reduce scale only as far as needed to fit the selected equipment
      // between its annotation and the existing zone controls.
      targetZoom = Math.min(
        0.88,
        Math.max(0.08, (bottom - headY - 9) / extent),
      );
      const currentZoom =
        frame.fromZoom + (targetZoom - frame.fromZoom) * framingEase;
      camera.zoom = baseZoom * currentZoom;
      camera.updateProjectionMatrix();
      const focusedHead = project(item.topAnchor);
      targetX = focusedHead.x - size.width * 0.5;
      targetY = focusedHead.y - headY;
    }
    frame.zoom = frame.fromZoom + (targetZoom - frame.fromZoom) * framingEase;
    camera.zoom = baseZoom * frame.zoom;
    frame.x = frame.fromX + (targetX - frame.fromX) * framingEase;
    frame.y = frame.fromY + (targetY - frame.fromY) * framingEase;
    camera.setViewOffset(
      size.width,
      size.height,
      frame.x,
      frame.y,
      size.width,
      size.height,
    );
    if (framingProgress < 1) invalidate();
    else frame.start = null;
    for (const item of GYM_EQUIPMENT) {
      const button = inspectionRefs.current.get(item.id);
      if (!button) continue;
      const point = project(item.pickPoint);
      button.dataset.pickX = point.x.toFixed(1);
      button.dataset.pickY = point.y.toFixed(1);
    }
    if (selectedId) {
      const item = EQUIPMENT_BY_ID[selectedId];
      const point = project(item.topAnchor);
      const yaw = item.rotation || 0,
        offset = item.footprint[1] / 2;
      const floor = project([
        item.floor[0] + Math.sin(yaw) * offset,
        item.floor[1],
        item.floor[2] + Math.cos(yaw) * offset,
      ]);
      const next = {
        id: selectedId,
        ...point,
        width: size.width,
        height: size.height,
        floorX: floor.x,
        floorY: floor.y,
      };
      const previous = lastProjection.current;
      if (
        !previous ||
        previous.id !== next.id ||
        previous.width !== next.width ||
        previous.height !== next.height ||
        Math.abs(previous.x - next.x) > 0.5 ||
        Math.abs(previous.y - next.y) > 0.5 ||
        Math.abs(previous.floorX - next.floorX) > 0.5 ||
        Math.abs(previous.floorY - next.floorY) > 0.5
      ) {
        lastProjection.current = next;
        onProject(next);
      }
    }
  });

  const select = (event) => {
    event.stopPropagation();
    const id = equipmentForHit(event);
    onSelectEquipment(id);
  };
  const hover = (event) => {
    event.stopPropagation();
    const id = equipmentForHit(event);
    setHoveredId((previous) => (previous === id ? previous : id));
    gl.domElement.style.cursor = id ? "pointer" : "default";
  };
  return (
    <>
      <hemisphereLight args={["#fff6e4", "#b8ad91", 1.35]} />
      <directionalLight
        ref={shadowLight}
        position={[-4, 10, 6]}
        intensity={3.0}
        color="#fff4df"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-radius={8}
        shadow-intensity={0.78}
      />
      <directionalLight position={[8, 5, -5]} intensity={1.0} color="#ecede3" />
      <primitive
        object={gym.root}
        dispose={null}
        onClick={select}
        onPointerMove={hover}
        onPointerOut={() => {
          setHoveredId(null);
          gl.domElement.style.cursor = "default";
        }}
      >
        <EquipmentHighlight
          machine={EQUIPMENT_BY_ID[selectedId || hoveredId]}
          selected={Boolean(selectedId)}
        />
      </primitive>
    </>
  );
}

function EquipmentHighlight({ machine, selected }) {
  if (!machine) return null;
  const [width, depth] = machine.footprint;
  const points = new Float32Array([
    -width / 2,
    0,
    -depth / 2,
    width / 2,
    0,
    -depth / 2,
    width / 2,
    0,
    depth / 2,
    -width / 2,
    0,
    depth / 2,
  ]);
  return (
    <group
      position={machine.floor}
      rotation={[0, machine.rotation || 0, 0]}
      raycast={() => {}}
    >
      <lineLoop raycast={() => {}}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={selected ? "#5a4232" : "#889775"}
          transparent
          opacity={selected ? 0.8 : 0.55}
        />
      </lineLoop>
      <mesh
        rotation={[-PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        raycast={() => {}}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color="#889775"
          transparent
          opacity={selected ? 0.13 : 0.07}
          depthWrite={false}
        />
      </mesh>
      {selected && (
        <mesh
          position={[0, 0.004, depth / 2]}
          rotation={[-PI / 2, 0, 0]}
          raycast={() => {}}
        >
          <ringGeometry args={[0.045, 0.07, 24]} />
          <meshBasicMaterial color="#5a4232" depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function StaticGym({ activeZone, onZoneChange }) {
  return (
    <div className="gym-scene__fallback">
      <svg
        viewBox="0 0 600 430"
        role="img"
        aria-label="Gym floor with strength machines, cardio equipment and open floor"
      >
        <defs>
          <filter id="setq-floor-shadow">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <path
          d="M64 248 327 109 551 238 283 385Z"
          fill="#5a4232"
          opacity=".13"
          filter="url(#setq-floor-shadow)"
        />
        <path
          d="M58 226 324 83 548 211 548 236 280 383 58 251Z"
          fill="#ded6c4"
        />
        <path d="M58 226 324 83 548 211 280 358Z" fill="#b4a183" />
        <path d="M65 218 321 81 321 51 65 188Z" fill="#eee8db" />
        <path d="M321 81 541 207 541 177 321 51Z" fill="#e2dac9" />
        <path
          d="m86 215 171-91 112 63-177 95Z"
          fill={activeZone === "strength" ? "#a3af8c" : "#c3c6b4"}
        />
        <path
          d="m286 118 62-33 147 84-70 41Z"
          fill={activeZone === "cardio" ? "#a3af8c" : "#c3c6b4"}
        />
        <path
          d="m231 281 195-103 69 39-204 110Z"
          fill={activeZone === "recovery" ? "#a3af8c" : "#c3c6b4"}
        />
        {[0, 1, 2].map((i) => (
          <g
            key={i}
            transform={`translate(${143 + i * 63}, ${172 - i * 24})`}
            stroke="#5a4232"
            strokeWidth="7"
            fill="#292720"
            strokeLinejoin="round"
          >
            <path
              d="m-24 34 0-100 41-20 0 100M-24-66 28-36 28 41M-24 34 28 63 67 41"
              fill="none"
            />
            <path d="m-15-33 0 51 21 11 0-51Z" strokeWidth="1" />
            <path
              d="m14 35 23 13 19-10-23-13Z"
              fill="#79604a"
              strokeWidth="2"
            />
          </g>
        ))}
        {[0, 1].map((i) => (
          <g
            key={i}
            transform={`translate(${351 + i * 59}, ${170 + i * 31})`}
            stroke="#5a4232"
            strokeWidth="5"
            strokeLinejoin="round"
          >
            <path d="m-19-15 30-16 68 39-29 18Z" fill="#292720" />
            <path d="m-17-16 0-56 29-16 0 56" fill="none" />
            <path d="m-23-76 32-16 22 13-30 17Z" fill="#5a4232" />
          </g>
        ))}
        <path d="m311 267 68-37 28 16-68 37Z" fill="#889775" />
        <path d="m357 293 68-37 28 16-68 37Z" fill="#889775" />
        <text
          x="400"
          y="139"
          fill="#5a4232"
          fontSize="21"
          transform="rotate(30 400 139)"
        >
          SetQ
        </text>
      </svg>
      <div
        className="gym-scene__fallback-controls"
        aria-label="Select gym zone"
      >
        {ZONES.map((zone) => (
          <button
            key={zone}
            type="button"
            aria-pressed={activeZone === zone}
            onClick={() => onZoneChange?.(zone)}
          >
            {LABELS[zone]}
          </button>
        ))}
      </div>
    </div>
  );
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure?.();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function GymScene({
  activeZone = "strength",
  onZoneChange,
  reducedMotion = false,
  className = "",
  onMachineSelectionChange,
}) {
  const container = useRef();
  const annotationRef = useRef();
  const inspectionRefs = useRef(new Map());
  const pickerRef = useRef();
  const cachedProjection = useRef(null);
  const invalidateRef = useRef(null);
  const keyboardSelection = useRef(false);
  const pendingKeyboardFocus = useRef(false);
  const [selectedId, setSelectedId] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hovering, setHovering] = useState(false);
  const safeZone = ZONES.includes(activeZone) ? activeZone : "strength";
  const getCardSize = useCallback(
    () => annotationRef.current?.getCardSize?.() || { width: 282, height: 245 },
    [],
  );
  const closeSelection = useCallback((options) => {
    const annotation = container.current?.querySelector(".machine-annotation");
    if (
      (keyboardSelection.current && options?.reason !== "timeout") ||
      annotation?.contains(document.activeElement)
    ) {
      pickerRef.current
        ?.querySelector("summary")
        ?.focus({ preventScroll: true });
    }
    keyboardSelection.current = false;
    pendingKeyboardFocus.current = false;
    setSelectedId(null);
  }, []);
  const selectEquipment = useCallback(
    (id, fromKeyboard = false) => {
      if (pickerRef.current) pickerRef.current.open = false;
      keyboardSelection.current = fromKeyboard;
      pendingKeyboardFocus.current = fromKeyboard;
      const item = EQUIPMENT_BY_ID[id];
      if (!item || selectedId === id) {
        closeSelection();
        return;
      }
      if (item) onZoneChange?.(item.zone);
      setSelectedId(id);
    },
    [onZoneChange, selectedId, closeSelection],
  );
  const projectSelection = useCallback((projection) => {
    cachedProjection.current = projection;
    annotationRef.current?.updateAnchor(projection);
    if (pendingKeyboardFocus.current) {
      container.current
        ?.querySelector(".machine-annotation__close")
        ?.focus({ preventScroll: true });
      pendingKeyboardFocus.current = false;
    }
  }, []);
  useEffect(() => {
    onMachineSelectionChange?.(selectedId);
    if (selectedId && pickerRef.current) pickerRef.current.open = false;
    if (!selectedId) cachedProjection.current = null;
  }, [selectedId, onMachineSelectionChange]);
  useEffect(() => {
    if (!selectedId) return;
    const card = container.current?.querySelector(".machine-annotation__card");
    if (!card) return;
    const observer = new ResizeObserver(() => invalidateRef.current?.());
    observer.observe(card);
    return () => observer.disconnect();
  }, [selectedId]);
  useEffect(() => {
    if (selectedId && EQUIPMENT_BY_ID[selectedId].zone !== safeZone)
      closeSelection();
  }, [safeZone, selectedId, closeSelection]);
  // The accessible picker remains useful when WebGL is unavailable.
  useEffect(() => {
    if (!fallbackMode || !selectedId || !container.current) return;
    const element = container.current;
    const place = () => {
      const width = element.clientWidth,
        height = element.clientHeight;
      const item = EQUIPMENT_BY_ID[selectedId];
      const x = Math.max(
        width * 0.16,
        Math.min(
          width * 0.84,
          width * (0.5 + (item.floor[0] - item.floor[2]) / 20),
        ),
      );
      const y = height * 0.6;
      projectSelection({
        id: selectedId,
        x,
        y,
        width,
        height,
        floorX: x,
        floorY: y + 12,
      });
    };
    const observer = new ResizeObserver(place);
    observer.observe(element);
    place();
    return () => observer.disconnect();
  }, [fallbackMode, selectedId, projectSelection]);
  useEffect(() => {
    const key = (event) => {
      if (event.key !== "Escape") return;
      closeSelection();
      if (pickerRef.current) pickerRef.current.open = false;
    };
    const outside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target))
        pickerRef.current.open = false;
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [closeSelection]);
  useEffect(() => {
    let intersects = true;
    const update = () => setVisible(intersects && !document.hidden);
    const observer = new IntersectionObserver(
      (entries) => {
        intersects = entries[0].isIntersecting;
        update();
      },
      { rootMargin: "80px" },
    );
    if (container.current) observer.observe(container.current);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const fallback = (
    <StaticGym activeZone={safeZone} onZoneChange={onZoneChange} />
  );
  return (
    <div
      ref={container}
      className={`gym-scene ${className}`}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <p className="gym-scene__description">
        Architectural model of a SetQ-connected gym.{" "}
        {selectedId
          ? `${EQUIPMENT_BY_ID[selectedId].name} selected.`
          : `${LABELS[safeZone]} selected.`}{" "}
        Click equipment or use Inspect equipment to see its details.
      </p>
      <SceneBoundary
        fallback={fallback}
        onFailure={() => setFallbackMode(true)}
      >
        <Canvas
          orthographic
          camera={{ position: [11, 9.8, 12.8], near: 0.1, far: 60, zoom: 44 }}
          dpr={[1, 1.65]}
          frameloop="demand"
          shadows
          onPointerMissed={closeSelection}
          fallback="Architectural gym model"
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          onCreated={({ gl, camera }) => {
            gl.domElement.setAttribute("aria-hidden", "true");
            gl.setClearColor("#f5f2eb", 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.shadowMap.type = THREE.PCFShadowMap;
            camera.lookAt(0, 0.55, 0);
          }}
        >
          <SceneContent
            activeZone={safeZone}
            onZoneChange={onZoneChange}
            reducedMotion={reducedMotion}
            visible={visible}
            hovering={hovering}
            selectedId={selectedId}
            onSelectEquipment={selectEquipment}
            onProject={projectSelection}
            inspectionRefs={inspectionRefs}
            getCardSize={getCardSize}
            invalidateRef={invalidateRef}
          />
        </Canvas>
      </SceneBoundary>
      <details className="gym-scene__inspector" ref={pickerRef}>
        <summary>
          <span className="gym-scene__inspect-dot" aria-hidden="true" />
          Inspect equipment
          <ChevronDown size={12} aria-hidden="true" />
        </summary>
        <div
          className="gym-scene__equipment-menu"
          role="group"
          aria-label="Equipment to inspect"
        >
          {GYM_EQUIPMENT.map((item) => (
            <button
              type="button"
              key={item.id}
              data-equipment-id={item.id}
              ref={(button) => {
                if (button) inspectionRefs.current.set(item.id, button);
                else inspectionRefs.current.delete(item.id);
              }}
              aria-label={`Inspect ${item.name}`}
              aria-pressed={selectedId === item.id}
              onClick={(event) => selectEquipment(item.id, event.detail === 0)}
            >
              <span>{item.name}</span>
              <ArrowUpRight size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      </details>
      {selectedId && (
        <MachineAnnotation
          ref={annotationRef}
          machineId={selectedId}
          onClose={closeSelection}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}
