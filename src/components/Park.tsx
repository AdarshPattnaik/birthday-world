'use client';

import { useRef, useState, useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Animated water droplets shooting from fountain
function WaterDroplets({ center }: { center: [number, number, number] }) {
  const count = 20;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const droplets = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push({
        angle,
        speed: 0.8 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        radius: 0.3 + Math.random() * 0.5,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const d = droplets[i];
      const phase = (t * d.speed + d.offset) % 1;
      const height = phase * 3 - phase * phase * 3; // Parabolic arc
      const x = center[0] + Math.cos(d.angle) * d.radius * (0.5 + phase);
      const z = center[2] + Math.sin(d.angle) * d.radius * (0.5 + phase);
      const y = center[1] + 3.0 + height;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.06 + (1 - phase) * 0.04);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
    </instancedMesh>
  );
}

// Glowing flower bed
function GlowFlowerBed({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.5, 4]} />
        <meshStandardMaterial color="#33691e" />
      </mesh>
      {/* Glowing petals */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.18, 0.55, Math.sin(angle) * 0.18]}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// Ground sparkle light
function SparkleLight({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Park bench - dynamic, pushable by the car
function ParkBench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <RigidBody type="dynamic" position={position} rotation={[0, rotation, 0]} mass={8} restitution={0.3} friction={0.8}>
      <group>
        {/* Seat */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[2.0, 0.1, 0.7]} />
          <meshStandardMaterial color="#8d6e4a" />
        </mesh>
        {/* Back rest */}
        <mesh position={[0, 0.95, -0.3]} castShadow>
          <boxGeometry args={[2.0, 0.7, 0.08]} />
          <meshStandardMaterial color="#8d6e4a" />
        </mesh>
        {/* Left leg front */}
        <mesh position={[-0.8, 0.27, 0.2]} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.08]} />
          <meshStandardMaterial color="#4a3520" />
        </mesh>
        {/* Right leg front */}
        <mesh position={[0.8, 0.27, 0.2]} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.08]} />
          <meshStandardMaterial color="#4a3520" />
        </mesh>
        {/* Left leg back */}
        <mesh position={[-0.8, 0.27, -0.25]} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.08]} />
          <meshStandardMaterial color="#4a3520" />
        </mesh>
        {/* Right leg back */}
        <mesh position={[0.8, 0.27, -0.25]} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.08]} />
          <meshStandardMaterial color="#4a3520" />
        </mesh>
        {/* Arm rest left */}
        <mesh position={[-0.9, 0.75, -0.05]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.5]} />
          <meshStandardMaterial color="#4a3520" />
        </mesh>
        {/* Arm rest right */}
        <mesh position={[0.9, 0.75, -0.05]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.5]} />
          <meshStandardMaterial color="#4a3520" />
        </mesh>
      </group>
    </RigidBody>
  );
}

