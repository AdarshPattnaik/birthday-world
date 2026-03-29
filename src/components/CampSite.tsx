'use client';

import { useRef, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// An animated fire with glowing embers and light
function Bonfire({ position }: { position: [number, number, number] }) {
  const fireRef = useRef<THREE.Group>(null);
  
  // Animate the fire scaling up and down slightly to simulate flickering
  useFrame(({ clock }) => {
    if (!fireRef.current) return;
    const t = clock.getElapsedTime() * 8;
    const flicker = 1.0 + Math.sin(t) * 0.1 + Math.sin(t * 2.5) * 0.05;
    fireRef.current.scale.set(flicker, flicker, flicker);
  });

  return (
    <group position={position}>
      {/* Stone ring */}
      <RigidBody type="fixed" colliders="hull">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={`stone-${i}`} position={[Math.cos(angle) * 1.2, 0.2, Math.sin(angle) * 1.2]} rotation={[Math.random(), Math.random(), Math.random()]} castShadow>
              <dodecahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial color="#7f8c8d" roughness={0.9} />
            </mesh>
          );
        })}

        {/* Firewood logs */}
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 6]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 4, Math.PI / 2, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 6]} />
          <meshStandardMaterial color="#4e342e" />
        </mesh>
      </RigidBody>

      {/* The Fire */}
      <group ref={fireRef} position={[0, 0.8, 0]}>
        {/* Main flame */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.6, 1.5, 6]} />
          <meshStandardMaterial color="#ff5722" emissive="#ff5722" emissiveIntensity={2} transparent opacity={0.9} />
        </mesh>
        {/* Inner bright flame */}
        <mesh position={[0, -0.2, 0]}>
          <coneGeometry args={[0.4, 1.0, 6]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        {/* Dynamic PointLight for the bonfire glow */}
        <pointLight position={[0, 1, 0]} intensity={4} distance={20} color="#ff9800" castShadow />
      </group>
    </group>
  );
}

// A cozy triangular camping tent
function Tent({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation} colliders="hull">
      <group>
        {/* Main tent fabric */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0, 2.5, 3, 4, 1, false, Math.PI / 4]} />
          <meshStandardMaterial color="#e67e22" roughness={0.8} />
        </mesh>
        {/* Inside dark mat */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[3.2, 0.1, 3.2]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Wooden poles in front */}
        <mesh position={[-0.8, 1.5, 1.8]} rotation={[0, 0, -Math.PI / 8]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3.2, 6]} />
          <meshStandardMaterial color="#8d6e4a" />
        </mesh>
        <mesh position={[0.8, 1.5, 1.8]} rotation={[0, 0, Math.PI / 8]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3.2, 6]} />
          <meshStandardMaterial color="#8d6e4a" />
        </mesh>
      </group>
    </RigidBody>
  );
}

// Pushable log seating
function LogSeat({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <RigidBody type="dynamic" position={position} rotation={[0, rotation, 0]} mass={5} restitution={0.2} friction={0.9}>
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 2.5, 8]} />
        <meshStandardMaterial color="#6d4c41" />
      </mesh>
      {/* Wood rings on the ends */}
      <mesh position={[1.26, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 8]} />
        <meshStandardMaterial color="#d7ccc8" />
      </mesh>
      <mesh position={[-1.26, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 8]} />
        <meshStandardMaterial color="#d7ccc8" />
      </mesh>
    </RigidBody>
  );
}

// A pot hanging over the fire
function CookingPot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Wooden stands */}
      <mesh position={[-0.8, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      <mesh position={[0.8, 0.8, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      {/* Horizontal bar */}
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.8, 6]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      {/* Hanging rope */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
        <meshStandardMaterial color="#bdc3c7" />
      </mesh>
      {/* The Pot */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0.3, Math.PI]} />
        <meshStandardMaterial color="#212121" roughness={0.7} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Stew inside */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 16]} />
        <meshStandardMaterial color="#d84315" roughness={0.3} />
      </mesh>
    </group>
  );
}

