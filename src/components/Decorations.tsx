'use client';

import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Optimization: We decouple fixed Visuals from Physics.
// The physics are simple lightweight invisible cylinders for trunks.
// The visuals are batched into massive single-draw-call InstancedMeshes!
// ---------------------------------------------------------------------------

function Barrier({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[6, 0.8, 0.4]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      {/* White stripe */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[6, 0.25, 0.42]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
    </RigidBody>
  );
}

function Cone({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="dynamic" mass={0.3} position={position} restitution={0.5}>
      <mesh castShadow>
        <coneGeometry args={[0.25, 0.7, 8]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      {/* White stripe */}
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.2, 0.2, 8]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
    </RigidBody>
  );
}

export default function Decorations() {
  const treePositions = useMemo<[number, number, number][]>(
    () => [
      [-15, 0, -35], [-12, 0, -20], [-18, 0, -10], [-14, 0, 5], [-20, 0, 15],
      [-16, 0, 25], [-22, 0, 40], [-10, 0, 50], [30, 0, -30], [35, 0, -20],
      [-25, 0, -50], [-30, 0, -30], [-8, 0, -55], [40, 0, 50], [45, 0, 40],
      [10, 0, -55], [20, 0, -50], [-30, 0, 20], [-28, 0, 35], [75, 0, 20],
      [75, 0, -10], [78, 0, 5]
    ],
    []
  );

  const conePositions = useMemo<[number, number, number][]>(
    () => [
      [3, 0.5, -10], [-3, 0.5, -10], [3, 0.5, 0], [-3, 0.5, 0], [3, 0.5, 10], [-3, 0.5, 10],
      [25, 0.5, 28], [30, 0.5, 28], [35, 0.5, 28], [25, 0.5, 32], [30, 0.5, 32], [35, 0.5, 32]
    ],
    []
  );

  const barrierPositions = useMemo<{ pos: [number, number, number]; rot: [number, number, number] }[]>(
    () => [
      { pos: [-5, 0.4, -42], rot: [0, 0, 0] },
      { pos: [5, 0.4, -42], rot: [0, 0, 0] },
      { pos: [70, 0.4, -22], rot: [0, Math.PI / 2, 0] },
      { pos: [70, 0.4, -15], rot: [0, Math.PI / 2, 0] },
    ],
    []
  );

  // Pre-calculate batched instances for massive draw-call reduction
  const { trunks, leaves, flowerStems, flowerPetals, flowerCenters } = useMemo(() => {
    const _trunks: { id: string; pos: [number, number, number]; scale: number }[] = [];
    const _leaves: { id: string; pos: [number, number, number]; scale: number; color: string }[] = [];
    
    // Process Trees
    treePositions.forEach((pos, i) => {
      const hash = Math.abs(pos[0] * 13 + pos[2] * 7);
      const s = 0.7 + (hash % 100) / 100 * 0.6;
      const greens = [
        ['#27ae60', '#2ecc71', '#1abc9c'],
        ['#2ecc71', '#27ae60', '#16a085'],
        ['#1abc9c', '#2ecc71', '#27ae60'],
        ['#16a085', '#1abc9c', '#2ecc71'],
      ];
      const colors = greens[hash % 4];

      _trunks.push({ id: `t-${i}`, pos: [pos[0], pos[1] + 2 * s, pos[2]], scale: s });

      // Add 5 leaf clusters per tree
      const leafDefs = [
        { offset: [0, 4.5, 0], rad: 2.0, c: colors[0] },
        { offset: [0.8, 5.2, 0.5], rad: 1.5, c: colors[1] },
        { offset: [-0.7, 5.0, -0.4], rad: 1.4, c: colors[2] },
        { offset: [0.3, 5.8, 0.2], rad: 1.2, c: colors[0] },
        { offset: [-0.5, 4.2, 0.8], rad: 1.3, c: colors[1] },
      ];

      leafDefs.forEach((def, j) => {
        _leaves.push({
          id: `l-${i}-${j}`,
          pos: [pos[0] + def.offset[0] * s, pos[1] + def.offset[1] * s, pos[2] + def.offset[2] * s],
          scale: s * def.rad,
          color: def.c
        });
      });
    });

    // Process Flowers
    const _stems: { id: string; pos: [number, number, number] }[] = [];
    const _petals: { id: string; pos: [number, number, number]; color: string }[] = [];
    const _centers: { id: string; pos: [number, number, number] }[] = [];
    
    const flowerColors = ['#e91e63', '#ff5722', '#9c27b0', '#ff4081', '#f44336', '#e040fb', '#ffab40'];
    let seed = 42;
    for (let i = 0; i < 60; i++) {
        const r1 = Math.sin(seed++) * 43758.5453; const v1 = r1 - Math.floor(r1);
        const r2 = Math.sin(seed++) * 43758.5453; const v2 = r2 - Math.floor(r2);
        const r3 = Math.sin(seed++) * 43758.5453; const v3 = r3 - Math.floor(r3);
        const x = (v1 - 0.5) * 80;
        const z = (v2 - 0.5) * 80;
        const color = flowerColors[Math.floor(v3 * flowerColors.length)];

        _stems.push({ id: `s-${i}`, pos: [x, 0.3, z] });
        _centers.push({ id: `c-${i}`, pos: [x, 0.65, z] });

        for (let p = 0; p < 5; p++) {
          const angle = (p / 5) * Math.PI * 2;
          const px = x + Math.cos(angle) * 0.15;
          const pz = z + Math.sin(angle) * 0.15;
          _petals.push({ id: `p-${i}-${p}`, pos: [px, 0.65, pz], color });
        }
    }

    return { trunks: _trunks, leaves: _leaves, flowerStems: _stems, flowerPetals: _petals, flowerCenters: _centers };
  }, [treePositions]);

  return (
    <group>
      {/* 
        Physics Colliders for Trees 
        Instead of a heavy complex hull mesh per tree, we use a single fast invisible cylinder for the trunk!
      */}
      {treePositions.map((pos, i) => (
        <RigidBody key={`tpc-${i}`} type="fixed" position={pos} colliders="hull">
           <mesh visible={false} position={[0, 2, 0]}>
             <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
           </mesh>
        </RigidBody>
      ))}

      {/* Visually rendered via just 2 GPU Draw Calls for all 22 trees (132 objects)! */}
      <Instances castShadow limit={trunks.length}>
        <cylinderGeometry args={[0.25, 0.4, 4, 8]} />
        <meshStandardMaterial color="#6d4c2a" roughness={0.9} />
        {trunks.map(t => <Instance key={t.id} position={t.pos} scale={t.scale} />)}
      </Instances>

      <Instances castShadow limit={leaves.length}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#ffffff" />
        {leaves.map(l => <Instance key={l.id} position={l.pos} scale={l.scale} color={l.color} />)}
      </Instances>

      {/* Visually rendered via just 3 GPU Draw Calls for all 60 flowers (420 objects)! */}
      <Instances limit={flowerStems.length}>
        <cylinderGeometry args={[0.03, 0.04, 0.6, 4]} />
        <meshStandardMaterial color="#558b2f" />
        {flowerStems.map(s => <Instance key={s.id} position={s.pos} />)}
      </Instances>

      <Instances limit={flowerPetals.length}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
        {flowerPetals.map(p => <Instance key={p.id} position={p.pos} color={p.color} />)}
      </Instances>

      <Instances limit={flowerCenters.length}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#ffeb3b" />
        {flowerCenters.map(c => <Instance key={c.id} position={c.pos} />)}
      </Instances>

      {/* Breakable/Dynamic objects (Small count, so keeping as individual RigidBodies is fine) */}
      {conePositions.map((pos, i) => (
        <Cone key={`cone-${i}`} position={pos} />
      ))}
      {barrierPositions.map((b, i) => (
        <Barrier key={`barrier-${i}`} position={b.pos} rotation={b.rot} />
      ))}
    </group>
  );
}
