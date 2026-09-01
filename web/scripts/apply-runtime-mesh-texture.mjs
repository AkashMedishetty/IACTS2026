import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createInterface } from "node:readline";
import jpeg from "jpeg-js";

const [
  ,
  ,
  meshPath,
  objPath,
  metadataPath,
  texturePath,
  outputPath = meshPath,
] = process.argv;

if (!meshPath || !objPath || !metadataPath || !texturePath) {
  console.error(
    "Usage: node scripts/apply-runtime-mesh-texture.mjs <meshbin> <source.obj> <points.meta.json> <diffuse.jpg> [output.meshbin]",
  );
  process.exit(1);
}

const mesh = readFileSync(meshPath);
if (mesh.byteLength < 64 || mesh.readUInt32LE(0) !== 0x54434149) {
  throw new Error("Input is not an IACT runtime mesh");
}
const version = mesh.readUInt32LE(4);
const runtimeVertices = mesh.readUInt32LE(8);
const positionOffset = mesh.readUInt32LE(16);
const colorOffset = mesh.readUInt32LE(24);
const indexOffset = mesh.readUInt32LE(28);
const declaredBytes = mesh.readUInt32LE(32);
const resolution = mesh.readUInt32LE(36);
if (
  version !== 1 ||
  !runtimeVertices ||
  declaredBytes !== mesh.byteLength ||
  colorOffset + runtimeVertices * 3 > indexOffset
) {
  throw new Error("Runtime mesh header failed validation");
}

const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
const expectedVertices = metadata.topology?.vertices;
const expectedTexcoords = metadata.topology?.textureCoordinates;
const expectedFaces = metadata.topology?.triangles;
const center = metadata.normalization?.center;
const scale = metadata.normalization?.scale;
if (
  !Number.isSafeInteger(expectedVertices) ||
  !Number.isSafeInteger(expectedTexcoords) ||
  !Number.isSafeInteger(expectedFaces) ||
  expectedVertices !== expectedTexcoords ||
  !Array.isArray(center) ||
  center.length !== 3 ||
  !Number.isFinite(scale)
) {
  throw new Error("Metadata does not describe one-to-one source positions and UVs");
}

const sourcePositions = new Float32Array(expectedVertices * 3);
const sourceTexcoords = new Float32Array(expectedTexcoords * 2);
let vertexCursor = 0;
let texcoordCursor = 0;
let faceCount = 0;
let mismatchedReferences = 0;

function resolveIndex(raw, total) {
  const value = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value === 0) throw new Error(`Invalid OBJ index: ${raw}`);
  return value < 0 ? total + value : value - 1;
}

console.error("Streaming source positions, UVs, and validating face references...");
const lines = createInterface({ input: createReadStream(objPath), crlfDelay: Infinity });
for await (const line of lines) {
  if (line.startsWith("v ")) {
    if (vertexCursor >= expectedVertices) throw new Error("OBJ has more positions than metadata");
    const values = line.slice(2).trim().split(/\s+/);
    sourcePositions[vertexCursor * 3] = (Number.parseFloat(values[0]) - center[0]) * scale;
    sourcePositions[vertexCursor * 3 + 1] = (Number.parseFloat(values[1]) - center[1]) * scale;
    sourcePositions[vertexCursor * 3 + 2] = (Number.parseFloat(values[2]) - center[2]) * scale;
    vertexCursor++;
  } else if (line.startsWith("vt ")) {
    if (texcoordCursor >= expectedTexcoords) throw new Error("OBJ has more UVs than metadata");
    const values = line.slice(3).trim().split(/\s+/);
    sourceTexcoords[texcoordCursor * 2] = Number.parseFloat(values[0]);
    sourceTexcoords[texcoordCursor * 2 + 1] = Number.parseFloat(values[1]);
    texcoordCursor++;
  } else if (line.startsWith("f ")) {
    const parts = line.trim().split(/\s+/);
    if (parts.length !== 4) throw new Error("Only triangular OBJ faces are supported");
    for (let corner = 1; corner < 4; corner++) {
      const [positionRaw, uvRaw] = parts[corner].split("/");
      if (!uvRaw) throw new Error(`Face corner has no UV: ${parts[corner]}`);
      const position = resolveIndex(positionRaw, expectedVertices);
      const uv = resolveIndex(uvRaw, expectedTexcoords);
      if (position !== uv) mismatchedReferences++;
    }
    faceCount++;
  }
}

