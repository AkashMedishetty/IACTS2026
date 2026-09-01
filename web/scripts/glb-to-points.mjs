import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { Matrix4, Quaternion, Triangle, Vector3 } from "three";

const [, , input, output, countArg = "70000", seedArg = "20261023"] = process.argv;
if (!input || !output) {
  console.error("Usage: node scripts/glb-to-points.mjs <input.glb> <output.json> [count] [seed]");
  process.exit(1);
}
const count = Number.parseInt(countArg, 10);
const seed = Number.parseInt(seedArg, 10);
if (!Number.isSafeInteger(count) || count < 1 || !Number.isSafeInteger(seed)) {
  throw new Error("count and seed must be positive integers");
}

function parseGlb(file) {
  const data = readFileSync(file);
  if (data.readUInt32LE(0) !== 0x46546c67 || data.readUInt32LE(4) !== 2) {
    throw new Error(`${file} is not a glTF 2.0 binary`);
  }
  let json;
  let bin;
  for (let offset = 12; offset < data.length;) {
    const length = data.readUInt32LE(offset);
    const type = data.readUInt32LE(offset + 4);
    const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString("utf8").trim());
    if (type === 0x004e4942) bin = chunk;
    offset += 8 + length;
  }
  if (!json || !bin) throw new Error("GLB must contain JSON and BIN chunks");
  return { json, bin };
}

const COMPONENTS = {
  5120: [1, "getInt8"],
  5121: [1, "getUint8"],
  5122: [2, "getInt16"],
  5123: [2, "getUint16"],
  5125: [4, "getUint32"],
  5126: [4, "getFloat32"],
};
const WIDTHS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const { json: gltf, bin } = parseGlb(input);
const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);

function readAccessor(index) {
  const accessor = gltf.accessors[index];
  if (accessor.sparse) throw new Error("Sparse accessors are not supported");
  const bufferView = gltf.bufferViews[accessor.bufferView];
  const component = COMPONENTS[accessor.componentType];
  const width = WIDTHS[accessor.type];
  if (!component || !width) throw new Error(`Unsupported accessor ${accessor.componentType}/${accessor.type}`);
  const [bytes, getter] = component;
  const stride = bufferView.byteStride ?? bytes * width;
  const start = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const values = new Array(accessor.count * width);
  for (let i = 0; i < accessor.count; i++) {
    for (let j = 0; j < width; j++) {
      values[i * width + j] = view[getter](start + i * stride + j * bytes, true);
    }
  }
  return values;
}

function nodeMatrix(node) {
  if (node.matrix) return new Matrix4().fromArray(node.matrix);
  return new Matrix4().compose(
    new Vector3(...(node.translation ?? [0, 0, 0])),
    new Quaternion(...(node.rotation ?? [0, 0, 0, 1])),
    new Vector3(...(node.scale ?? [1, 1, 1])),
  );
}

const triangles = [];
const cumulative = [];
let totalArea = 0;
const a = new Vector3();
const b = new Vector3();
const c = new Vector3();

function addMesh(meshIndex, matrix) {
  for (const primitive of gltf.meshes[meshIndex].primitives) {
    if ((primitive.mode ?? 4) !== 4) throw new Error("Only triangle primitives are supported");
    const positions = readAccessor(primitive.attributes.POSITION);
    const indices = primitive.indices === undefined
      ? Array.from({ length: positions.length / 3 }, (_, i) => i)
      : readAccessor(primitive.indices);
    for (let i = 0; i + 2 < indices.length; i += 3) {
      const ia = indices[i] * 3;
      const ib = indices[i + 1] * 3;
      const ic = indices[i + 2] * 3;
      a.set(positions[ia], positions[ia + 1], positions[ia + 2]).applyMatrix4(matrix);
      b.set(positions[ib], positions[ib + 1], positions[ib + 2]).applyMatrix4(matrix);
      c.set(positions[ic], positions[ic + 1], positions[ic + 2]).applyMatrix4(matrix);
      const area = new Triangle(a, b, c).getArea();
      if (area <= 1e-8) continue;
      triangles.push([...a, ...b, ...c]);
      totalArea += area;
      cumulative.push(totalArea);
    }
  }
}

function walkNode(index, parent) {
  const node = gltf.nodes[index];
  const world = parent.clone().multiply(nodeMatrix(node));
  if (node.mesh !== undefined) addMesh(node.mesh, world);
  for (const child of node.children ?? []) walkNode(child, world);
}
for (const root of gltf.scenes[gltf.scene ?? 0].nodes ?? []) walkNode(root, new Matrix4());
if (!triangles.length || totalArea <= 0) throw new Error("No sampleable triangles found");

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
function triangleAt(area) {
  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (cumulative[mid] < area) low = mid + 1;
    else high = mid;
  }
  return triangles[low];
}

const random = randomFactory(seed);
const points = new Float32Array(count * 3);
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < count; i++) {
  const tri = triangleAt(random() * totalArea);
  let u = random();
  let v = random();
  if (u + v > 1) { u = 1 - u; v = 1 - v; }
  const w = 1 - u - v;
  for (let axis = 0; axis < 3; axis++) {
    const value = tri[axis] * w + tri[axis + 3] * u + tri[axis + 6] * v;
    points[i * 3 + axis] = value;
    min[axis] = Math.min(min[axis], value);
    max[axis] = Math.max(max[axis], value);
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
writeFileSync(`${stem}.meta.json`, JSON.stringify({
  format: "iacts-point-cloud/v1",
  source: basename(input),
  points: count,
  components: 3,
  triangles: triangles.length,
  seed,
  normalization: { maxDimension: 8, sourceBounds: { min, max }, center, scale },
}, null, 2));

const dots = [];
for (let i = 0; i < count; i += Math.max(1, Math.floor(count / 8000))) {
  const x = 410 + points[i * 3] * 48;
  const y = 410 - points[i * 3 + 2] * 48;
  dots.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.7"/>`);
}
writeFileSync(`${stem}.preview.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 820"><rect width="820" height="820" fill="#fbfbfc"/><g fill="#8d0e16" fill-opacity=".5">${dots.join("")}</g></svg>`);
console.log(JSON.stringify({ input, output, points: count, triangles: triangles.length, bytes: points.byteLength, sourceSize, scale }));
