import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createInterface } from "node:readline";

const [
  ,
  ,
  input,
  pointPath,
  colorPath,
  metadataPath,
  output,
  resolutionArg = "136",
] = process.argv;

if (!input || !pointPath || !colorPath || !metadataPath || !output) {
  console.error(
    "Usage: node scripts/obj-to-runtime-mesh.mjs <input.obj> <points.f32> <colors.u8> <points.meta.json> <output.meshbin> [resolution]",
  );
  process.exit(1);
}

const resolution = Number.parseInt(resolutionArg, 10);
if (!Number.isSafeInteger(resolution) || resolution < 32 || resolution > 256) {
  throw new Error("Resolution must be an integer between 32 and 256");
}

const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
const expectedVertices = metadata.topology?.vertices;
const expectedFaces = metadata.topology?.triangles;
const center = metadata.normalization?.center;
const scale = metadata.normalization?.scale;
if (
  !Number.isSafeInteger(expectedVertices) ||
  !Number.isSafeInteger(expectedFaces) ||
  !Array.isArray(center) ||
  center.length !== 3 ||
  !Number.isFinite(scale)
) {
  throw new Error("Point metadata is missing source topology or normalization data");
}

const pointBuffer = readFileSync(pointPath);
const colorBuffer = readFileSync(colorPath);
if (pointBuffer.byteLength % 12 !== 0 || colorBuffer.byteLength !== pointBuffer.byteLength / 4) {
  throw new Error("Point positions and colors do not have matching RGB triplets");
}
const sampledPoints = new Float32Array(
  pointBuffer.buffer,
  pointBuffer.byteOffset,
  pointBuffer.byteLength / Float32Array.BYTES_PER_ELEMENT,
);
const sampledColors = new Uint8Array(
  colorBuffer.buffer,
  colorBuffer.byteOffset,
  colorBuffer.byteLength,
);

const vertexClusters = new Uint32Array(expectedVertices);
const clusterLookup = new Map();
const clusterSumX = [];
const clusterSumY = [];
const clusterSumZ = [];
const clusterWeight = [];
const clusteredFaces = [];
const uniqueFaces = new Set();
const cellSize = 8 / resolution;
const keyStride = 2048;
const keyOffset = 1024;

let vertexCursor = 0;
let sourceFaces = 0;
let faceBase = 0;
let clusterX;
let clusterY;
let clusterZ;
let topologyStarted = false;

function cellKey(x, y, z) {
  const ix = Math.floor(x / cellSize) + keyOffset;
  const iy = Math.floor(y / cellSize) + keyOffset;
  const iz = Math.floor(z / cellSize) + keyOffset;
  if (ix < 0 || iy < 0 || iz < 0 || ix >= keyStride || iy >= keyStride || iz >= keyStride) {
    throw new Error("Normalized source exceeded the converter's spatial key range");
  }
  return ix + keyStride * (iy + keyStride * iz);
}

function finalizeClusters() {
  const count = clusterSumX.length;
  if (count ** 3 >= Number.MAX_SAFE_INTEGER) {
    throw new Error(`Too many spatial clusters for exact face keys: ${count}`);
  }
  clusterX = new Float32Array(count);
  clusterY = new Float32Array(count);
  clusterZ = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const weight = clusterWeight[i];
    clusterX[i] = clusterSumX[i] / weight;
    clusterY[i] = clusterSumY[i] / weight;
    clusterZ[i] = clusterSumZ[i] / weight;
  }
  faceBase = count;
  topologyStarted = true;
  console.error(`Clustered ${vertexCursor} source vertices into ${count} runtime vertices`);
}

function resolveVertex(raw) {
  const value = Number.parseInt(raw.split("/", 1)[0], 10);
  if (!Number.isSafeInteger(value) || value === 0) throw new Error(`Invalid OBJ index: ${raw}`);
  const index = value < 0 ? vertexCursor + value : value - 1;
  if (index < 0 || index >= vertexCursor) throw new Error(`OBJ index is out of range: ${raw}`);
  return vertexClusters[index];
}

