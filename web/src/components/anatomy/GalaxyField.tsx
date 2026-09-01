"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InteractionState } from "./AnatomyParticles";

type Props = {
  interaction: RefObject<InteractionState>;
  reducedMotion: boolean;
};

const COUNT = 2600;

/** Deterministic value noise — same pattern as AnatomyParticles, so the field is
    stable across renders and identical on server and client. */
function hash(value: number) {
  const x = Math.sin(value * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Ambient depth field. This is scene atmosphere only — it never touches the
 * authored cardiothoracic model, its UV texture, or its colours. It fades in as
 * the hero aperture opens so the page reads as one continuous 3D space.
 */
export default function GalaxyField({ interaction, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);

  const { geometry, material } = useMemo(() => {
    // Mobile GPUs get a lighter field. Scene is client-only (ssr:false), so
    // reading the viewport here cannot desync with server markup.
    const count = typeof window !== "undefined" && window.innerWidth < 768
      ? Math.round(COUNT * 0.45)
      : COUNT;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      // Flattened disc shell: reads as a galaxy rather than a uniform cube.
      const radius = 9 + Math.pow(hash(i + 1.7), 0.6) * 26;
      const theta = hash(i + 37.3) * Math.PI * 2;
      const arm = Math.sin(theta * 2) * 2.4;
      positions[i * 3] = Math.cos(theta) * radius + (hash(i + 91.1) - 0.5) * 6;
      positions[i * 3 + 1] = (hash(i + 133.9) - 0.5) * 12 + arm;
      positions[i * 3 + 2] = Math.sin(theta) * radius + (hash(i + 211.5) - 0.5) * 6 - 6;
      scales[i] = 0.45 + hash(i + 307.2) * 1.5;
    }

    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nextGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    nextGeometry.computeBoundingSphere();

    const nextMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0 },
        uPixelRatio: { value: 1 },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float aScale;
        uniform float uPixelRatio;
        uniform float uTime;
        varying float vFade;
        void main() {
          vec3 shifted = position;
          shifted.y += sin(uTime * 0.16 + position.x * 0.12) * 0.35;
          vec4 mvPosition = modelViewMatrix * vec4(shifted, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(aScale * uPixelRatio * (26.0 / -mvPosition.z), 0.7, 3.4);
          vFade = clamp((-mvPosition.z - 6.0) / 34.0, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vFade;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float core = 1.0 - smoothstep(0.05, 0.5, d);
          vec3 tint = mix(vec3(0.70, 0.07, 0.16), vec3(0.09, 0.04, 0.05), vFade);
          gl_FragColor = vec4(tint, core * uOpacity * (1.0 - vFade * 0.55));
        }
      `,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });

    return { geometry: nextGeometry, material: nextMaterial };
  }, []);

  const materialRef = useRef(material);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    if (!group.current || !interaction.current) return;
    const progress = reducedMotion ? 1 : interaction.current.progress;
    // Appears as soon as the cloud starts disintegrating out of the hero.
    const target = THREE.MathUtils.smoothstep(progress, 0.02, 0.16) * 0.9;
    const live = materialRef.current;
    live.uniforms.uOpacity.value = THREE.MathUtils.damp(
      live.uniforms.uOpacity.value,
      target,
      3.5,
      delta,
    );
    live.uniforms.uTime.value = state.clock.elapsedTime;
    live.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    group.current.rotation.y += delta * 0.016;
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      state.pointer.y * 0.05,
      3,
      delta,
    );
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} renderOrder={0} />
    </group>
  );
}
