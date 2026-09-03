/**
 * FBX -> textured runtime mesh (iacts meshbin v2), grid-decimated.
 *
 * The source heart is 8.65M triangles, far past anything a browser should
 * load, so vertices are clustered onto a uniform grid and faces rebuilt from
 * the cluster ids. Positions reuse the point cloud's normalisation (read from
 * its meta file) so the solid and the cloud occupy exactly the same space —
 * the scene morphs between them.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Vector3 } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const noopImage = () => ({ style: {}, set src(_v) {}, get src() { return ""; }, setAttribute() {}, addEventListener() {}, removeEventListener() {} });
globalThis.self ??= globalThis; globalThis.window ??= globalThis;
globalThis.document ??= { createElementNS: () => noopImage(), createElement: () => ({ ...noopImage(), getContext: () => null }) };
globalThis.URL.createObjectURL ??= () => ""; globalThis.URL.revokeObjectURL ??= () => {};

const [, , input, output, metaPath, resArg = "220"] = process.argv;
if (!input || !output || !metaPath) {
  console.error("Usage: node scripts/fbx-to-runtime-mesh.mjs <in.fbx> <out.meshbin> <points.meta.json> [resolution]");
  process.exit(1);
}
const resolution = Number.parseInt(resArg, 10);
const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const { center, scale } = meta.normalization;

console.error("Parsing FBX...");
const buf = readFileSync(input);
const group = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), dirname(input) + "/");
group.updateMatrixWorld(true);

const meshes = [];
group.traverse((c) => { if (c.isMesh && c.geometry?.attributes?.position) meshes.push(c); });
const triCount = (m) => (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
const mesh = meshes.reduce((best, m) => (triCount(m) > triCount(best) ? m : best), meshes[0]);
console.error(`Dominant mesh "${mesh.name}" — ${Math.round(triCount(mesh))} triangles`);

const g = mesh.geometry;
const pos = g.attributes.position, uv = g.attributes.uv, index = g.index;
const faces = index ? index.count / 3 : pos.count / 3;

// normalise into the point cloud's space first
const v = new Vector3();
const N = pos.count;
const px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N);
for (let i = 0; i < N; i += 1) {
  v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
  px[i] = (v.x - center[0]) * scale;
  py[i] = (v.y - center[1]) * scale;
  pz[i] = (v.z - center[2]) * scale;
}

// grid clustering over the normalised bounds
let mnx = Infinity, mny = Infinity, mnz = Infinity, mxx = -Infinity, mxy = -Infinity, mxz = -Infinity;
for (let i = 0; i < N; i += 1) {
  if (px[i] < mnx) mnx = px[i]; if (px[i] > mxx) mxx = px[i];
  if (py[i] < mny) mny = py[i]; if (py[i] > mxy) mxy = py[i];
  if (pz[i] < mnz) mnz = pz[i]; if (pz[i] > mxz) mxz = pz[i];
}
const span = Math.max(mxx - mnx, mxy - mny, mxz - mnz) || 1;
const cell = span / resolution;
const cellOf = (i) => {
  const cx = Math.min(resolution, Math.max(0, Math.floor((px[i] - mnx) / cell)));
  const cy = Math.min(resolution, Math.max(0, Math.floor((py[i] - mny) / cell)));
  const cz = Math.min(resolution, Math.max(0, Math.floor((pz[i] - mnz) / cell)));
  return (cx * (resolution + 1) + cy) * (resolution + 1) + cz;
};

const acc = new Map(); // cell -> {x,y,z,nx,ny,nz,u,v,w}
const vertexCell = new Int32Array(N);
for (let i = 0; i < N; i += 1) vertexCell[i] = cellOf(i);

console.error("Clustering...");
const a = new Vector3(), b = new Vector3(), c = new Vector3(), ab = new Vector3(), ac = new Vector3(), nrm = new Vector3();
const clusteredFaces = [];
for (let f = 0; f < faces; f += 1) {
  const i0 = index ? index.getX(f * 3) : f * 3;
  const i1 = index ? index.getX(f * 3 + 1) : f * 3 + 1;
  const i2 = index ? index.getX(f * 3 + 2) : f * 3 + 2;
  const c0 = vertexCell[i0], c1 = vertexCell[i1], c2 = vertexCell[i2];
  if (c0 === c1 || c1 === c2 || c0 === c2) continue;   // collapsed by clustering
  a.set(px[i0], py[i0], pz[i0]); b.set(px[i1], py[i1], pz[i1]); c.set(px[i2], py[i2], pz[i2]);
  nrm.copy(ab.subVectors(b, a).cross(ac.subVectors(c, a)));
  const area = nrm.length() * 0.5;
  if (!(area > 0)) continue;
  nrm.normalize();
  for (const [ci, vi] of [[c0, i0], [c1, i1], [c2, i2]]) {
    let e = acc.get(ci);
    if (!e) { e = { x: 0, y: 0, z: 0, nx: 0, ny: 0, nz: 0, u: 0, v: 0, w: 0 }; acc.set(ci, e); }
    e.x += px[vi]; e.y += py[vi]; e.z += pz[vi];
    e.nx += nrm.x; e.ny += nrm.y; e.nz += nrm.z;
    if (uv) { e.u += uv.getX(vi); e.v += uv.getY(vi); }
    e.w += 1;
  }
  clusteredFaces.push(c0, c1, c2);
}

const order = [...acc.keys()];
const remap = new Map(order.map((k, i) => [k, i]));
const count = order.length;
const positions = new Float32Array(count * 3);
const normals = new Int16Array(count * 3);
const uvs = new Uint16Array(count * 2);
order.forEach((k, t) => {
  const e = acc.get(k);
  positions[t*3] = e.x / e.w; positions[t*3+1] = e.y / e.w; positions[t*3+2] = e.z / e.w;
  const len = Math.hypot(e.nx, e.ny, e.nz) || 1;
  normals[t*3] = Math.round((e.nx/len)*32767); normals[t*3+1] = Math.round((e.ny/len)*32767); normals[t*3+2] = Math.round((e.nz/len)*32767);
  uvs[t*2] = Math.round(Math.max(0, Math.min(1, e.u/e.w))*65535);
  uvs[t*2+1] = Math.round(Math.max(0, Math.min(1, e.v/e.w))*65535);
});
const indices = new Uint32Array(clusteredFaces.length);
for (let i = 0; i < clusteredFaces.length; i += 1) indices[i] = remap.get(clusteredFaces[i]);

const headerBytes = 64;
const positionOffset = headerBytes;
const normalOffset = positionOffset + positions.byteLength;
const uvOffset = normalOffset + normals.byteLength;
const indexOffset = Math.ceil((uvOffset + uvs.byteLength) / 4) * 4;
const byteLength = indexOffset + indices.byteLength;
const asset = Buffer.alloc(byteLength);
asset.writeUInt32LE(0x54434149, 0);
asset.writeUInt32LE(2, 4);
asset.writeUInt32LE(count, 8);
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
console.log(JSON.stringify({ resolution, sourceTriangles: faces, vertices: count, triangles: indices.length/3, bytes: byteLength }));
