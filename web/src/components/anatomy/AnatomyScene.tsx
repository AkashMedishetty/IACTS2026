"use client";

import { useEffect, useState, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import CameraRig from "./CameraRig";
import GalaxyField from "./GalaxyField";
import AnatomyParticles, {
  type InteractionState,
  type SolidMeshData,
} from "./AnatomyParticles";

const POINTS_URL = "/models/cardio-thoracic/cardio-thoracic.points.f32";
const COLORS_URL = "/models/cardio-thoracic/cardio-thoracic.points.colors.u8";
const SOLID_URL = "/models/cardio-thoracic/cardio-thoracic.textured.meshbin";
const DIFFUSE_URL = "/models/cardio-thoracic/cardio-thoracic.diffuse.jpg";
const EXPECTED_VALUES = 70_000 * 3;
const SOLID_HEADER_BYTES = 64;
const SOLID_MAGIC = 0x54434149;

type Props = {
  interaction: RefObject<InteractionState>;
  reducedMotion: boolean;
  surfaceBookends?: boolean;
};

type AnatomyData = {
  positions: Float32Array;
  colors: Uint8Array;
  solid: SolidMeshData;
  texture: THREE.Texture;
};

function parseSolidMesh(buffer: ArrayBuffer): SolidMeshData {
  if (buffer.byteLength < SOLID_HEADER_BYTES) throw new Error("Textured mesh header is incomplete");
  const header = new DataView(buffer);
  const magic = header.getUint32(0, true);
  const version = header.getUint32(4, true);
  const vertices = header.getUint32(8, true);
  const triangles = header.getUint32(12, true);
  const positionOffset = header.getUint32(16, true);
  const normalOffset = header.getUint32(20, true);
  const uvOffset = header.getUint32(24, true);
  const indexOffset = header.getUint32(28, true);
  const declaredBytes = header.getUint32(32, true);
  const positionValues = vertices * 3;
  const uvValues = vertices * 2;
  const indices = triangles * 3;

  const valid =
    magic === SOLID_MAGIC &&
    version === 2 &&
    vertices > 0 &&
    vertices <= 200_000 &&
    triangles > 0 &&
    triangles <= 400_000 &&
    positionOffset === SOLID_HEADER_BYTES &&
    normalOffset === positionOffset + positionValues * Float32Array.BYTES_PER_ELEMENT &&
    uvOffset === normalOffset + positionValues * Int16Array.BYTES_PER_ELEMENT &&
    indexOffset >= uvOffset + uvValues * Uint16Array.BYTES_PER_ELEMENT &&
    indexOffset % Uint32Array.BYTES_PER_ELEMENT === 0 &&
    declaredBytes === indexOffset + indices * Uint32Array.BYTES_PER_ELEMENT &&
    declaredBytes === buffer.byteLength;
  if (!valid) throw new Error("Textured mesh binary failed validation");

  return {
    positions: new Float32Array(buffer, positionOffset, positionValues),
    normals: new Int16Array(buffer, normalOffset, positionValues),
    uvs: new Uint16Array(buffer, uvOffset, uvValues),
    indices: new Uint32Array(buffer, indexOffset, indices),
  };
}

function ContextGuard() {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const preserve = (event: Event) => event.preventDefault();
    canvas.addEventListener("webglcontextlost", preserve);
    return () => canvas.removeEventListener("webglcontextlost", preserve);
  }, [gl]);
  return null;
}

export default function AnatomyScene({ interaction, reducedMotion, surfaceBookends = false }: Props) {
  const [data, setData] = useState<AnatomyData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const loadBuffer = async (url: string) => {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`${url} returned ${response.status}`);
      return response.arrayBuffer();
    };

    Promise.all([
      loadBuffer(POINTS_URL),
      loadBuffer(COLORS_URL),
      loadBuffer(SOLID_URL),
      new THREE.TextureLoader().loadAsync(DIFFUSE_URL),
    ] as const)
      .then(([pointBuffer, colorBuffer, solidBuffer, texture]) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        const positions = new Float32Array(pointBuffer);
        const colors = new Uint8Array(colorBuffer);
        if (positions.length !== EXPECTED_VALUES || colors.length !== EXPECTED_VALUES) {
          texture.dispose();
          throw new Error(`Expected ${EXPECTED_VALUES} position/color values; received ${positions.length}/${colors.length}`);
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.anisotropy = 4;
        setData({ positions, colors, solid: parseSolidMesh(solidBuffer), texture });
      })
      .catch((reason: Error) => {
        if (reason.name !== "AbortError" && !cancelled) setError(reason.message);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (error) {
    return <div role="alert" className="grid h-full place-items-center font-mono text-xs uppercase tracking-[.16em] text-[#b3122a]">{error}</div>;
  }
  if (!data) {
    return <div role="status" className="grid h-full place-items-center font-mono text-xs uppercase tracking-[.16em] text-[#735b62]">Loading anatomical coordinates, authored texture, and surface…</div>;
  }

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 14], fov: 32, near: 0.1, far: 80 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
      }}
      performance={{ min: 0.55 }}
    >
      <ContextGuard />
      <ambientLight color="#ffffff" intensity={0.82} />
      <directionalLight color="#fffaf5" intensity={1.25} position={[-4.5, 6, 7]} />
      <directionalLight color="#e5edff" intensity={0.48} position={[5.5, 1.5, -5]} />
      {surfaceBookends ? (
        <>
          <CameraRig interaction={interaction} reducedMotion={reducedMotion} />
          <GalaxyField interaction={interaction} reducedMotion={reducedMotion} />
        </>
      ) : null}
      <AnatomyParticles
        positions={data.positions}
        colors={data.colors}
        solid={data.solid}
        texture={data.texture}
        interaction={interaction}
        reducedMotion={reducedMotion}
        surfaceBookends={surfaceBookends}
      />
    </Canvas>
  );
}
