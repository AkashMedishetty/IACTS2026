"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { anatomyFragmentShader, anatomyVertexShader } from "./anatomyShaders";

export type InteractionState = {
  progress: number;
  impulse: number;
  dragX: number;
  dragY: number;
  pointerX?: number;
  pointerY?: number;
  /** Which station is in view (0 = hero) and how far through it we are. Driven
      by the station elements themselves, NOT by warped page progress. */
  stationIndex?: number;
  stationLocal?: number;
};

export type SolidMeshData = {
  positions: Float32Array;
  normals: Int16Array;
  uvs: Uint16Array;
  indices: Uint32Array;
};

type Props = {
  positions: Float32Array;
  colors: Uint8Array;
  solid: SolidMeshData;
  texture: THREE.Texture;
  interaction: RefObject<InteractionState>;
  reducedMotion: boolean;
  surfaceBookends?: boolean;
};

const anchors = [
  [1.35, 0.0],
  [-1.35, 0.18],
  [1.5, -0.25],
  [-1.15, 0.18],
  [1.15, 0.0],
] as const;

function hash(value: number) {
  const x = Math.sin(value * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function AnatomyParticles({
  positions,
  colors,
  solid,
  texture,
  interaction,
  reducedMotion,
  surfaceBookends = false,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const solidMesh = useRef<THREE.Mesh>(null);
  const assets = useMemo(() => {
    const count = positions.length / 3;
    const scatter = new Float32Array(positions.length);
    const phase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const sourceAngle = Math.atan2(z, x);
      const sector = Math.floor(((sourceAngle + Math.PI) / (Math.PI * 2)) * 12) % 12;
      const band = Math.max(0, Math.min(6, Math.floor(((y + 4) / 8) * 7)));
      const angle = ((sector + 0.5) / 12) * Math.PI * 2 - Math.PI;
      const vertical = (band - 3) * 0.18;
      const length = Math.hypot(Math.cos(angle), vertical, Math.sin(angle));
      const magnitude = 4.5 + hash(i + 3.1) * 7.5;
      const tangent = (hash(i + 71.7) - 0.5) * 2.2;

      scatter[i * 3] = (Math.cos(angle) / length) * magnitude - Math.sin(angle) * tangent;
      scatter[i * 3 + 1] = (vertical / length) * magnitude + (hash(i + 19.2) - 0.5) * 1.4;
      scatter[i * 3 + 2] = (Math.sin(angle) / length) * magnitude + Math.cos(angle) * tangent;
      phase[i] = hash(i + 101.3);
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointGeometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
    pointGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    pointGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3, true));
    pointGeometry.computeBoundingSphere();

    const pointMaterial = new THREE.ShaderMaterial({
      vertexShader: anatomyVertexShader,
      fragmentShader: anatomyFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: reducedMotion ? 1 : 0 },
        uSolidMix: { value: reducedMotion ? 1 : 0 },
        uImpulse: { value: 0 },
        uPixelRatio: { value: 1 },
        uPointer: { value: new THREE.Vector2() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      toneMapped: false,
    });

    const solidGeometry = new THREE.BufferGeometry();
    solidGeometry.setAttribute("position", new THREE.BufferAttribute(solid.positions, 3));
    solidGeometry.setAttribute("normal", new THREE.Int16BufferAttribute(solid.normals, 3, true));
    solidGeometry.setAttribute("uv", new THREE.Uint16BufferAttribute(solid.uvs, 2, true));
    solidGeometry.setIndex(new THREE.Uint32BufferAttribute(solid.indices, 1));
    solidGeometry.computeBoundingSphere();

    const solidMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xffffff,
      roughness: 0.76,
      metalness: 0,
      transparent: false,
      opacity: reducedMotion ? 1 : 0,
      depthWrite: true,
      side: THREE.DoubleSide,
      dithering: true,
    });
    solidMaterial.alphaHash = true;
    solidMaterial.forceSinglePass = true;

    return { pointGeometry, pointMaterial, solidGeometry, solidMaterial };
  }, [positions, colors, solid, texture, reducedMotion]);

  const pointMaterialRef = useRef(assets.pointMaterial);
  const solidMaterialRef = useRef(assets.solidMaterial);
  const pointerTarget = useRef(new THREE.Vector2());
  const lastImpulse = useRef(0);

  useEffect(() => {
    pointMaterialRef.current = assets.pointMaterial;
    solidMaterialRef.current = assets.solidMaterial;
    return () => {
      assets.pointGeometry.dispose();
      assets.pointMaterial.dispose();
      assets.solidGeometry.dispose();
      assets.solidMaterial.dispose();
      texture.dispose();
    };
  }, [assets, texture]);

  useFrame((state, delta) => {
    if (!group.current || !interaction.current) return;
    const controls = interaction.current;
    const liveMaterial = pointMaterialRef.current;
    const liveSolidMaterial = solidMaterialRef.current;
    const progress = reducedMotion ? 1 : controls.progress;
    liveMaterial.uniforms.uProgress.value = THREE.MathUtils.damp(
      liveMaterial.uniforms.uProgress.value,
      progress,
      5.5,
      delta,
    );
    const easedProgress = liveMaterial.uniforms.uProgress.value;
    // The hero opens on the raw point cloud; the authored solid is the CLOSING
    // state only, rebuilt at the end where the registration CTA lives.
    const solidMix = THREE.MathUtils.smoothstep(
      easedProgress,
      surfaceBookends ? 0.84 : 0.91,
      surfaceBookends ? 0.99 : 0.995,
    );
    liveMaterial.uniforms.uSolidMix.value = solidMix;
    liveSolidMaterial.opacity = solidMix * solidMix * (3 - 2 * solidMix);
    // Alpha-hash gives a clean depth-correct dissolve, but its stochastic
    // dithering is what makes the FINISHED surface look jagged and speckled.
    // Once the reveal is complete, render it as a plain opaque solid.
    const settled = solidMix > 0.985;
    if (liveSolidMaterial.alphaHash === settled) {
      liveSolidMaterial.alphaHash = !settled;
      liveSolidMaterial.opacity = settled ? 1 : liveSolidMaterial.opacity;
      liveSolidMaterial.needsUpdate = true;
    }
    if (points.current) points.current.visible = solidMix < 0.999;
    if (solidMesh.current) solidMesh.current.visible = solidMix > 0.001;

    if (controls.impulse !== lastImpulse.current) {
      liveMaterial.uniforms.uImpulse.value = 1;
      lastImpulse.current = controls.impulse;
    } else {
      liveMaterial.uniforms.uImpulse.value = Math.max(0, liveMaterial.uniforms.uImpulse.value - delta * 1.8);
    }
    liveMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    liveMaterial.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    pointerTarget.current.set(
      controls.pointerX ?? state.pointer.x,
      controls.pointerY ?? state.pointer.y,
    );
    liveMaterial.uniforms.uPointer.value.lerp(pointerTarget.current, 1 - Math.exp(-delta * 7));

    const stage = Math.min(3, Math.floor(progress * 4));
    const local = progress * 4 - stage;
    const responsiveMix = THREE.MathUtils.smoothstep(state.viewport.aspect, 0.62, 1.28);
    const horizontalTravel = THREE.MathUtils.lerp(0.28, 1, responsiveMix);
    // In the hero the model is framed by the centre depth circle, so it is
    // pinned to the middle and only drifts once the aperture has opened.
    const centreLock = surfaceBookends
      ? 1 - THREE.MathUtils.smoothstep(easedProgress, 0.06, 0.26)
      : 0;
    const returnLock = surfaceBookends
      ? THREE.MathUtils.smoothstep(easedProgress, 0.74, 0.92)
      : 0;
    const pinned = Math.max(centreLock, returnLock);
    const x =
      THREE.MathUtils.lerp(anchors[stage][0], anchors[stage + 1][0], local) *
      horizontalTravel *
      (1 - pinned);
    const y = THREE.MathUtils.lerp(anchors[stage][1], anchors[stage + 1][1], local);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, x, 4.5, delta);
    // On narrow layouts the model block is the FIRST thing in the hero, so the
    // subject is lifted into the upper third to land in it. (This was a negative
    // offset while that block sat below the copy; the reorder inverted it.)
    const stackedLift = surfaceBookends ? (1 - responsiveMix) * centreLock * 1.62 : 0;
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      y * (1 - pinned) + stackedLift,
      4.5,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, controls.dragY * 0.003 + state.pointer.y * 0.035, 5, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.28 + progress * 0.62 + controls.dragX * 0.003 + state.pointer.x * 0.065, 5, delta);
    const baseScale =
      THREE.MathUtils.lerp(0.5, 0.76, responsiveMix) *
      (surfaceBookends ? (1 - solidMix * 0.08) * (1 - centreLock * 0.3) : 1);
    const impulseScale = 1 + solidMix * liveMaterial.uniforms.uImpulse.value * 0.018;
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, baseScale * impulseScale, 5, delta),
    );
  });

  return (
    <group ref={group}>
      <mesh
        ref={solidMesh}
        geometry={assets.solidGeometry}
        material={assets.solidMaterial}
        visible={reducedMotion}
        frustumCulled={false}
        renderOrder={1}
      />
      <points
        ref={points}
        geometry={assets.pointGeometry}
        material={assets.pointMaterial}
        visible={!reducedMotion}
        frustumCulled={false}
        renderOrder={2}
      />
    </group>
  );
}