function addFace(line) {
  const parts = line.trim().split(/\s+/);
  if (parts.length !== 4) throw new Error("Only triangular OBJ faces are supported");
  const a = resolveVertex(parts[1]);
  const b = resolveVertex(parts[2]);
  const c = resolveVertex(parts[3]);
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

console.error(`Streaming and clustering ${input} at resolution ${resolution}...`);
const lines = createInterface({ input: createReadStream(input), crlfDelay: Infinity });
for await (const line of lines) {
  if (line.startsWith("v ")) {
    if (topologyStarted) throw new Error("OBJ contains vertices after its face topology began");
    if (vertexCursor >= expectedVertices) throw new Error("OBJ contains more vertices than its metadata");
    const values = line.slice(2).trim().split(/\s+/);
    const x = (Number.parseFloat(values[0]) - center[0]) * scale;
    const y = (Number.parseFloat(values[1]) - center[1]) * scale;
    const z = (Number.parseFloat(values[2]) - center[2]) * scale;
    const key = cellKey(x, y, z);
    let cluster = clusterLookup.get(key);
    if (cluster === undefined) {
      cluster = clusterSumX.length;
      clusterLookup.set(key, cluster);
      clusterSumX.push(0);
      clusterSumY.push(0);
      clusterSumZ.push(0);
      clusterWeight.push(0);
    }
    clusterSumX[cluster] += x;
    clusterSumY[cluster] += y;
    clusterSumZ[cluster] += z;
    clusterWeight[cluster] += 1;
    vertexClusters[vertexCursor++] = cluster;
  } else if (line.startsWith("f ")) {
    if (!topologyStarted) finalizeClusters();
    sourceFaces++;
    addFace(line);
  }
}

if (!topologyStarted) throw new Error("OBJ has no faces");
if (vertexCursor !== expectedVertices || sourceFaces !== expectedFaces) {
  throw new Error(
    `Source topology changed: expected ${expectedVertices}/${expectedFaces} vertices/faces, received ${vertexCursor}/${sourceFaces}`,
  );
}

const used = new Uint8Array(clusterX.length);
for (const index of clusteredFaces) used[index] = 1;
const remap = new Int32Array(clusterX.length);
remap.fill(-1);
let runtimeVertices = 0;
for (let i = 0; i < used.length; i++) {
  if (used[i]) remap[i] = runtimeVertices++;
}

const positions = new Float32Array(runtimeVertices * 3);
for (let source = 0; source < remap.length; source++) {
  const target = remap[source];
  if (target < 0) continue;
  positions[target * 3] = clusterX[source];
  positions[target * 3 + 1] = clusterY[source];
  positions[target * 3 + 2] = clusterZ[source];
}

const compactFaces = [];
for (let i = 0; i < clusteredFaces.length; i += 3) {
  const a = remap[clusteredFaces[i]];
  const b = remap[clusteredFaces[i + 1]];
  const c = remap[clusteredFaces[i + 2]];
  const ax = positions[a * 3];
  const ay = positions[a * 3 + 1];
  const az = positions[a * 3 + 2];
  const abx = positions[b * 3] - ax;
  const aby = positions[b * 3 + 1] - ay;
  const abz = positions[b * 3 + 2] - az;
  const acx = positions[c * 3] - ax;
  const acy = positions[c * 3 + 1] - ay;
  const acz = positions[c * 3 + 2] - az;
  const nx = aby * acz - abz * acy;
  const ny = abz * acx - abx * acz;
  const nz = abx * acy - aby * acx;
  if (nx * nx + ny * ny + nz * nz >= 1e-12) compactFaces.push(a, b, c);
}

const triangleCount = compactFaces.length / 3;
const edgeNeighbor = new Int32Array(triangleCount * 3);
edgeNeighbor.fill(-1);
const edgeRequiresFlip = new Uint8Array(triangleCount * 3);
const edgeLookup = new Map();
let nonManifoldEdges = 0;

for (let face = 0; face < triangleCount; face++) {
  const a = compactFaces[face * 3];
  const b = compactFaces[face * 3 + 1];
  const c = compactFaces[face * 3 + 2];
  const faceVertices = [a, b, c];
  for (let edge = 0; edge < 3; edge++) {
    const start = faceVertices[edge];
    const end = faceVertices[(edge + 1) % 3];
    const low = Math.min(start, end);
    const high = Math.max(start, end);
    const key = low * runtimeVertices + high;
    const direction = start < end ? 1 : 0;
    const slot = face * 3 + edge;
    const first = edgeLookup.get(key);
    if (first === undefined) {
      edgeLookup.set(key, slot * 2 + direction);
      continue;
    }
    const firstSlot = Math.floor(first / 2);
    const firstDirection = first % 2;
    if (edgeNeighbor[firstSlot] >= 0) {
      nonManifoldEdges++;
      continue;
    }
    const relation = firstDirection === direction ? 1 : 0;
    edgeNeighbor[firstSlot] = slot;
    edgeNeighbor[slot] = firstSlot;
    edgeRequiresFlip[firstSlot] = relation;
    edgeRequiresFlip[slot] = relation;
  }
}
edgeLookup.clear();

const faceFlip = new Int8Array(triangleCount);
faceFlip.fill(-1);
const faceComponent = new Int32Array(triangleCount);
const queue = new Int32Array(triangleCount);
let componentCount = 0;
let windingConflicts = 0;

for (let seed = 0; seed < triangleCount; seed++) {
  if (faceFlip[seed] >= 0) continue;
  let read = 0;
  let write = 0;
  queue[write++] = seed;
  faceFlip[seed] = 0;
  faceComponent[seed] = componentCount;
  while (read < write) {
    const face = queue[read++];
    for (let edge = 0; edge < 3; edge++) {
      const slot = face * 3 + edge;
      const neighborSlot = edgeNeighbor[slot];
      if (neighborSlot < 0) continue;
      const neighbor = Math.floor(neighborSlot / 3);
      const expected = faceFlip[face] ^ edgeRequiresFlip[slot];
      if (faceFlip[neighbor] < 0) {
        faceFlip[neighbor] = expected;
        faceComponent[neighbor] = componentCount;
        queue[write++] = neighbor;
      } else if (faceFlip[neighbor] !== expected) {
        windingConflicts++;
      }
    }
  }
  componentCount++;
}

const componentX = new Float64Array(componentCount);
const componentY = new Float64Array(componentCount);
const componentZ = new Float64Array(componentCount);
const componentFaces = new Uint32Array(componentCount);
for (let face = 0; face < triangleCount; face++) {
  const component = faceComponent[face];
  const a = compactFaces[face * 3] * 3;
  const b = compactFaces[face * 3 + 1] * 3;
  const c = compactFaces[face * 3 + 2] * 3;
  componentX[component] += (positions[a] + positions[b] + positions[c]) / 3;
  componentY[component] += (positions[a + 1] + positions[b + 1] + positions[c + 1]) / 3;
  componentZ[component] += (positions[a + 2] + positions[b + 2] + positions[c + 2]) / 3;
  componentFaces[component]++;
}
for (let component = 0; component < componentCount; component++) {
  componentX[component] /= componentFaces[component];
  componentY[component] /= componentFaces[component];
  componentZ[component] /= componentFaces[component];
}

const orientationScore = new Float64Array(componentCount);
for (let face = 0; face < triangleCount; face++) {
  let a = compactFaces[face * 3];
  let b = compactFaces[face * 3 + 1];
  let c = compactFaces[face * 3 + 2];
  if (faceFlip[face]) [b, c] = [c, b];
  const ax = positions[a * 3];
  const ay = positions[a * 3 + 1];
  const az = positions[a * 3 + 2];
  const bx = positions[b * 3];
  const by = positions[b * 3 + 1];
  const bz = positions[b * 3 + 2];
  const cx = positions[c * 3];
  const cy = positions[c * 3 + 1];
  const cz = positions[c * 3 + 2];
  const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
  const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
  const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const component = faceComponent[face];
  const centerX = (ax + bx + cx) / 3 - componentX[component];
  const centerY = (ay + by + cy) / 3 - componentY[component];
  const centerZ = (az + bz + cz) / 3 - componentZ[component];
  orientationScore[component] += nx * centerX + ny * centerY + nz * centerZ;
}

const componentFlip = new Uint8Array(componentCount);
let flippedComponents = 0;
for (let component = 0; component < componentCount; component++) {
  if (orientationScore[component] < 0) {
    componentFlip[component] = 1;
    flippedComponents++;
  }
}

const normalSums = new Float32Array(runtimeVertices * 3);
for (let face = 0; face < triangleCount; face++) {
  const offset = face * 3;
  const a = compactFaces[offset];
  let b = compactFaces[offset + 1];
  let c = compactFaces[offset + 2];
  if (faceFlip[face] ^ componentFlip[faceComponent[face]]) {
    [b, c] = [c, b];
    compactFaces[offset + 1] = b;
    compactFaces[offset + 2] = c;
  }
  const ax = positions[a * 3];
  const ay = positions[a * 3 + 1];
  const az = positions[a * 3 + 2];
  const nx = (positions[b * 3 + 1] - ay) * (positions[c * 3 + 2] - az) -
    (positions[b * 3 + 2] - az) * (positions[c * 3 + 1] - ay);
  const ny = (positions[b * 3 + 2] - az) * (positions[c * 3] - ax) -
    (positions[b * 3] - ax) * (positions[c * 3 + 2] - az);
  const nz = (positions[b * 3] - ax) * (positions[c * 3 + 1] - ay) -
    (positions[b * 3 + 1] - ay) * (positions[c * 3] - ax);
  for (const vertex of [a, b, c]) {
    normalSums[vertex * 3] += nx;
    normalSums[vertex * 3 + 1] += ny;
    normalSums[vertex * 3 + 2] += nz;
  }
}
console.error(
  `Oriented ${triangleCount} faces across ${componentCount} components ` +
  `(${flippedComponents} component flips, ${windingConflicts} conflicts, ${nonManifoldEdges} non-manifold edges)`,
);

const normals = new Int16Array(runtimeVertices * 3);
for (let i = 0; i < runtimeVertices; i++) {
  const nx = normalSums[i * 3];
  const ny = normalSums[i * 3 + 1];
  const nz = normalSums[i * 3 + 2];
  const length = Math.hypot(nx, ny, nz) || 1;
  normals[i * 3] = Math.round((nx / length) * 32767);
  normals[i * 3 + 1] = Math.round((ny / length) * 32767);
  normals[i * 3 + 2] = Math.round((nz / length) * 32767);
}

const colorCellSize = 0.2;
const colorStride = 128;
const pointGrid = new Map();
function colorKey(x, y, z) {
  const ix = Math.floor((x + 8) / colorCellSize);
  const iy = Math.floor((y + 8) / colorCellSize);
  const iz = Math.floor((z + 8) / colorCellSize);
  return ix + colorStride * (iy + colorStride * iz);
}
for (let i = 0; i < sampledPoints.length; i += 3) {
  const key = colorKey(sampledPoints[i], sampledPoints[i + 1], sampledPoints[i + 2]);
  let bucket = pointGrid.get(key);
  if (!bucket) {
    bucket = [];
    pointGrid.set(key, bucket);
  }
  bucket.push(i / 3);
}

const colors = new Uint8Array(runtimeVertices * 3);
for (let vertex = 0; vertex < runtimeVertices; vertex++) {
  const x = positions[vertex * 3];
  const y = positions[vertex * 3 + 1];
  const z = positions[vertex * 3 + 2];
  const gx = Math.floor((x + 8) / colorCellSize);
  const gy = Math.floor((y + 8) / colorCellSize);
  const gz = Math.floor((z + 8) / colorCellSize);
  let nearest = -1;
  let nearestDistance = Infinity;

  for (let radius = 1; radius <= 5 && nearest < 0; radius += 2) {
    for (let dz = -radius; dz <= radius; dz++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const bucket = pointGrid.get(
            gx + dx + colorStride * (gy + dy + colorStride * (gz + dz)),
          );
          if (!bucket) continue;
          for (const point of bucket) {
            const px = sampledPoints[point * 3] - x;
            const py = sampledPoints[point * 3 + 1] - y;
            const pz = sampledPoints[point * 3 + 2] - z;
            const distance = px * px + py * py + pz * pz;
            if (distance < nearestDistance) {
              nearest = point;
              nearestDistance = distance;
            }
          }
        }
      }
    }
  }
  if (nearest < 0) throw new Error(`Could not transfer a source color to vertex ${vertex}`);
  colors[vertex * 3] = sampledColors[nearest * 3];
  colors[vertex * 3 + 1] = sampledColors[nearest * 3 + 1];
  colors[vertex * 3 + 2] = sampledColors[nearest * 3 + 2];
}

