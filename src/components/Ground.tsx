'use client';

import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import Grass from './Grass';

export default function Ground() {
  const grassPatches = useMemo(() => {
    const coords: [number, number][] = [
      [-20, 30],
      [15, -25],
      [-35, -40],
      [25, 45],
      [-10, 60],
    ];
    // Pre-computed deterministic values (instead of Math.random())
    const rotations = [0.7, 1.9, 2.4, 0.3, 1.1];
    const sizes = [7, 8.5, 6, 9, 7.5];
    return coords.map(([x, z], i) => ({
      x,
      z,
      rotation: rotations[i],
      size: sizes[i],
    }));
  }, []);

  return (
    <>
      {/* Main ground plane */}
      <RigidBody type="fixed" friction={1.2} name="ground">
        <mesh position={[0, -5, 0]} receiveShadow>
          <boxGeometry args={[400, 10, 400]} />
          <meshStandardMaterial color="#7ec850" />
        </mesh>
      </RigidBody>

      {/* Sandy area near the ocean side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, -0.03, 0]} receiveShadow>
        <planeGeometry args={[80, 200]} />
        <meshStandardMaterial color="#f0d9a0" />
      </mesh>

      {/* Darker patches for variety */}
      {grassPatches.map((patch, i) => (
        <mesh
          key={`grass-dark-${i}`}
          rotation={[-Math.PI / 2, 0, patch.rotation]}
          position={[patch.x, 0.01, patch.z]}
          receiveShadow
        >
          <circleGeometry args={[patch.size, 6]} />
          <meshStandardMaterial color="#5da83a" />
        </mesh>
      ))}

      {/* 3D popping grass blades spread across the map */}
      <Grass
        patches={[
          ...grassPatches.map(p => ({ x: p.x, z: p.z, size: p.size })),
          { x: 0, z: 0, size: 15 },
          { x: -15, z: -15, size: 12 },
          { x: 20, z: 20, size: 12 },
          { x: -30, z: 10, size: 10 },
          { x: 10, z: -40, size: 11 },
          { x: 30, z: -20, size: 10 },
          { x: -5, z: 35, size: 12 },
          { x: -40, z: -25, size: 10 },
          { x: 35, z: 10, size: 10 },
          { x: 0, z: -60, size: 12 },
          { x: -20, z: 55, size: 10 },
          { x: 40, z: 40, size: 10 },
        ]}
        density={900}
      />
    </>
  );
}
