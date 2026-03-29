'use client';

import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

function RoadSegment({
  position,
  rotation = [0, 0, 0],
  width = 8,
  length = 6,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  length?: number;
}) {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation} friction={1.5} name="road">
      <mesh receiveShadow>
        <boxGeometry args={[width, 0.15, length]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>
      {/* Center line */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.15, 0.02, length * 0.6]} />
        <meshStandardMaterial color="#f1c40f" />
      </mesh>
    </RigidBody>
  );
}

export default function Road() {
  const segments = useMemo(() => {
    const segs: Array<{
      pos: [number, number, number];
      rot: [number, number, number];
      w?: number;
      l?: number;
    }> = [];

    // Straight road sections forming a rough loop/track
    // North straight
    for (let i = 0; i < 8; i++) {
      segs.push({ pos: [0, 0, -40 + i * 6], rot: [0, 0, 0] });
    }

    // East curve (turn right)
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI) / 10;
      const r = 20;
      segs.push({
        pos: [Math.sin(angle) * r, 0, 10 + Math.cos(angle) * r],
        rot: [0, -angle, 0],
      });
    }

    // East straight
    for (let i = 0; i < 6; i++) {
      segs.push({ pos: [20 + i * 5.5, 0, 30], rot: [0, Math.PI / 2, 0] });
    }

    // South curve  
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI) / 10;
      const r = 18;
      segs.push({
        pos: [50 + Math.cos(angle) * r, 0, 30 - Math.sin(angle) * r],
        rot: [0, -(Math.PI / 2 + angle), 0],
      });
    }

    // South straight
    for (let i = 0; i < 6; i++) {
      segs.push({ pos: [68, 0, 12 - i * 5.5], rot: [0, 0, 0] });
    }

    // West curve
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI) / 10;
      const r = 18;
      segs.push({
        pos: [68 - Math.sin(angle) * r, 0, -22 - Math.cos(angle) * r],
        rot: [0, angle, 0],
      });
    }

    // West straight back
    for (let i = 0; i < 8; i++) {
      segs.push({ pos: [50 - i * 6.5, 0, -40], rot: [0, Math.PI / 2, 0] });
    }

    // Final curve back to start
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 8;
      const r = 15;
      segs.push({
        pos: [-2 - Math.cos(angle) * r, 0, -40 + Math.sin(angle) * r],
        rot: [0, Math.PI / 2 + angle, 0],
      });
    }

    return segs;
  }, []);

  return (
    <group>
      {segments.map((seg, i) => (
        <RoadSegment
          key={`road-${i}`}
          position={seg.pos}
          rotation={seg.rot}
          width={seg.w}
          length={seg.l}
        />
      ))}
    </group>
  );
}
