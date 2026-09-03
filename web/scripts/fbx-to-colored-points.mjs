/**
 * FBX -> colored point cloud, matching iacts-colored-point-cloud/v2.
 *
 * The existing pipeline reads OBJ and GLB. FBX is a proprietary binary format,
 * so this leans on three's FBXLoader (which needs fflate) rather than parsing
 * it by hand, then samples the surface exactly the way obj-to-colored-points
 * does: area-weighted triangle sampling with a seeded RNG, colours looked up
 * from the base-colour map through the mesh UVs.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { Vector3, Triangle } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import jpeg from "jpeg-js";

/* FBXLoader eagerly builds materials and calls TextureLoader -> ImageLoader ->
   document.createElementNS. There is no DOM here, and we sample colours from
   the base-colour JPEG ourselves, so a stub is enough to get past it. */
const noopImage = () => ({
  style: {},
  set src(_v) {},
  get src() { return ""; },
  setAttribute() {},
  addEventListener() {},
  removeEventListener() {},
});
globalThis.self ??= globalThis;
globalThis.window ??= globalThis;
globalThis.document ??= {
  createElementNS: () => noopImage(),
  createElement: () => ({ ...noopImage(), getContext: () => null }),
};
globalThis.URL.createObjectURL ??= () => "";
globalThis.URL.revokeObjectURL ??= () => {};

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
const [input, output, countArg = "70000", seedArg = "20261023", texturePath] = args;
if (!input || !output || !texturePath) {
  console.error("Usage: node scripts/fbx-to-colored-points.mjs <in.fbx> <out.json> [count] [seed] <basecolor.jpg>");
  process.exit(1);
}
const count = Number.parseInt(countArg, 10);
const seed = Number.parseInt(seedArg, 10);

function randomFactory(s) {
  let state = s >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function sampleTexture(tex, u, v, out, offset) {
  const x = Math.min(tex.width - 1, Math.max(0, Math.round((u - Math.floor(u)) * (tex.width - 1))));
  // FBX/OBJ UV origin is bottom-left; image rows run top-down.
  const y = Math.min(tex.height - 1, Math.max(0, Math.round((1 - (v - Math.floor(v))) * (tex.height - 1))));
  const i = (y * tex.width + x) * 4;
  out[offset] = tex.data[i];
  out[offset + 1] = tex.data[i + 1];
  out[offset + 2] = tex.data[i + 2];
}

console.error("Pass 1/3: parsing FBX (this is the slow part)...");
const buffer = readFileSync(input);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
const group = new FBXLoader().parse(arrayBuffer, dirname(input) + "/");

console.error("Pass 2/3: collecting world-space triangles...");
group.updateMatrixWorld(true);

/* Authoring files often carry stray parts parked far off to the side; here the
   heart is one 8.65M-triangle mesh at the origin and the rest sit hundreds of
   units away, which would wreck the normalisation. Default to the dominant
   mesh and say so. */
const meshes = [];
group.traverse((c) => { if (c.isMesh && c.geometry?.attributes?.position) meshes.push(c); });
const triCountOf = (m) => (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
let keep = null;
if (!flags.has("--all-meshes") && meshes.length > 1) {
  keep = meshes.reduce((best, m) => (triCountOf(m) > triCountOf(best) ? m : best), meshes[0]);
  const dropped = meshes.filter((m) => m !== keep);
  console.error(`  using dominant mesh "${keep.name || "(unnamed)"}" (${Math.round(triCountOf(keep))} tris); ` +
    `ignoring ${dropped.length} other mesh(es) — pass --all-meshes to include them`);
}
const tris = [];          // {p:[9], uv:[6]}
const cumulative = [];
let totalArea = 0;
let meshCount = 0;
let missingUv = 0;
const a = new Vector3(), b = new Vector3(), c = new Vector3();

for (const child of (keep ? [keep] : meshes)) {
  meshCount += 1;
  const g = child.geometry;
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  if (!pos) continue;
  if (!uv) missingUv += 1;
  const index = g.index;
  const faces = index ? index.count / 3 : pos.count / 3;
  for (let f = 0; f < faces; f += 1) {
    const i0 = index ? index.getX(f * 3) : f * 3;
    const i1 = index ? index.getX(f * 3 + 1) : f * 3 + 1;
    const i2 = index ? index.getX(f * 3 + 2) : f * 3 + 2;
    a.fromBufferAttribute(pos, i0).applyMatrix4(child.matrixWorld);
    b.fromBufferAttribute(pos, i1).applyMatrix4(child.matrixWorld);
    c.fromBufferAttribute(pos, i2).applyMatrix4(child.matrixWorld);
    const area = new Triangle(a, b, c).getArea();
    if (!(area > 1e-14)) continue;
    tris.push({
      p: [a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z],
      uv: uv
        ? [uv.getX(i0), uv.getY(i0), uv.getX(i1), uv.getY(i1), uv.getX(i2), uv.getY(i2)]
        : [0, 0, 0, 0, 0, 0],
    });
    totalArea += area;
    cumulative.push(totalArea);
  }
}
if (!tris.length) throw new Error("No triangles found in the FBX");
console.error(`  ${meshCount} meshes, ${tris.length} triangles, area ${totalArea.toFixed(3)}` +
  (missingUv ? `, ${missingUv} mesh(es) without UVs` : ""));

console.error("Pass 3/3: sampling points and colours...");
const texture = jpeg.decode(readFileSync(texturePath), { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 1024 });
const random = randomFactory(seed);
const points = new Float32Array(count * 3);
const colors = new Uint8Array(count * 3);

for (let i = 0; i < count; i += 1) {
  const target = random() * totalArea;
  // binary search the cumulative area table
  let lo = 0, hi = cumulative.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] < target) lo = mid + 1; else hi = mid;
  }
  const t = tris[lo];
  let u = random(), v = random();
  if (u + v > 1) { u = 1 - u; v = 1 - v; }
  const w = 1 - u - v;
  for (let axis = 0; axis < 3; axis += 1) {
    points[i * 3 + axis] = t.p[axis] * w + t.p[3 + axis] * u + t.p[6 + axis] * v;
  }
  sampleTexture(texture, t.uv[0] * w + t.uv[2] * u + t.uv[4] * v, t.uv[1] * w + t.uv[3] * u + t.uv[5] * v, colors, i * 3);
}

