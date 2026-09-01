import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createInterface } from "node:readline";

const [, , input, metadataPath, output, resolutionArg = "120"] = process.argv;
if (!input || !metadataPath || !output) {
  console.error(
    "Usage: node scripts/obj-to-textured-runtime-mesh.mjs <input.obj> <points.meta.json> <output.meshbin> [resolution]",
  );
  process.exit(1);
}

const resolution = Number.parseInt(resolutionArg, 10);
if (!Number.isSafeInteger(resolution) || resolution < 48 || resolution > 192) {
  throw new Error("Resolution must be an integer between 48 and 192");
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
  throw new Error("Metadata is missing matching topology or normalization data");
}

const sourcePositions = new Float32Array(expectedVertices * 3);
const sourceTexcoords = new Float32Array(expectedTexcoords * 2);
const sourceNormals = new Float32Array(expectedVertices * 3);
const sourceClusters = new Uint32Array(expectedVertices);
let vertexCursor = 0;
let texcoordCursor = 0;
let normalCursor = 0;
let sourceFaces = 0;
let mismatchedReferences = 0;

const cellSize = 8 / resolution;
const keyStride = 2048;
const keyOffset = 1024;
const uvTolerance = 0.025;
const normalThreshold = 0.58;
const clustersByCell = new Map();
const positionX = [];
const positionY = [];
const positionZ = [];
const textureU = [];
const textureV = [];
const normalX = [];
const normalY = [];
const normalZ = [];
const clusterWeight = [];
let clustersReady = false;
let faceBase = 0;
const clusteredFaces = [];
const uniqueFaces = new Set();

function cellKey(x, y, z) {
  const ix = Math.floor(x / cellSize) + keyOffset;
  const iy = Math.floor(y / cellSize) + keyOffset;
  const iz = Math.floor(z / cellSize) + keyOffset;
  if (ix < 0 || iy < 0 || iz < 0 || ix >= keyStride || iy >= keyStride || iz >= keyStride) {
    throw new Error("Normalized source exceeded the converter's spatial key range");
  }
  return ix + keyStride * (iy + keyStride * iz);
}

function resolveIndex(raw, total) {
  const value = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value === 0) throw new Error(`Invalid OBJ index: ${raw}`);
  const index = value < 0 ? total + value : value - 1;
  if (index < 0 || index >= total) throw new Error(`OBJ index is out of range: ${raw}`);
  return index;
}

function createCluster(x, y, z, u, v, nx, ny, nz, key) {
  const cluster = positionX.length;
  positionX.push(x);
  positionY.push(y);
  positionZ.push(z);
  textureU.push(u);
  textureV.push(v);
  normalX.push(nx);
  normalY.push(ny);
  normalZ.push(nz);
  clusterWeight.push(1);
  let candidates = clustersByCell.get(key);
  if (!candidates) {
    candidates = [];
    clustersByCell.set(key, candidates);
  }
  candidates.push(cluster);
  return cluster;
}