if (
  vertexCursor !== expectedVertices ||
  texcoordCursor !== expectedTexcoords ||
  faceCount !== expectedFaces
) {
  throw new Error(
    `Source topology changed: ${vertexCursor}/${texcoordCursor}/${faceCount} positions/UVs/faces`,
  );
}
if (mismatchedReferences) {
  throw new Error(
    `OBJ position and UV indices differ at ${mismatchedReferences} face corners; refusing an ambiguous transfer`,
  );
}

console.error(`Decoding original diffuse texture ${texturePath}...`);
const texture = jpeg.decode(readFileSync(texturePath), {
  useTArray: true,
  formatAsRGBA: true,
  maxMemoryUsageInMB: 1024,
});

const runtimePositions = new Float32Array(
  mesh.buffer,
  mesh.byteOffset + positionOffset,
  runtimeVertices * 3,
);
const existingColors = new Uint8Array(
  mesh.buffer,
  mesh.byteOffset + colorOffset,
  runtimeVertices * 3,
);
const cellSize = 8 / resolution;
const keyStride = 2048;
const keyOffset = 1024;

function cellKey(x, y, z) {
  const ix = Math.floor(x / cellSize) + keyOffset;
  const iy = Math.floor(y / cellSize) + keyOffset;
  const iz = Math.floor(z / cellSize) + keyOffset;
  return ix + keyStride * (iy + keyStride * iz);
}

const runtimeByCell = new Map();
for (let vertex = 0; vertex < runtimeVertices; vertex++) {
  const key = cellKey(
    runtimePositions[vertex * 3],
    runtimePositions[vertex * 3 + 1],
    runtimePositions[vertex * 3 + 2],
  );
  if (runtimeByCell.has(key)) throw new Error(`Runtime mesh has duplicate spatial cell ${key}`);
  runtimeByCell.set(key, vertex);
}

const red = new Float64Array(runtimeVertices);
const green = new Float64Array(runtimeVertices);
const blue = new Float64Array(runtimeVertices);
const samples = new Uint32Array(runtimeVertices);
let mappedSourceVertices = 0;

for (let source = 0; source < expectedVertices; source++) {
  const runtime = runtimeByCell.get(cellKey(
    sourcePositions[source * 3],
    sourcePositions[source * 3 + 1],
    sourcePositions[source * 3 + 2],
  ));
  if (runtime === undefined) continue;

  const u = sourceTexcoords[source * 2] - Math.floor(sourceTexcoords[source * 2]);
  const sourceV = sourceTexcoords[source * 2 + 1];
  const v = sourceV - Math.floor(sourceV);
  const x = u * (texture.width - 1);
  const y = (1 - v) * (texture.height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(texture.width - 1, x0 + 1);
  const y1 = Math.min(texture.height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;

  const channels = [red, green, blue];
  for (let channel = 0; channel < 3; channel++) {
    const c00 = texture.data[(y0 * texture.width + x0) * 4 + channel];
    const c10 = texture.data[(y0 * texture.width + x1) * 4 + channel];
    const c01 = texture.data[(y1 * texture.width + x0) * 4 + channel];
    const c11 = texture.data[(y1 * texture.width + x1) * 4 + channel];
    channels[channel][runtime] +=
      (c00 + (c10 - c00) * tx) * (1 - ty) +
      (c01 + (c11 - c01) * tx) * ty;
  }
  samples[runtime]++;
  mappedSourceVertices++;
}

let coloredRuntimeVertices = 0;
for (let vertex = 0; vertex < runtimeVertices; vertex++) {
  const count = samples[vertex];
  if (!count) continue;
  existingColors[vertex * 3] = Math.round(red[vertex] / count);
  existingColors[vertex * 3 + 1] = Math.round(green[vertex] / count);
  existingColors[vertex * 3 + 2] = Math.round(blue[vertex] / count);
  coloredRuntimeVertices++;
}
if (coloredRuntimeVertices !== runtimeVertices) {
  throw new Error(
    `Texture transfer covered ${coloredRuntimeVertices}/${runtimeVertices} runtime vertices; output was not written`,
  );
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, mesh);
console.log(JSON.stringify({
  meshPath,
  outputPath,
  sourceVertices: expectedVertices,
  mappedSourceVertices,
  runtimeVertices,
  coloredRuntimeVertices,
  texture: [texture.width, texture.height],
  mismatchedReferences,
}));