// A classic red and white checkered picnic blanket
function PicnicBlanket({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders="cuboid">
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial color="#e53935" />
      </mesh>
      {/* White stripes to make checkered pattern */}
      <mesh position={[0, 0.11, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[1, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
        <meshStandardMaterial color="#ffeb3b" /> {/* Cheese block */}
      </mesh>
    </RigidBody>
  );
}

// A wooden sign
function SignBoard({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders="hull">
      {/* Post */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.15, 2, 0.15]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      {/* Board */}
      <mesh position={[0, 1.6, 0.1]} castShadow>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      {/* Text */}
      <Text position={[0, 1.6, 0.16]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
        Camp Mallow ⛺
      </Text>
    </RigidBody>
  );
}

// Glowing animated fireflies
function Fireflies({ center, count = 30 }: { center: [number, number, number]; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const flies = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 20,
        y: 1 + Math.random() * 3,
        z: (Math.random() - 0.5) * 20,
        speed: 0.5 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2,
        radius: 0.5 + Math.random() * 2,
      });
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    flies.forEach((f, i) => {
      const angle = t * f.speed + f.offset;
      dummy.position.set(
        center[0] + f.x + Math.sin(angle) * f.radius,
        f.y + Math.cos(angle * 0.8) * 0.5,
        center[2] + f.z + Math.cos(angle) * f.radius
      );
      // scale flickers slightly
      const scale = 0.05 + Math.sin(t * f.speed * 4) * 0.02;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#cddc39" />
    </instancedMesh>
  );
}

// A rustic wooden lamppost
function RusticLamppost({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      {/* Wooden Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4, 6]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      {/* Horizontal arm */}
      <mesh position={[0.4, 3.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 6]} />
        <meshStandardMaterial color="#4e342e" />
      </mesh>
      {/* Hanging lantern */}
      <mesh position={[0.8, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 6]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      {/* Lantern Glow */}
      <mesh position={[0.8, 3.5, 0]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#ffcc80" emissive="#ffcc80" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Light source */}
      <pointLight position={[0.8, 3.4, 0]} intensity={3} distance={15} color="#ffcc80" />
    </RigidBody>
  );
}

export default function CampSite() {
  const siteCenter: [number, number, number] = [-60, 0, 40];

  // Generate rustic fence posts around the campsite perimeter
  const fencePosts = useMemo(() => {
    const posts: { pos: [number, number, number]; rot: number }[] = [];
    const radius = 19; // Just inside the dirt patch edge
    const segments = 32;
    const gapStart = -Math.PI / 4 - 0.4; // Entrance gap facing towards the origin where the road comes from
    const gapEnd = -Math.PI / 4 + 0.4;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Skip the entrance area
      if (angle > gapStart && angle < gapEnd) continue;
      
      posts.push({
        pos: [
          siteCenter[0] + Math.cos(angle) * radius,
          0,
          siteCenter[2] + Math.sin(angle) * radius,
        ] as [number, number, number],
        rot: -angle,
      });
    }
    return posts;
  }, [siteCenter]);

  return (
    <group>
      {/* Dirt clearing patch for the campsite - expanded to 20 radius */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[siteCenter[0], 0.02, siteCenter[2]]} receiveShadow>
        <circleGeometry args={[20, 24]} />
        <meshStandardMaterial color="#8d6e63" roughness={1.0} />
      </mesh>

      {/* The Bonfire and Cooking Pot in the center */}
      <Bonfire position={siteCenter} />
      <CookingPot position={[siteCenter[0], 0, siteCenter[2]]} />

      {/* Expanded Tents placed around the fire */}
      <Tent position={[siteCenter[0] - 8, 0, siteCenter[2] - 5]} rotation={[0, Math.PI / 3, 0]} />
      <Tent position={[siteCenter[0] + 7, 0, siteCenter[2] - 8]} rotation={[0, -Math.PI / 4, 0]} />
      <Tent position={[siteCenter[0], 0, siteCenter[2] - 10]} rotation={[0, Math.PI, 0]} />

      {/* Log benches for sitting near the fire */}
      <LogSeat position={[siteCenter[0], 0, siteCenter[2] + 4]} rotation={0} />
      <LogSeat position={[siteCenter[0] - 4, 0, siteCenter[2] + 2]} rotation={-Math.PI / 4} />
      <LogSeat position={[siteCenter[0] + 4, 0, siteCenter[2] + 2]} rotation={Math.PI / 4} />

      {/* New Picnic Area */}
      <PicnicBlanket position={[siteCenter[0] - 10, 0, siteCenter[2] + 8]} rotation={Math.PI / 6} />

      {/* Entrance Signboard */}
      <SignBoard position={[siteCenter[0] + 12, 0, siteCenter[2] + 12]} rotation={-Math.PI / 4} />

      {/* Atmospheric Fireflies */}
      <Fireflies center={siteCenter} count={60} />

      {/* Extra dynamic objects to push around */}
      <RigidBody type="dynamic" position={[siteCenter[0] + 10, 1, siteCenter[2] + 4]} mass={2}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#a1887f" />
        </mesh>
      </RigidBody>
      <RigidBody type="dynamic" position={[siteCenter[0] + 10, 2, siteCenter[2] + 4]} mass={1}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#a1887f" />
        </mesh>
      </RigidBody>
      <RigidBody type="dynamic" position={[siteCenter[0] + 11.5, 1, siteCenter[2] + 3]} mass={1.5}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
      </RigidBody>

      {/* Dirt road leading to the campsite entrance */}
      <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 4]} position={[siteCenter[0] + 25, 0.01, siteCenter[2] - 25]} receiveShadow>
        <planeGeometry args={[4, 50]} />
        <meshStandardMaterial color="#795548" roughness={1.0} />
      </mesh>

      {/* Rustic Wooden Boundaries */}
      {fencePosts.map((post, i) => (
        <RigidBody key={`camp-fence-${i}`} type="dynamic" position={post.pos} rotation={[0, post.rot, 0]} mass={0.8} restitution={0.3}>
          {/* Main big post */}
          <mesh position={[0, 0.6, 0]} rotation={[0, 0, (Math.random() - 0.5) * 0.1]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 1.2, 5]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
          {/* Horizontal crooked logs */}
          <mesh position={[0, 0.8, 1.8]} rotation={[Math.PI / 2, 0, (Math.random() - 0.5) * 0.2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 3.6, 5]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          <mesh position={[0, 0.4, 1.8]} rotation={[Math.PI / 2, 0, (Math.random() - 0.5) * 0.2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 3.6, 5]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
        </RigidBody>
      ))}

      {/* Rustic Entrance Gateway (Arch) */}
      <RigidBody type="fixed" position={[siteCenter[0] + 14, 0, siteCenter[2] - 14]} rotation={[0, -Math.PI / 4, 0]} colliders="hull">
        {/* Left tall post */}
        <mesh position={[-3, 2, 0]} rotation={[0, 0, 0.05]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 4, 6]} />
          <meshStandardMaterial color="#4e342e" />
        </mesh>
        {/* Right tall post */}
        <mesh position={[3, 2, 0]} rotation={[0, 0, -0.05]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 4, 6]} />
          <meshStandardMaterial color="#4e342e" />
        </mesh>
        {/* Top cross beam */}
        <mesh position={[0, 3.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 7, 6]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        {/* Hanging sign from arch */}
        <mesh position={[0, 3.2, 0]} castShadow>
          <boxGeometry args={[3, 0.8, 0.1]} />
          <meshStandardMaterial color="#3e2723" />
        </mesh>
        {/* Welcome Text facing outwards */}
        <Text position={[0, 3.2, 0.06]} fontSize={0.4} color="#ffeb3b" anchorX="center" anchorY="middle">
          ~ WELCOME ~
        </Text>
        {/* Welcome Text facing inwards */}
        <Text position={[0, 3.2, -0.06]} rotation={[0, Math.PI, 0]} fontSize={0.4} color="#ffeb3b" anchorX="center" anchorY="middle">
          ~ WELCOME ~
        </Text>
      </RigidBody>

      {/* Rustic Lampposts along the road and entrance */}
      <RusticLamppost position={[siteCenter[0] + 8, 0, siteCenter[2] - 16]} />
      <RusticLamppost position={[siteCenter[0] + 16, 0, siteCenter[2] - 8]} />
      <RusticLamppost position={[siteCenter[0] + 25, 0, siteCenter[2] - 30]} />
      <RusticLamppost position={[siteCenter[0] + 30, 0, siteCenter[2] - 25]} />
      
    </group>
  );
}
