'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.8 + Math.sin(clock.getElapsedTime() * 0.5) * 0.15;
    }
  });

  return (
    <group>
      {/* Main ocean plane */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[130, -0.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 400]} />
        <meshStandardMaterial
          color="#2980b9"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ocean depth faux */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[130, -1.5, 0]}>
        <planeGeometry args={[200, 400]} />
        <meshStandardMaterial color="#1a5276" />
      </mesh>

      {/* Beach transition */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[85, -0.02, 0]}>
        <planeGeometry args={[30, 200]} />
        <meshStandardMaterial color="#f5e6c8" />
      </mesh>
    </group>
  );
}