function buildClusters() {
  if (
    vertexCursor !== expectedVertices ||
    texcoordCursor !== expectedTexcoords ||
    normalCursor !== expectedVertices
  ) {
    throw new Error(
      `Source attributes are incomplete before faces: ${vertexCursor}/${texcoordCursor}/${normalCursor}`,
    );
  }

  console.error(`Clustering ${expectedVertices} authored position/UV/normal tuples...`);
  for (let source = 0; source < expectedVertices; source++) {
    const x = sourcePositions[source * 3];
    const y = sourcePositions[source * 3 + 1];
    const z = sourcePositions[source * 3 + 2];
    const u = sourceTexcoords[source * 2];
    const v = sourceTexcoords[source * 2 + 1];
    const nx = sourceNormals[source * 3];
    const ny = sourceNormals[source * 3 + 1];
    const nz = sourceNormals[source * 3 + 2];
    const key = cellKey(x, y, z);
    const candidates = clustersByCell.get(key);
    let cluster = -1;

    if (candidates) {
      for (const candidate of candidates) {
        const weight = clusterWeight[candidate];
        const meanU = textureU[candidate] / weight;
        const meanV = textureV[candidate] / weight;
        const meanNx = normalX[candidate] / weight;
        const meanNy = normalY[candidate] / weight;
        const meanNz = normalZ[candidate] / weight;
        const normalLength = Math.hypot(meanNx, meanNy, meanNz) || 1;
        const sourceLength = Math.hypot(nx, ny, nz) || 1;
        const alignment =
          (meanNx * nx + meanNy * ny + meanNz * nz) /
          (normalLength * sourceLength);
        if (
          Math.abs(u - meanU) <= uvTolerance &&
          Math.abs(v - meanV) <= uvTolerance &&
          alignment >= normalThreshold
        ) {
          cluster = candidate;
          break;
        }
      }
    }

    if (cluster < 0) {
      cluster = createCluster(x, y, z, u, v, nx, ny, nz, key);
    } else {
      positionX[cluster] += x;
      positionY[cluster] += y;
      positionZ[cluster] += z;
      textureU[cluster] += u;
      textureV[cluster] += v;
      normalX[cluster] += nx;
      normalY[cluster] += ny;
      normalZ[cluster] += nz;
      clusterWeight[cluster]++;
    }
    sourceClusters[source] = cluster;
  }

  faceBase = positionX.length;
  if (faceBase ** 3 >= Number.MAX_SAFE_INTEGER) {
    throw new Error(`Too many clusters for exact face keys: ${faceBase}`);
  }
  clustersReady = true;
  console.error(`Created ${faceBase} UV- and normal-preserving runtime clusters`);
}

function addFace(line) {
  const parts = line.trim().split(/\s+/);
  if (parts.length !== 4) throw new Error("Only triangular OBJ faces are supported");
  const clusters = [];
  for (let corner = 1; corner < 4; corner++) {
    const [positionRaw, uvRaw, normalRaw] = parts[corner].split("/");
    if (!uvRaw || !normalRaw) throw new Error(`Face corner is incomplete: ${parts[corner]}`);
    const position = resolveIndex(positionRaw, expectedVertices);
    const uv = resolveIndex(uvRaw, expectedTexcoords);
    const normal = resolveIndex(normalRaw, expectedVertices);
    if (position !== uv || position !== normal) mismatchedReferences++;
    clusters.push(sourceClusters[position]);
  }

  const [a, b, c] = clusters;
  if (a === b || b === c || c === a) return;
  let low = a;
  let middle = b;
  let high = c;
  if (low > middle) [low, middle] = [middle, low];
  if (middle > high) [middle, high] = [high, middle];
  if (low > middle) [low, middle] = [middle, low];
  const key = (low * faceBase + middle) * faceBase + high;
  if (uniqueFaces.has(key)) return;
  uniqueFaces.add(key);
  clusteredFaces.push(a, b, c);
}

console.error(`Streaming ${input} at spatial resolution ${resolution}...`);
const lines = createInterface({ input: createReadStream(input), crlfDelay: Infinity });
for await (const line of lines) {
  if (line.startsWith("v ")) {
    if (clustersReady) throw new Error("OBJ contains positions after faces began");
    const values = line.slice(2).trim().split(/\s+/);
    sourcePositions[vertexCursor * 3] = (Number.parseFloat(values[0]) - center[0]) * scale;
    sourcePositions[vertexCursor * 3 + 1] = (Number.parseFloat(values[1]) - center[1]) * scale;
    sourcePositions[vertexCursor * 3 + 2] = (Number.parseFloat(values[2]) - center[2]) * scale;
    vertexCursor++;
  } else if (line.startsWith("vt ")) {
    if (clustersReady) throw new Error("OBJ contains UVs after faces began");
    const values = line.slice(3).trim().split(/\s+/);
    sourceTexcoords[texcoordCursor * 2] = Number.parseFloat(values[0]);
    sourceTexcoords[texcoordCursor * 2 + 1] = Number.parseFloat(values[1]);
    texcoordCursor++;
  } else if (line.startsWith("vn ")) {
    if (clustersReady) throw new Error("OBJ contains normals after faces began");
    const values = line.slice(3).trim().split(/\s+/);
    sourceNormals[normalCursor * 3] = Number.parseFloat(values[0]);
    sourceNormals[normalCursor * 3 + 1] = Number.parseFloat(values[1]);
    sourceNormals[normalCursor * 3 + 2] = Number.parseFloat(values[2]);
    normalCursor++;
  } else if (line.startsWith("f ")) {
    if (!clustersReady) buildClusters();
    sourceFaces++;
    addFace(line);
  }
}

