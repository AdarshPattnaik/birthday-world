'use client';

import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

import { Text, Instances, Instance } from '@react-three/drei';

// -------------------------------------------------------------
// Helper components for the Water Park area
// -------------------------------------------------------------

function InflatableRing({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <RigidBody type="dynamic" colliders="hull" position={position} mass={5} linearDamping={4} angularDamping={4}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.5, 0.4, 8, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.1} clearcoat={1} />
      </mesh>
    </RigidBody>
  );
}

function BeachBall({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="dynamic" colliders="ball" position={position} mass={2} linearDamping={2} angularDamping={2} restitution={0.8}>
      <mesh castShadow>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#ffeb3b" />
      </mesh>
      {/* Red vertical stripe */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.81, 0.81, 1, 16]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
    </RigidBody>
  );
}

// -------------------------------------------------------------
// The massive central tower with climbing ramps and slides
// -------------------------------------------------------------

function SlideTower({ position }: { position: [number, number, number] }) {
  const towerHeight = 10;
  const towerWidth = 8;
  const rampLength = 35;
  const slideLength = 22;

  // Ascent Ramp Angle
  const climbAngle = Math.atan2(towerHeight, rampLength);
  const climbHypot = Math.sqrt(towerHeight ** 2 + rampLength ** 2);

  // Descent Slide Angle
  const slideAngle = Math.atan2(towerHeight, slideLength);
  const slideHypot = Math.sqrt(towerHeight ** 2 + slideLength ** 2);
  const slideHeightCenter = towerHeight / 2;

  // Aesthetic Colors
  const woodColor = "#f39c12";      // Wooden steps
  const slideColor1 = "#00cec9";    // Cool cyan slide
  const slideColor2 = "#fd79a8";    // Bright pink slide

  return (
    <group position={position}>
      
      {/* 1. TOP PLATFORM */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, towerHeight, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[towerWidth, 0.5, towerWidth]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      </RigidBody>

      {/* Top platform safety rails (except for entrance and exit) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, towerHeight + 1, -towerWidth / 2 + 0.2]}>
        <mesh castShadow><boxGeometry args={[towerWidth, 1.5, 0.4]} /><meshStandardMaterial color="#e74c3c" /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, towerHeight + 1, towerWidth / 2 - 0.2]}>
        <mesh castShadow><boxGeometry args={[towerWidth, 1.5, 0.4]} /><meshStandardMaterial color="#e74c3c" /></mesh>
      </RigidBody>

      {/* Main Support Pillars */}
      {[-(towerWidth / 2 - 0.5), (towerWidth / 2 - 0.5)].map((x, i) =>
        [-(towerWidth / 2 - 0.5), (towerWidth / 2 - 0.5)].map((z, j) => (
          <RigidBody key={`pillar-${i}-${j}`} type="fixed" colliders="cuboid" position={[x, towerHeight / 2, z]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.4, towerHeight, 8]} />
              <meshStandardMaterial color="#2c3e50" />
            </mesh>
          </RigidBody>
        ))
      )}

      {/* 2. THE ASCENDING WOODEN CLIMB BRIDGE */}
      {/* Base invisible smooth entrance curb at the FAR RIGHT END of the ramp. We use negative rotation so the outermost edge is flush with the ground */}
      <RigidBody type="fixed" colliders="cuboid" position={[rampLength + towerWidth / 2 + 1, 0.1, 0]} rotation={[0, 0, -0.15]}>
        <mesh><boxGeometry args={[4, 0.2, towerWidth]} /><meshBasicMaterial visible={false} /></mesh>
      </RigidBody>

      {/* Upward Ramp. We use -climbAngle so the right side (+X) goes DOWN to the ground and left side (-X) goes UP to the tower! */}
      <RigidBody type="fixed" colliders="cuboid" position={[rampLength / 2 + towerWidth / 2, towerHeight / 2, 0]} rotation={[0, 0, -climbAngle]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[climbHypot, 0.5, towerWidth]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      </RigidBody>

      {/* Upward Ramp Side Rails */}
      <RigidBody type="fixed" colliders="cuboid" position={[rampLength / 2 + towerWidth / 2, towerHeight / 2 + 1, -towerWidth / 2 + 0.2]} rotation={[0, 0, -climbAngle]}>
        <mesh castShadow><boxGeometry args={[climbHypot, 1.5, 0.4]} /><meshStandardMaterial color="#ecf0f1" /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[rampLength / 2 + towerWidth / 2, towerHeight / 2 + 1, towerWidth / 2 - 0.2]} rotation={[0, 0, -climbAngle]}>
        <mesh castShadow><boxGeometry args={[climbHypot, 1.5, 0.4]} /><meshStandardMaterial color="#ecf0f1" /></mesh>
      </RigidBody>


      {/* 3. THE TWO WATER SLIDES SHOOTING OUT TOWARDS -X */}
      {/* Slide 1 (Left - Blue/Cyan) */}
      <group position={[-slideLength / 2 - towerWidth / 2, slideHeightCenter, -2]}>
        {/* Slide Floor */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]} rotation={[0, 0, slideAngle]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[slideHypot, 0.4, 3]} />
            <meshPhysicalMaterial color={slideColor1} roughness={0.1} clearcoat={1} />
          </mesh>
        </RigidBody>
        {/* Slide Left High Wall */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 1.5, -1.3]} rotation={[0, 0, slideAngle]}>
          <mesh castShadow><boxGeometry args={[slideHypot, 3, 0.4]} /><meshStandardMaterial color={slideColor1} /></mesh>
        </RigidBody>
        {/* Slide Right High Wall */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 1.5, 1.3]} rotation={[0, 0, slideAngle]}>
          <mesh castShadow><boxGeometry args={[slideHypot, 3, 0.4]} /><meshStandardMaterial color={slideColor1} /></mesh>
        </RigidBody>
      </group>

      {/* Slide 2 (Right - Pink) */}
      <group position={[-slideLength / 2 - towerWidth / 2, slideHeightCenter, 2]}>
        {/* Slide Floor */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]} rotation={[0, 0, slideAngle]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[slideHypot, 0.4, 3]} />
            <meshPhysicalMaterial color={slideColor2} roughness={0.1} clearcoat={1} />
          </mesh>
        </RigidBody>
        {/* Slide Left High Wall */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 1.5, -1.3]} rotation={[0, 0, slideAngle]}>
          <mesh castShadow><boxGeometry args={[slideHypot, 3, 0.4]} /><meshStandardMaterial color={slideColor2} /></mesh>
        </RigidBody>
        {/* Slide Right High Wall */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 1.5, 1.3]} rotation={[0, 0, slideAngle]}>
          <mesh castShadow><boxGeometry args={[slideHypot, 3, 0.4]} /><meshStandardMaterial color={slideColor2} /></mesh>
        </RigidBody>
      </group>

      {/* Invisible curbs at the bottom of the slides so the car exits smoothly into the pool */}
      <RigidBody type="fixed" colliders="cuboid" position={[-slideLength - towerWidth / 2 - 1, 0.1, -2]} rotation={[0, 0, 0.15]}>
        <mesh><boxGeometry args={[3, 0.4, 3]} /><meshBasicMaterial visible={false} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-slideLength - towerWidth / 2 - 1, 0.1, 2]} rotation={[0, 0, 0.15]}>
        <mesh><boxGeometry args={[3, 0.4, 3]} /><meshBasicMaterial visible={false} /></mesh>
      </RigidBody>
    </group>
  );
}

