import { readFileSync } from "node:fs";
import { Box3, Vector3 } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
const noopImage = () => ({ style:{}, set src(_v){}, get src(){return "";}, setAttribute(){}, addEventListener(){}, removeEventListener(){} });
globalThis.self ??= globalThis; globalThis.window ??= globalThis;
globalThis.document ??= { createElementNS: () => noopImage(), createElement: () => ({ ...noopImage(), getContext: () => null }) };
globalThis.URL.createObjectURL ??= () => ""; globalThis.URL.revokeObjectURL ??= () => {};
const buf = readFileSync(process.argv[2]);
const g = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "");
g.updateMatrixWorld(true);
const rows = [];
g.traverse((c) => {
  if (!c.isMesh) return;
  const b = new Box3().setFromObject(c);
  const s = b.getSize(new Vector3()), ctr = b.getCenter(new Vector3());
  rows.push({ name: c.name || "(unnamed)", tris: (c.geometry.index ? c.geometry.index.count : c.geometry.attributes.position.count) / 3,
              size: [s.x, s.y, s.z].map(n => +n.toFixed(1)), c: [ctr.x, ctr.y, ctr.z].map(n => +n.toFixed(1)) });
});
rows.sort((a, b) => b.tris - a.tris);
for (const r of rows) console.log(`  ${String(Math.round(r.tris)).padStart(8)} tris  size=${JSON.stringify(r.size).padEnd(24)} centre=${JSON.stringify(r.c).padEnd(24)} ${r.name}`);
