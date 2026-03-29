'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// Simple seeded random to keep grass deterministic (no flicker on re-render)
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

interface GrassPatch {
  x: number;
  z: number;
  size: number;
}

export default function Grass({ patches, density = 400 }: { patches: GrassPatch[]; density?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const totalCount = patches.length * density;

  // Pre-compute all matrices and colors once
  const { matrices, colors } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const grassColors = ['#ffeb3b', '#fdd835', '#fbc02d', '#f9a825', '#fff176', '#fff9c4', '#ffee58'];

    let seed = 1;
    for (const patch of patches) {
      for (let j = 0; j < density; j++) {
        const r1 = seededRandom(seed++);
        const r2 = seededRandom(seed++);
        const r3 = seededRandom(seed++);
        const r4 = seededRandom(seed++);
        const r5 = seededRandom(seed++);

        // Scatter tightly within a circle - reduced radius multiplier for dense packing
        const radius = Math.sqrt(r1) * patch.size * 0.5;
        const theta = r2 * Math.PI * 2;
        const x = patch.x + radius * Math.cos(theta);
        const z = patch.z + radius * Math.sin(theta);

        const scaleY = 0.6 + r3 * 0.7; // taller blades
        const scaleXZ = 0.12 + r4 * 0.12; // thin but visible

        dummy.position.set(x, scaleY * 0.35, z); // pop up from ground
        dummy.rotation.set(0, r5 * Math.PI * 2, 0);
        dummy.scale.set(scaleXZ, scaleY, scaleXZ);
        dummy.updateMatrix();
        mats.push(dummy.matrix.clone());

        const c = new THREE.Color(grassColors[Math.floor(r5 * grassColors.length)]);
        cols.push(c);
      }
    }
    return { matrices: mats, colors: cols };
  }, [patches, density]);

  // Apply matrices and colors AFTER the mesh mounts (useEffect, not useMemo)
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < matrices.length; i++) {
      mesh.setMatrixAt(i, matrices[i]);
      mesh.setColorAt(i, colors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices, colors]);

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, totalCount]} frustumCulled={false}>
      <coneGeometry args={[0.15, 0.9, 3]} />
      <meshBasicMaterial color="#ffeb3b" />
    </instancedMesh>
  );
}