if (!clustersReady) throw new Error("OBJ has no faces");
if (sourceFaces !== expectedFaces || mismatchedReferences) {
  throw new Error(
    `Source face contract changed: ${sourceFaces}/${expectedFaces} faces, ${mismatchedReferences} mismatched corners`,
  );
}

const used = new Uint8Array(faceBase);
for (const index of clusteredFaces) used[index] = 1;
const remap = new Int32Array(faceBase);
remap.fill(-1);
let runtimeVertices = 0;
for (let cluster = 0; cluster < faceBase; cluster++) {
  if (used[cluster]) remap[cluster] = runtimeVertices++;
}

const positions = new Float32Array(runtimeVertices * 3);
const normals = new Int16Array(runtimeVertices * 3);
const uvs = new Uint16Array(runtimeVertices * 2);
for (let cluster = 0; cluster < faceBase; cluster++) {
  const target = remap[cluster];
  if (target < 0) continue;
  const weight = clusterWeight[cluster];
  positions[target * 3] = positionX[cluster] / weight;
  positions[target * 3 + 1] = positionY[cluster] / weight;
  positions[target * 3 + 2] = positionZ[cluster] / weight;

  const nx = normalX[cluster] / weight;
  const ny = normalY[cluster] / weight;
  const nz = normalZ[cluster] / weight;
  const normalLength = Math.hypot(nx, ny, nz) || 1;
  normals[target * 3] = Math.round((nx / normalLength) * 32767);
  normals[target * 3 + 1] = Math.round((ny / normalLength) * 32767);
  normals[target * 3 + 2] = Math.round((nz / normalLength) * 32767);

  const u = Math.max(0, Math.min(1, textureU[cluster] / weight));
  const v = Math.max(0, Math.min(1, textureV[cluster] / weight));
  uvs[target * 2] = Math.round(u * 65535);
  uvs[target * 2 + 1] = Math.round(v * 65535);
}

const indices = new Uint32Array(clusteredFaces.length);
for (let i = 0; i < clusteredFaces.length; i++) {
  indices[i] = remap[clusteredFaces[i]];
}

const headerBytes = 64;
const positionOffset = headerBytes;
const normalOffset = positionOffset + positions.byteLength;
const uvOffset = normalOffset + normals.byteLength;
const indexOffset = Math.ceil((uvOffset + uvs.byteLength) / 4) * 4;
const byteLength = indexOffset + indices.byteLength;
const asset = Buffer.alloc(byteLength);
asset.writeUInt32LE(0x54434149, 0); // IACT
asset.writeUInt32LE(2, 4);
asset.writeUInt32LE(runtimeVertices, 8);
asset.writeUInt32LE(indices.length / 3, 12);
asset.writeUInt32LE(positionOffset, 16);
asset.writeUInt32LE(normalOffset, 20);
asset.writeUInt32LE(uvOffset, 24);
asset.writeUInt32LE(indexOffset, 28);
asset.writeUInt32LE(byteLength, 32);
asset.writeUInt32LE(resolution, 36);
Buffer.from(positions.buffer).copy(asset, positionOffset);
Buffer.from(normals.buffer).copy(asset, normalOffset);
Buffer.from(uvs.buffer).copy(asset, uvOffset);
Buffer.from(indices.buffer).copy(asset, indexOffset);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, asset);
console.log(JSON.stringify({
  input,
  output,
  resolution,
  sourceVertices: expectedVertices,
  sourceTriangles: sourceFaces,
  clusters: faceBase,
  vertices: runtimeVertices,
  triangles: indices.length / 3,
  bytes: byteLength,
  uvTolerance,
  normalThreshold,
  mismatchedReferences,
}));
