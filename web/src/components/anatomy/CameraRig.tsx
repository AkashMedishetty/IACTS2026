"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InteractionState } from "./AnatomyParticles";

type Props = {
  interaction: RefObject<InteractionState>;
  reducedMotion: boolean;
};

/**
 * Continuous camera path.
 *
 * Deliberately NOT a set of discrete stations with snap timing. Station legs had
 * to be keyed to something, and every candidate (page fraction, hero exit, the
 * station elements) drifted out of step with the other timelines. A continuous
 * function of the SAME progress value the particles use cannot desync: there is
 * one clock, and the camera is a pure function of it.
 */
export default function CameraRig({ interaction, reducedMotion }: Props) {
  const focus = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (!interaction.current) return;
    const p = reducedMotion ? 1 : THREE.MathUtils.clamp(interaction.current.progress, 0, 1);

    // A long, slow arc through the field. Always keeps the subject in frame.
    const swing = Math.sin(p * Math.PI * 1.35);
    const rise = Math.sin(p * Math.PI * 1.9);
    const dolly = Math.sin(p * Math.PI);

    const x = swing * 5.2 + state.pointer.x * 0.6;
    const y = rise * 2.4 + state.pointer.y * 0.4;
    const z = 14 - dolly * 4.2;

    const camera = state.camera;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 3.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y, 3.2, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 3.2, delta);
    camera.lookAt(focus.current);
  });

  return null;
}