const indices = Uint32Array.from(compactFaces);
const headerBytes = 64;
const positionOffset = headerBytes;
const normalOffset = positionOffset + positions.byteLength;
const colorOffset = normalOffset + normals.byteLength;
const indexOffset = Math.ceil((colorOffset + colors.byteLength) / 4) * 4;
const byteLength = indexOffset + indices.byteLength;
const asset = Buffer.alloc(byteLength);
asset.writeUInt32LE(0x54434149, 0); // IACT
asset.writeUInt32LE(1, 4);
asset.writeUInt32LE(runtimeVertices, 8);
asset.writeUInt32LE(indices.length / 3, 12);
asset.writeUInt32LE(positionOffset, 16);
asset.writeUInt32LE(normalOffset, 20);
asset.writeUInt32LE(colorOffset, 24);
asset.writeUInt32LE(indexOffset, 28);
asset.writeUInt32LE(byteLength, 32);
asset.writeUInt32LE(resolution, 36);
Buffer.from(positions.buffer).copy(asset, positionOffset);
Buffer.from(normals.buffer).copy(asset, normalOffset);
Buffer.from(colors.buffer).copy(asset, colorOffset);
Buffer.from(indices.buffer).copy(asset, indexOffset);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, asset);
console.log(JSON.stringify({
  input,
  output,
  resolution,
  sourceVertices: vertexCursor,
  sourceTriangles: sourceFaces,
  vertices: runtimeVertices,
  triangles: indices.length / 3,
  bytes: byteLength,
  pointSamples: sampledPoints.length / 3,
}));