// -------------------------------------------------------------
// The Main Water Park Composite
// -------------------------------------------------------------
export default function WaterPark() {
  // Moved far back into the grassy field so its massive 70m pool doesn't overlap the camp or park
  const wpCenter: [number, number, number] = [-120, 0, -10];
  const poolRadius = 35;

  const rimShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, poolRadius + 2, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, poolRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return shape;
  }, [poolRadius]);

  // Pre-calculate 32 highly performant glowing decorative lights for the pool border
  const borderLightPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 32;
    for (let i = 0; i < count; i++) {
       const a = (i / count) * Math.PI * 2;
       const x = Math.cos(a) * 36; // middle of the rim (radius 35 to 37)
       const z = Math.sin(a) * 36;
       // Ramps are at specific Z coordinates. Let's just place them slightly above the rim (y=0.45)
       // Or even better, embed them slightly!
       positions.push([x, 0.45, z]);
    }
    return positions;
  }, []);

  return (
    <group position={wpCenter}>
      
      {/* 1. The Main Shallow Pool */}
      {/* Trimesh collision allows the car completely inside the hollow pool! */}
      <RigidBody type="fixed" colliders="trimesh" position={[0, 0.1, 0]}>
        {/* Outer concrete rim (Tall and hard) */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <extrudeGeometry args={[rimShape, { depth: 0.4, bevelEnabled: false }]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
        {/* Inner sandy pool floor (Thin sheet at the bottom!) */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[poolRadius, poolRadius, 0.05, 32]} />
          <meshStandardMaterial color="#f8efba" />
        </mesh>
      </RigidBody>

      {/* Ramps to enter and exit the pool rim smoothly from the grassy field AND from inside the pool */}
      {/* South Entrance Location */}
      {/* Outer slope (grass -> rim) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.2, 39.41]} rotation={[0.15, 0, 0]}>
        <mesh receiveShadow castShadow><boxGeometry args={[15, 0.4, 5.33]} /><meshStandardMaterial color="#95a5a6" /></mesh>
      </RigidBody>
      {/* Inner slope (rim -> sandy pool floor) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.225, 34.42]} rotation={[-0.15, 0, 0]}>
        <mesh receiveShadow castShadow><boxGeometry args={[15, 0.4, 4.66]} /><meshStandardMaterial color="#7f8c8d" /></mesh>
      </RigidBody>
      {/* Entrance Sign Label */}
      <Text position={[0, 5, 36.75]} rotation={[0, Math.PI, 0]} fontSize={2} color="#f1c40f" outlineWidth={0.1} outlineColor="#000" castShadow anchorX="center" anchorY="middle">
        ENTRANCE
      </Text>

      {/* North Exit Location */}
      {/* Outer slope (grass -> rim) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.2, -39.41]} rotation={[-0.15, 0, 0]}>
        <mesh receiveShadow castShadow><boxGeometry args={[15, 0.4, 5.33]} /><meshStandardMaterial color="#95a5a6" /></mesh>
      </RigidBody>
      {/* Inner slope (rim -> sandy pool floor) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.225, -34.42]} rotation={[0.15, 0, 0]}>
        <mesh receiveShadow castShadow><boxGeometry args={[15, 0.4, 4.66]} /><meshStandardMaterial color="#7f8c8d" /></mesh>
      </RigidBody>
      {/* Exit Sign Label */}
      <Text position={[0, 5, -36.75]} rotation={[0, 0, 0]} fontSize={2} color="#e74c3c" outlineWidth={0.1} outlineColor="#000" castShadow anchorX="center" anchorY="middle">
        EXIT
      </Text>

      {/* Transmissive Fake Water Layer (purely visual, sits slightly above the basin) */}
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[poolRadius, poolRadius, 0.1, 32]} />
        <meshPhysicalMaterial 
          color="#74b9ff" 
          transmission={0.8} 
          roughness={0.1} 
          thickness={0.5} 
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 2. The Slide Tower and ascending bridge situated in the pool */}
      {/* We rotate it so the slides squirt out sideways instead of directly towards the park/camper boundaries */}
      <group rotation={[0, Math.PI / 4, 0]}>
        <SlideTower position={[0, 0, 0]} />
      </group>

      {/* 3. Water Park Props & Decor */}
      <InflatableRing position={[15, 0.6, 12]} color="#ff7675" />
      <InflatableRing position={[-18, 0.6, 20]} color="#a29bfe" />
      <InflatableRing position={[5, 0.6, -22]} color="#55efc4" />
      <InflatableRing position={[-25, 0.6, -15]} color="#ffeaa7" />
      
      <BeachBall position={[8, 1, 15]} />
      <BeachBall position={[-12, 1, -18]} />
      <BeachBall position={[-22, 1, 8]} />
      
      {/* 4. Decorative Border Lights for Nighttime */}
      {/* We use Instances to render all 32 border glowing orbs as a single GPU draw call! */}
      <Instances limit={borderLightPositions.length}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial 
          color="#00e5ff" 
          emissive="#00e5ff" 
          emissiveIntensity={4} 
          toneMapped={false} 
        />
        {borderLightPositions.map((pos, i) => (
          <Instance key={`bl-${i}`} position={pos} />
        ))}
      </Instances>
      
    </group>
  );
}