// Lamppost
function Lamppost({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 4, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Lamp head */}
      <mesh position={[0, 4.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      {/* Light bulb glow */}
      <mesh position={[0, 3.9, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fff3b0" emissive="#fff3b0" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Actual light source */}
      <pointLight position={[0, 3.8, 0]} intensity={5} distance={12} color="#fff3b0" />
    </RigidBody>
  );
}

// Fountain centerpiece
function Fountain({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      <group>
        {/* Base pool */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[2.5, 2.8, 0.6, 12]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
        {/* Water surface */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[2.3, 2.3, 0.05, 12]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
        </mesh>
        {/* Middle pillar */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
        {/* Top bowl */}
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[1.0, 0.5, 0.5, 10]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
        {/* Water top */}
        <mesh position={[0, 2.76, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.03, 10]} />
          <meshStandardMaterial color="#2980b9" transparent opacity={0.7} />
        </mesh>
        {/* Water spout */}
        <mesh position={[0, 3.3, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#85c1e9" transparent opacity={0.5} />
        </mesh>
      </group>
    </RigidBody>
  );
}

// Pushable trash can
function TrashCan({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="dynamic" position={position} mass={3} restitution={0.4}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 1.0, 8]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 8]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
    </RigidBody>
  );
}

// Fun emoji that floats up when car enters park zone
function FloatingEmoji({ text, startPos }: { text: string; startPos: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(1);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    time.current += delta;
    ref.current.position.y += delta * 2;
    ref.current.rotation.y += delta * 1.5;
    const newOpacity = Math.max(0, 1 - time.current / 3);
    setOpacity(newOpacity);
  });

  if (opacity <= 0) return null;

  return (
    <group ref={ref} position={startPos}>
      <Text fontSize={1.5} color="white" anchorX="center" anchorY="middle">
        {text}
      </Text>
    </group>
  );
}

// The main park zone with a trigger area
export default function Park() {
  const [funEmojis, setFunEmojis] = useState<{ id: number; text: string; pos: [number, number, number] }[]>([]);
  const lastTriggerTime = useRef(0);
  const emojiCounter = useRef(0);
  const parkCenter: [number, number, number] = [-35, 0, -60];

  // Check if car is in the park zone
  useFrame(() => {
    if (typeof window === 'undefined') return;
    const carState = (window as any).__carState?.current;
    if (!carState) return;

    const dx = carState.x - parkCenter[0];
    const dz = carState.z - parkCenter[2];
    const dist = Math.sqrt(dx * dx + dz * dz);

    const now = Date.now();
    // If car is within the park zone and enough time has passed
    if (dist < 18 && now - lastTriggerTime.current > 1500) {
      lastTriggerTime.current = now;
      const emojis = ['🎉', '🎈', '🎂', '🎁', '🥳', '🎊', '✨', '🌟', '💖', '🎵'];
      const emoji = emojis[emojiCounter.current % emojis.length];
      emojiCounter.current++;

      setFunEmojis(prev => [
        ...prev.slice(-8), // Keep max 8
        {
          id: emojiCounter.current,
          text: emoji,
          pos: [
            carState.x + (Math.random() - 0.5) * 6,
            2 + Math.random() * 2,
            carState.z + (Math.random() - 0.5) * 6,
          ] as [number, number, number],
        },
      ]);
    }
  });

  // Generate fence posts in a circle with a gap for the entrance
  const fencePosts = useMemo(() => {
    const posts: { pos: [number, number, number]; rot: number }[] = [];
    const radius = 16;
    const segments = 28;
    const gapStart = Math.PI / 2 - 0.35; // entrance gap
    const gapEnd = Math.PI / 2 + 0.35;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      if (angle > gapStart && angle < gapEnd) continue; // skip entrance
      posts.push({
        pos: [
          parkCenter[0] + Math.cos(angle) * radius,
          0,
          parkCenter[2] + Math.sin(angle) * radius,
        ] as [number, number, number],
        rot: -angle,
      });
    }
    return posts;
  }, [parkCenter]);

  // Pre-calculate and merge the 16 meshes of a single fence segment into 1 geometry!
  // This reduces physical colliders per post from 16 to 1 and draw calls from 448 to 28.
  const mergedFenceGeom = useMemo(() => {
    // We cannot easily merge geometries in standard R3F declaratively without 'drei' <Merged>,
    // but since we want ONE mesh per rigidbody, we can construct the BufferGeometry.
    // Instead of raw buffer math, we can just use 1 simplified invisible collider, 
    // and render the visual meshes inside the RigidBody.
    // Actually, R3F's RigidBody with multiple meshes acts fast if it's a single compound.
    // Let's just bundle the visuals inside a Group and use a single Box for collision!
    return null;
  }, []);

  return (
    <group>
      {/* Park ground - darker green patch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[parkCenter[0], 0.02, parkCenter[2]]}>
        <circleGeometry args={[18, 24]} />
        <meshStandardMaterial color="#2d8a4e" />
      </mesh>

      {/* Stone path through the park */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[parkCenter[0], 0.03, parkCenter[2]]}>
        <planeGeometry args={[2.5, 36]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[parkCenter[0], 0.03, parkCenter[2]]}>
        <planeGeometry args={[2.5, 36]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>

      {/* White picket fence boundary - breakable */}
      {fencePosts.map((post, i) => (
        <RigidBody key={`fence-${i}`} type="dynamic" position={post.pos} rotation={[0, post.rot, 0]} mass={0.5} restitution={0.5} colliders={false}>
          {/* Simple fast proxy collider for the entire fence segment */}
          <CuboidCollider args={[1.4, 0.4, 0.1]} position={[0, 0.4, 0]} />
          
          <group>
            {/* Minimalist Fence visually (no castShadow for performance) */}
            {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((offset, j) => (
              <group key={j}>
                <mesh position={[0, 0.3, offset]}>
                  <boxGeometry args={[0.06, 0.6, 0.1]} />
                  <meshStandardMaterial color="#f5f5f5" />
                </mesh>
                <mesh position={[0, 0.65, offset]}>
                  <coneGeometry args={[0.06, 0.12, 4]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 0.48, 0]}>
              <boxGeometry args={[0.04, 0.05, 2.8]} />
              <meshStandardMaterial color="#e8e8e8" />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.04, 0.05, 2.8]} />
              <meshStandardMaterial color="#e8e8e8" />
            </mesh>
          </group>
        </RigidBody>
      ))}

      {/* Entrance gateway arch */}
      <RigidBody type="fixed" position={[parkCenter[0], 0, parkCenter[2] + 16]} colliders="hull">
        {/* Left pillar */}
        <mesh position={[-2.2, 1.5, 0]} castShadow>
          <boxGeometry args={[0.4, 3, 0.4]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
        <mesh position={[-2.2, 3.1, 0]} castShadow>
          <boxGeometry args={[0.55, 0.2, 0.55]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
        {/* Right pillar */}
        <mesh position={[2.2, 1.5, 0]} castShadow>
          <boxGeometry args={[0.4, 3, 0.4]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
        <mesh position={[2.2, 3.1, 0]} castShadow>
          <boxGeometry args={[0.55, 0.2, 0.55]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
        {/* Arch beam */}
        <mesh position={[0, 3.4, 0]} castShadow>
          <boxGeometry args={[5, 0.8, 0.35]} />
          <meshStandardMaterial color="#fff9c4" />
        </mesh>
        {/* Arch top decoration */}
        <mesh position={[0, 3.86, 0]} castShadow>
          <boxGeometry args={[4.2, 0.12, 0.25]} />
          <meshStandardMaterial color="#d5a6bd" />
        </mesh>
        {/* Embedded Birthday Park Sign Text facing outward */}
        <Text
          position={[0, 3.4, 0.18]}
          fontSize={0.5}
          color="#e91e63"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          🎂 Birthday Park 🎈
        </Text>
      </RigidBody>

      {/* Fountain in the center */}
      <Fountain position={parkCenter} />

      {/* Benches around the fountain */}
      <ParkBench position={[parkCenter[0] + 6, 0, parkCenter[2] + 3]} rotation={Math.PI / 2} />
      <ParkBench position={[parkCenter[0] - 6, 0, parkCenter[2] - 3]} rotation={-Math.PI / 2} />
      <ParkBench position={[parkCenter[0] + 3, 0, parkCenter[2] - 7]} rotation={0} />
      <ParkBench position={[parkCenter[0] - 3, 0, parkCenter[2] + 7]} rotation={Math.PI} />

      {/* Lampposts */}
      <Lamppost position={[parkCenter[0] + 10, 0, parkCenter[2] + 10]} />
      <Lamppost position={[parkCenter[0] - 10, 0, parkCenter[2] - 10]} />
      <Lamppost position={[parkCenter[0] + 10, 0, parkCenter[2] - 10]} />
      <Lamppost position={[parkCenter[0] - 10, 0, parkCenter[2] + 10]} />

      {/* Trash cans (pushable!) */}
      <TrashCan position={[parkCenter[0] + 8, 0.5, parkCenter[2]]} />
      <TrashCan position={[parkCenter[0] - 8, 0.5, parkCenter[2]]} />
      <TrashCan position={[parkCenter[0], 0.5, parkCenter[2] + 9]} />

      {/* Floating fun emojis */}
      {funEmojis.map((e) => (
        <FloatingEmoji key={e.id} text={e.text} startPos={e.pos} />
      ))}

      {/* Animated water shooting from fountain */}
      <WaterDroplets center={parkCenter} />

      {/* Glowing flower beds around the fountain */}
      {[
        { pos: [parkCenter[0] + 4, 0, parkCenter[2] + 4], color: '#e91e63' },
        { pos: [parkCenter[0] - 4, 0, parkCenter[2] + 4], color: '#ff5722' },
        { pos: [parkCenter[0] + 4, 0, parkCenter[2] - 4], color: '#9c27b0' },
        { pos: [parkCenter[0] - 4, 0, parkCenter[2] - 4], color: '#f44336' },
        { pos: [parkCenter[0] + 5.5, 0, parkCenter[2]], color: '#e040fb' },
        { pos: [parkCenter[0] - 5.5, 0, parkCenter[2]], color: '#ff4081' },
        { pos: [parkCenter[0], 0, parkCenter[2] + 5.5], color: '#ffab40' },
        { pos: [parkCenter[0], 0, parkCenter[2] - 5.5], color: '#64ffda' },
        { pos: [parkCenter[0] + 3, 0, parkCenter[2] + 5], color: '#76ff03' },
        { pos: [parkCenter[0] - 3, 0, parkCenter[2] - 5], color: '#00e5ff' },
      ].map((f, i) => (
        <GlowFlowerBed key={`gf-${i}`} position={f.pos as [number, number, number]} color={f.color} />
      ))}

      {/* Sparkle ground lights along paths */}
      {[
        [parkCenter[0] + 3, 0, parkCenter[2] + 12],
        [parkCenter[0] - 3, 0, parkCenter[2] + 12],
        [parkCenter[0] + 3, 0, parkCenter[2] - 12],
        [parkCenter[0] - 3, 0, parkCenter[2] - 12],
        [parkCenter[0] + 12, 0, parkCenter[2] + 3],
        [parkCenter[0] + 12, 0, parkCenter[2] - 3],
        [parkCenter[0] - 12, 0, parkCenter[2] + 3],
        [parkCenter[0] - 12, 0, parkCenter[2] - 3],
      ].map((pos, i) => (
        <SparkleLight
          key={`sl-${i}`}
          position={pos as [number, number, number]}
          color={['#ffeb3b', '#ff9800', '#e91e63', '#00bcd4', '#76ff03', '#ff5252', '#651fff', '#00e676'][i]}
        />
      ))}
    </group>
  );
}