const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < points.length; i += 3) {
  for (let axis = 0; axis < 3; axis += 1) {
    min[axis] = Math.min(min[axis], points[i + axis]);
    max[axis] = Math.max(max[axis], points[i + axis]);
  }
}
const center = min.map((value, axis) => (value + max[axis]) / 2);
const sourceSize = min.map((value, axis) => max[axis] - value);
const scale = 8 / Math.max(...sourceSize);
for (let i = 0; i < points.length; i += 3) {
  points[i] = (points[i] - center[0]) * scale;
  points[i + 1] = (points[i + 1] - center[1]) * scale;
  points[i + 2] = (points[i + 2] - center[2]) * scale;
}

mkdirSync(dirname(output), { recursive: true });
const stem = output.replace(/\.json$/i, "");
writeFileSync(output, JSON.stringify(Array.from(points)));
writeFileSync(`${stem}.f32`, Buffer.from(points.buffer, points.byteOffset, points.byteLength));
writeFileSync(`${stem}.colors.u8`, Buffer.from(colors.buffer, colors.byteOffset, colors.byteLength));
writeFileSync(`${stem}.meta.json`, JSON.stringify({
  format: "iacts-colored-point-cloud/v2",
  source: basename(input),
  texture: { source: basename(texturePath), width: texture.width, height: texture.height, colorSpace: "sRGB" },
  points: count,
  topology: { meshes: meshCount, triangles: tris.length },
  surfaceArea: totalArea,
  seed,
  normalization: { maxDimension: 8, sourceBounds: { min, max }, center, scale },
  files: { json: basename(output), positions: `${basename(stem)}.f32`, colors: `${basename(stem)}.colors.u8` },
}, null, 2));

const dots = [];
const step = Math.max(1, Math.floor(count / 9000));
for (let i = 0; i < count; i += step) {
  dots.push(`<circle cx="${(410 + points[i*3]*47).toFixed(2)}" cy="${(410 - points[i*3+1]*47).toFixed(2)}" r="0.72" fill="rgb(${colors[i*3]},${colors[i*3+1]},${colors[i*3+2]})"/>`);
}
writeFileSync(`${stem}.preview.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 820"><rect width="820" height="820" fill="#fffdfc"/>${dots.join("")}</svg>`);
console.log(JSON.stringify({ meshes: meshCount, triangles: tris.length, points: count, sourceSize, scale }));
