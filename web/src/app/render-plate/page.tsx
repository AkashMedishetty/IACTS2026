"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

/**
 * LOCAL RENDER RIG — not part of any concept, not linked, noindex.
 *
 * Loads the validated IACT v2 textured mesh (authored UVs + authored Int16
 * normals) and the original diffuse atlas, and renders it as a large still so it
 * can be captured to a flat image asset. Nothing here ships to a concept page;
 * the concept consumes only the captured PNG.
 */

const MESH = "/models/cardio-thoracic/cardio-thoracic.textured.meshbin";
const DIFFUSE = "/models/cardio-thoracic/cardio-thoracic.diffuse.jpg";
const HEADER = 64;
const MAGIC = 0x54434149;

type Mesh = {
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture;
};

function parse(buffer: ArrayBuffer) {
  const h = new DataView(buffer);
  if (h.getUint32(0, true) !== MAGIC || h.getUint32(4, true) !== 2) {
    throw new Error("mesh magic/version mismatch");
  }
  const vertices = h.getUint32(8, true);
  const triangles = h.getUint32(12, true);
  const positionOffset = h.getUint32(16, true);
  const normalOffset = h.getUint32(20, true);
  const uvOffset = h.getUint32(24, true);
  const indexOffset = h.getUint32(28, true);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(buffer, positionOffset, vertices * 3), 3));
  geometry.setAttribute("normal", new THREE.Int16BufferAttribute(new Int16Array(buffer, normalOffset, vertices * 3), 3, true));
  geometry.setAttribute("uv", new THREE.Uint16BufferAttribute(new Uint16Array(buffer, uvOffset, vertices * 2), 2, true));
  geometry.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(buffer, indexOffset, triangles * 3), 1));
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  return geometry;
}

export default function RenderPlate() {
  const [mesh, setMesh] = useState<Mesh | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(MESH).then((r) => r.arrayBuffer()),
      new THREE.TextureLoader().loadAsync(DIFFUSE),
    ])
      .then(([buffer, texture]) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        setMesh({ geometry: parse(buffer), texture });
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <div data-render-state="error">{error}</div>;
  if (!mesh) return <div data-render-state="loading">loading</div>;

  const box = mesh.geometry.boundingBox!;
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.y);

  return (
    <div data-render-state="ready" style={{ width: "100vw", height: "100vh", background: "#ffffff" }}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 60], zoom: 1, near: 0.01, far: 400 }}
        dpr={2}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        onCreated={({ gl, camera, size: viewport }) => {
          gl.setClearColor("#ffffff", 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          const ortho = camera as THREE.OrthographicCamera;
          ortho.zoom = (Math.min(viewport.width, viewport.height) / span) * 0.92;
          ortho.updateProjectionMatrix();
        }}
      >
        {/* Neutral studio rig: reads form without inventing colour. */}
        <ambientLight intensity={0.95} />
        <directionalLight position={[-6, 8, 10]} intensity={1.5} />
        <directionalLight position={[7, -2, 6]} intensity={0.5} />
        <directionalLight position={[0, 2, -9]} intensity={0.35} />
        <group position={[-centre.x, -centre.y, -centre.z]} rotation={[0, -0.22, 0]}>
          <mesh geometry={mesh.geometry} frustumCulled={false}>
            <meshStandardMaterial
              map={mesh.texture}
              color={0xffffff}
              roughness={0.74}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </Canvas>
    </div>
  );
}
