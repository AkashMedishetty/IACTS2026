import { createReadStream, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { createInterface } from "node:readline";

const [, , input, output, countArg = "70000", seedArg = "20261023"] = process.argv;
if (!input || !output) {
  console.error("Usage: node scripts/obj-to-points.mjs <input.obj> <output.json> [count] [seed]");
  process.exit(1);
}
const count = Number.parseInt(countArg, 10);
const seed = Number.parseInt(seedArg, 10);
if (!Number.isSafeInteger(count) || count < 1 || !Number.isSafeInteger(seed)) {
  throw new Error("count and seed must be positive integers");
}

async function eachLine(file, visit) {
  const lines = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  for await (const line of lines) visit(line);
}

function faceIndices(line, vertexCount) {
  const parts = line.split(" ");
  if (parts.length !== 4) throw new Error("Only triangular OBJ faces are supported");
  return parts.slice(1).map((token) => {
    const raw = Number.parseInt(token, 10);
    if (!Number.isSafeInteger(raw) || raw === 0) throw new Error(`Invalid face index: ${token}`);
    return raw < 0 ? vertexCount + raw : raw - 1;
  });
}

function triangleArea(vertices, indices) {
  const [ia, ib, ic] = indices.map((value) => value * 3);
  const abx = vertices[ib] - vertices[ia];
  const aby = vertices[ib + 1] - vertices[ia + 1];
  const abz = vertices[ib + 2] - vertices[ia + 2];
  const acx = vertices[ic] - vertices[ia];
  const acy = vertices[ic + 1] - vertices[ia + 1];
  const acz = vertices[ic + 2] - vertices[ia + 2];
  const crossX = aby * acz - abz * acy;
  const crossY = abz * acx - abx * acz;
  const crossZ = abx * acy - aby * acx;
  return Math.hypot(crossX, crossY, crossZ) * 0.5;
}

function randomFactory(initial) {
  let state = initial >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

console.error("Pass 1/3: counting topology...");
let vertexCount = 0;
let faceCount = 0;
await eachLine(input, (line) => {
  if (line.startsWith("v ")) vertexCount++;
  else if (line.startsWith("f ")) faceCount++;
});
if (!vertexCount || !faceCount) throw new Error("OBJ contains no vertices or faces");

console.error(`Pass 2/3: loading ${vertexCount} vertices and measuring ${faceCount} faces...`);
const vertices = new Float32Array(vertexCount * 3);
let vertexCursor = 0;
let totalArea = 0;
let degenerateFaces = 0;
await eachLine(input, (line) => {
  if (line.startsWith("v ")) {
    const values = line.slice(2).trim().split(/\s+/);
    if (values.length < 3) throw new Error(`Invalid vertex: ${line}`);
    vertices[vertexCursor++] = Number.parseFloat(values[0]);
    vertices[vertexCursor++] = Number.parseFloat(values[1]);
    vertices[vertexCursor++] = Number.parseFloat(values[2]);
  } else if (line.startsWith("f ")) {
    const area = triangleArea(vertices, faceIndices(line, vertexCount));
    if (area > 1e-14) totalArea += area;
    else degenerateFaces++;
  }
});
if (!Number.isFinite(totalArea) || totalArea <= 0) throw new Error("OBJ has no sampleable surface area");

const random = randomFactory(seed);
const targets = new Float64Array(count);
for (let i = 0; i < count; i++) targets[i] = random() * totalArea;
targets.sort();

console.error(`Pass 3/3: sampling ${count} points by surface area...`);
const points = new Float32Array(count * 3);
let targetCursor = 0;
let cumulativeArea = 0;
await eachLine(input, (line) => {
  if (!line.startsWith("f ") || targetCursor >= count) return;
  const indices = faceIndices(line, vertexCount);
  const area = triangleArea(vertices, indices);
  if (area <= 1e-14) return;
  const nextArea = cumulativeArea + area;
  while (targetCursor < count && targets[targetCursor] <= nextArea) {
    let u = random();
    let v = random();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const w = 1 - u - v;
    for (let axis = 0; axis < 3; axis++) {
      points[targetCursor * 3 + axis] =
        vertices[indices[0] * 3 + axis] * w +
        vertices[indices[1] * 3 + axis] * u +
        vertices[indices[2] * 3 + axis] * v;
    }
    targetCursor++;
  }
  cumulativeArea = nextArea;
});
if (targetCursor !== count) throw new Error(`Sampled ${targetCursor}/${count} requested points`);

const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < points.length; i += 3) {
  for (let axis = 0; axis < 3; axis++) {
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
writeFileSync(output, JSON.stringify(Array.from(points)));
const stem = output.replace(/\.json$/i, "");
writeFileSync(`${stem}.f32`, Buffer.from(points.buffer, points.byteOffset, points.byteLength));
writeFileSync(`${stem}.meta.json`, JSON.stringify({
  format: "iacts-point-cloud/v1",
  source: basename(input),
  points: count,
  components: 3,
  componentType: "float32",
  topology: { vertices: vertexCount, triangles: faceCount, degenerateFaces },
  surfaceArea: totalArea,
  seed,
  normalization: { maxDimension: 8, sourceBounds: { min, max }, center, scale },
  files: { json: basename(output), binary: `${basename(stem)}.f32` },
}, null, 2));

const dots = [];
const step = Math.max(1, Math.floor(count / 9000));
for (let i = 0; i < count; i += step) {
  const x = 410 + points[i * 3] * 47;
  const y = 410 - points[i * 3 + 1] * 47;
  dots.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.72"/>`);
}
writeFileSync(`${stem}.preview.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 820"><rect width="820" height="820" fill="#fbfbfc"/><g fill="#8d0e16" fill-opacity=".5">${dots.join("")}</g></svg>`);
console.log(JSON.stringify({ input, output, points: count, vertexCount, faceCount, degenerateFaces, totalArea, sourceSize, scale }));
