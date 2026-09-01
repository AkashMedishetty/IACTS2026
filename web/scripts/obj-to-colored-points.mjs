import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { createInterface } from "node:readline";
import jpeg from "jpeg-js";

const [, , input, output, countArg = "70000", seedArg = "20261023", texturePath] = process.argv;
if (!input || !output || !texturePath) {
  console.error("Usage: node scripts/obj-to-colored-points.mjs <input.obj> <output.json> [count] [seed] <diffuse.jpg>");
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

function resolveIndex(raw, total) {
  const value = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value === 0) throw new Error(`Invalid OBJ index: ${raw}`);
  return value < 0 ? total + value : value - 1;
}

function faceReferences(line, vertexCount, texcoordCount) {
  const parts = line.trim().split(/\s+/);
  if (parts.length !== 4) throw new Error("Only triangular OBJ faces are supported");
  return parts.slice(1).map((token) => {
    const [position, uv] = token.split("/");
    if (!uv) throw new Error(`Face has no texture coordinate: ${token}`);
    return {
      position: resolveIndex(position, vertexCount),
      uv: resolveIndex(uv, texcoordCount),
    };
  });
}

function triangleArea(vertices, references) {
  const [ia, ib, ic] = references.map((reference) => reference.position * 3);
  const abx = vertices[ib] - vertices[ia];
  const aby = vertices[ib + 1] - vertices[ia + 1];
  const abz = vertices[ib + 2] - vertices[ia + 2];
  const acx = vertices[ic] - vertices[ia];
  const acy = vertices[ic + 1] - vertices[ia + 1];
  const acz = vertices[ic + 2] - vertices[ia + 2];
  return Math.hypot(
    aby * acz - abz * acy,
    abz * acx - abx * acz,
    abx * acy - aby * acx,
  ) * 0.5;
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

function sampleTexture(image, u, v, target, offset) {
  const wrappedU = u - Math.floor(u);
  const wrappedV = v - Math.floor(v);
  const x = wrappedU * (image.width - 1);
  const y = (1 - wrappedV) * (image.height - 1);
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(image.width - 1, x0 + 1);
  const y1 = Math.min(image.height - 1, y0 + 1);
  const tx = x - x0, ty = y - y0;
  for (let channel = 0; channel < 3; channel++) {
    const c00 = image.data[(y0 * image.width + x0) * 4 + channel];
    const c10 = image.data[(y0 * image.width + x1) * 4 + channel];
    const c01 = image.data[(y1 * image.width + x0) * 4 + channel];
    const c11 = image.data[(y1 * image.width + x1) * 4 + channel];
    target[offset + channel] = Math.round(
      (c00 + (c10 - c00) * tx) * (1 - ty) +
      (c01 + (c11 - c01) * tx) * ty,
    );
  }
}

console.error("Pass 1/3: counting topology and UVs...");
let vertexCount = 0, texcoordCount = 0, faceCount = 0;
await eachLine(input, (line) => {
  if (line.startsWith("v ")) vertexCount++;
  else if (line.startsWith("vt ")) texcoordCount++;
  else if (line.startsWith("f ")) faceCount++;
});
if (!vertexCount || !texcoordCount || !faceCount) throw new Error("OBJ is missing vertices, UVs, or faces");

console.error(`Pass 2/3: loading ${vertexCount} vertices, ${texcoordCount} UVs, and measuring ${faceCount} faces...`);
const vertices = new Float32Array(vertexCount * 3);
const texcoords = new Float32Array(texcoordCount * 2);
let vertexCursor = 0, texcoordCursor = 0, totalArea = 0, degenerateFaces = 0;
await eachLine(input, (line) => {
  if (line.startsWith("v ")) {
    const values = line.slice(2).trim().split(/\s+/);
    vertices[vertexCursor++] = Number.parseFloat(values[0]);
    vertices[vertexCursor++] = Number.parseFloat(values[1]);
    vertices[vertexCursor++] = Number.parseFloat(values[2]);
  } else if (line.startsWith("vt ")) {
    const values = line.slice(3).trim().split(/\s+/);
    texcoords[texcoordCursor++] = Number.parseFloat(values[0]);
    texcoords[texcoordCursor++] = Number.parseFloat(values[1]);
  } else if (line.startsWith("f ")) {
    const area = triangleArea(vertices, faceReferences(line, vertexCount, texcoordCount));
    if (area > 1e-14) totalArea += area;
    else degenerateFaces++;
  }
});
if (!Number.isFinite(totalArea) || totalArea <= 0) throw new Error("OBJ has no sampleable surface area");

console.error(`Decoding diffuse texture ${texturePath}...`);
const texture = jpeg.decode(readFileSync(texturePath), {
  useTArray: true,
  formatAsRGBA: true,
  maxMemoryUsageInMB: 1024,
});
const random = randomFactory(seed);
const targets = new Float64Array(count);
for (let i = 0; i < count; i++) targets[i] = random() * totalArea;
targets.sort();

console.error(`Pass 3/3: sampling ${count} positions, UVs, and colors...`);
const points = new Float32Array(count * 3);
const colors = new Uint8Array(count * 3);
let targetCursor = 0, cumulativeArea = 0;
await eachLine(input, (line) => {
  if (!line.startsWith("f ") || targetCursor >= count) return;
  const references = faceReferences(line, vertexCount, texcoordCount);
  const area = triangleArea(vertices, references);
  if (area <= 1e-14) return;
  const nextArea = cumulativeArea + area;
  while (targetCursor < count && targets[targetCursor] <= nextArea) {
    let u = random(), v = random();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const w = 1 - u - v;
    const weights = [w, u, v];
    for (let axis = 0; axis < 3; axis++) {
      points[targetCursor * 3 + axis] = references.reduce(
        (sum, reference, index) => sum + vertices[reference.position * 3 + axis] * weights[index],
        0,
      );
    }
    const textureU = references.reduce((sum, reference, index) => sum + texcoords[reference.uv * 2] * weights[index], 0);
    const textureV = references.reduce((sum, reference, index) => sum + texcoords[reference.uv * 2 + 1] * weights[index], 0);
    sampleTexture(texture, textureU, textureV, colors, targetCursor * 3);
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
writeFileSync(`${stem}.colors.u8`, Buffer.from(colors.buffer, colors.byteOffset, colors.byteLength));
writeFileSync(`${stem}.meta.json`, JSON.stringify({
  format: "iacts-colored-point-cloud/v2",
  source: basename(input),
  texture: { source: basename(texturePath), width: texture.width, height: texture.height, colorSpace: "sRGB" },
  points: count,
  topology: { vertices: vertexCount, textureCoordinates: texcoordCount, triangles: faceCount, degenerateFaces },
  surfaceArea: totalArea,
  seed,
  normalization: { maxDimension: 8, sourceBounds: { min, max }, center, scale },
  files: { json: basename(output), positions: `${basename(stem)}.f32`, colors: `${basename(stem)}.colors.u8` },
}, null, 2));

const dots = [];
const step = Math.max(1, Math.floor(count / 9000));
for (let i = 0; i < count; i += step) {
  const x = 410 + points[i * 3] * 47;
  const y = 410 - points[i * 3 + 1] * 47;
  const color = `rgb(${colors[i * 3]},${colors[i * 3 + 1]},${colors[i * 3 + 2]})`;
  dots.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.72" fill="${color}"/>`);
}
writeFileSync(`${stem}.preview.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 820"><rect width="820" height="820" fill="#07080a"/>${dots.join("")}</svg>`);
console.log(JSON.stringify({ input, output, points: count, vertexCount, texcoordCount, faceCount, texture: [texture.width, texture.height], colorBytes: colors.byteLength, sourceSize, scale }));
