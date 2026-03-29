'use client';

import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// An oversized, hollow train that the car can drive right through
function StaticTrain({ position, length = 40 }: { position: [number, number, number], length?: number }) {
  const trainWidth = 6;
  const trainHeight = 4.5;
  const wallThickness = 0.5;

  return (
    <group position={position}>
      {/* 
        We use individual RigidBody 'fixed' colliders for each wall, floor, and ceiling
        so that the inside remains completely hollow and drivable.
      */}
      <RigidBody type="fixed" colliders="cuboid" name="train-floor">
        <mesh position={[0, -trainHeight / 2 + wallThickness / 2, 0]} receiveShadow>
          <boxGeometry args={[length, wallThickness, trainWidth]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" name="train-ceiling">
        <mesh position={[0, trainHeight / 2 - wallThickness / 2, 0]} castShadow>
          <boxGeometry args={[length, wallThickness, trainWidth]} />
          {/* Glass canopy roof so we can see the car driving inside! */}
          <meshPhysicalMaterial 
            color="#e0f7fa" 
            metalness={0.2} 
            roughness={0.05} 
            transmission={0.9} 
            thickness={wallThickness} 
            transparent 
          />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" name="train-left-wall">
        <mesh position={[0, 0, -trainWidth / 2 + wallThickness / 2]} castShadow>
          <boxGeometry args={[length, trainHeight, wallThickness]} />
          <meshStandardMaterial color="#3498db" /> {/* Cute Blue */}
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" name="train-right-wall">
        <mesh position={[0, 0, trainWidth / 2 - wallThickness / 2]} castShadow>
          <boxGeometry args={[length, trainHeight, wallThickness]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </RigidBody>

      {/* Decorative Train Elements (Non-colliding) */}
      
      {/* Engine Front Cab */}
      <mesh position={[-length / 2 + 3, trainHeight / 2 + 1, 0]} castShadow>
        <boxGeometry args={[6, 2, trainWidth - 0.2]} />
        <meshStandardMaterial color="#e74c3c" /> {/* Red Cab */}
      </mesh>

      {/* Chimney */}
      <mesh position={[-length / 2 + 2, trainHeight / 2 + 3, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.8, 2, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Smoke particle representation (static low poly cloud) */}
      <mesh position={[-length / 2 + 2, trainHeight / 2 + 4.5, 0]} castShadow>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#ecf0f1" transparent opacity={0.6} />
      </mesh>

      {/* Wheels */}
      {[-16, -10, -4, 2, 8, 14].map((x, i) => (
        <group key={`wheels-${i}`} position={[x, -trainHeight / 2, 0]}>
          {/* Near wheel */}
          <mesh position={[0, 0, trainWidth / 2 + 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.4, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Far wheel */}
          <mesh position={[0, 0, -trainWidth / 2 - 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.4, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      ))}

      {/* Windows along the side walls */}
      {[-10, -5, 0, 5, 10, 15].map((x, i) => (
        <group key={`win-${i}`} position={[x, 0.5, 0]}>
          <mesh position={[0, 0, trainWidth / 2]} rotation={[0, 0, 0]}>
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={1} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, -trainWidth / 2]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={1} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[-length / 2 - 0.1, 0, 1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-length / 2 - 0.1, 0, -1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[-length / 2 - 1, 0, 0]} intensity={5} distance={30} color="#ffeb3b" />

      {/* Invisible entry/exit ramps to help the car step up onto the train floor smoothly */}
      <RigidBody type="fixed" colliders="cuboid" name="train-entry-ramp" position={[-length / 2 - 4, -2.4, 0]} rotation={[0, 0, 0.15]}>
        <mesh>
          <boxGeometry args={[8, 0.1, trainWidth]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" name="train-exit-ramp" position={[length / 2 + 4, -2.4, 0]} rotation={[0, 0, -0.15]}>
        <mesh>
          <boxGeometry args={[8, 0.1, trainWidth]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>
    </group>
  );
}

// A large physics-enabled bridge that goes OVER the train tracks
function ClimbableBridge({ position }: { position: [number, number, number] }) {
  const rampLength = 25;
  const bridgeWidth = 8;
  const bridgeHeight = 5.5;
  const spanLength = 16;
  
  const rampAngle = Math.atan2(bridgeHeight, rampLength);
  const rampHypot = Math.sqrt(bridgeHeight ** 2 + rampLength ** 2);

  const bridgeColor = "#ecf0f1"; // White wood
  const railColor = "#f8a5c2"; // Cute soft pink
  const trimColor = "#f1c40f"; // Gold trim

  return (
    <group position={position}>
      {/* Invisible Helper Ramps to smooth the entry/exit over the sharp corner */}
      <RigidBody type="fixed" colliders="cuboid" position={[-(spanLength / 2 + rampLength) - 1, 0.1, 0]} rotation={[0, 0, 0.15]}>
        <mesh><boxGeometry args={[3, 0.2, bridgeWidth]} /><meshBasicMaterial visible={false} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[spanLength / 2 + rampLength + 1, 0.1, 0]} rotation={[0, 0, -0.15]}>
        <mesh><boxGeometry args={[3, 0.2, bridgeWidth]} /><meshBasicMaterial visible={false} /></mesh>
      </RigidBody>

      {/* Up Ramp Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[-(spanLength / 2 + rampLength / 2), bridgeHeight / 2, 0]} rotation={[0, 0, rampAngle]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[rampHypot, 0.5, bridgeWidth]} />
          <meshStandardMaterial color={bridgeColor} />
        </mesh>
      </RigidBody>

      {/* Up Ramp Rails */}
      <RigidBody type="fixed" colliders="cuboid" position={[-(spanLength / 2 + rampLength / 2), bridgeHeight / 2 + 0.8, -bridgeWidth / 2 + 0.2]} rotation={[0, 0, rampAngle]}>
        <mesh castShadow><boxGeometry args={[rampHypot, 1.2, 0.4]} /><meshStandardMaterial color={railColor} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-(spanLength / 2 + rampLength / 2), bridgeHeight / 2 + 0.8, bridgeWidth / 2 - 0.2]} rotation={[0, 0, rampAngle]}>
        <mesh castShadow><boxGeometry args={[rampHypot, 1.2, 0.4]} /><meshStandardMaterial color={railColor} /></mesh>
      </RigidBody>

      {/* Middle Flat Overpass Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, bridgeHeight, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[spanLength, 0.5, bridgeWidth]} />
          <meshStandardMaterial color={bridgeColor} />
        </mesh>
      </RigidBody>

      {/* Middle Flat Overpass Rails & Details */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, bridgeHeight + 0.8, -bridgeWidth / 2 + 0.2]}>
        <mesh castShadow><boxGeometry args={[spanLength, 1.2, 0.4]} /><meshStandardMaterial color={railColor} /></mesh>
        <mesh position={[0, 0.6, 0.25]}><boxGeometry args={[spanLength, 0.1, 0.1]} /><meshStandardMaterial color={trimColor} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, bridgeHeight + 0.8, bridgeWidth / 2 - 0.2]}>
        <mesh castShadow><boxGeometry args={[spanLength, 1.2, 0.4]} /><meshStandardMaterial color={railColor} /></mesh>
        <mesh position={[0, 0.6, -0.25]}><boxGeometry args={[spanLength, 0.1, 0.1]} /><meshStandardMaterial color={trimColor} /></mesh>
      </RigidBody>

      {/* Down Ramp Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[spanLength / 2 + rampLength / 2, bridgeHeight / 2, 0]} rotation={[0, 0, -rampAngle]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[rampHypot, 0.5, bridgeWidth]} />
          <meshStandardMaterial color={bridgeColor} />
        </mesh>
      </RigidBody>

      {/* Down Ramp Rails */}
      <RigidBody type="fixed" colliders="cuboid" position={[spanLength / 2 + rampLength / 2, bridgeHeight / 2 + 0.8, -bridgeWidth / 2 + 0.2]} rotation={[0, 0, -rampAngle]}>
        <mesh castShadow><boxGeometry args={[rampHypot, 1.2, 0.4]} /><meshStandardMaterial color={railColor} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[spanLength / 2 + rampLength / 2, bridgeHeight / 2 + 0.8, bridgeWidth / 2 - 0.2]} rotation={[0, 0, -rampAngle]}>
        <mesh castShadow><boxGeometry args={[rampHypot, 1.2, 0.4]} /><meshStandardMaterial color={railColor} /></mesh>
      </RigidBody>

      {/* Glowing Star Decorations on the Overpass */}
      {[-spanLength/2, 0, spanLength/2].map((x, i) => (
        <group key={`star-${i}`}>
          <mesh position={[x, bridgeHeight + 2, -bridgeWidth / 2 - 0.2]} rotation={[Math.PI/2, 0, 0]}>
            <octahedronGeometry args={[0.5]} />
            <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={1} />
          </mesh>
          <mesh position={[x, bridgeHeight + 2, bridgeWidth / 2 + 0.2]} rotation={[Math.PI/2, 0, 0]}>
            <octahedronGeometry args={[0.5]} />
            <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// A cute ticket station platform
function StationPlatform({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Raised Platform Base */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[30, 1, 12]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
      </RigidBody>

      {/* Platform Striped Edge line */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.01, 5.5]} receiveShadow>
          <boxGeometry args={[30, 0.05, 1]} />
          <meshStandardMaterial color="#f1c40f" />
        </mesh>
      </RigidBody>

      {/* Main Station Building */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 3, -2]} castShadow>
          <boxGeometry args={[14, 4, 6]} />
          <meshStandardMaterial color="#f8a5c2" /> {/* Cute Soft Pink */}
        </mesh>
      </RigidBody>

      {/* Building Roof */}
      <RigidBody type="fixed" colliders="hull">
        <mesh position={[0, 5.5, -2]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[3.5, 3.5, 15, 8, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#e66767" />
        </mesh>
      </RigidBody>

      {/* Station Clock */}
      <RigidBody type="fixed" colliders="cuboid">
        <group position={[0, 6.5, 0.6]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.4, 16]} />
            <meshStandardMaterial color="#f3a683" />
          </mesh>
          <mesh position={[0, 0, 0.21]}>
            <circleGeometry args={[1.3, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Clock hands */}
          <mesh position={[0, 0.4, 0.22]}>
            <boxGeometry args={[0.1, 0.8, 0.02]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[0.3, 0, 0.22]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.08, 0.6, 0.02]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      </RigidBody>

      {/* Text Sign */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 4, 1.1]} castShadow>
          <boxGeometry args={[8, 1.2, 0.2]} />
          <meshStandardMaterial color="#596275" />
        </mesh>
        <Text position={[0, 4, 1.25]} fontSize={0.6} color="#ffffff" anchorX="center" anchorY="middle">
          CENTRAL STATION
        </Text>
      </RigidBody>
    </group>
  );
}

// Helper components for Train Station decorations
function FlowerBush({ position }: { position: [number, number, number] }) {
  // We use deterministic positions for the flowers so it doesn't flicker between renders
  const flowers = [
    { p: [0.8, 0.4, 0.3], c: '#ff9ff3' },
    { p: [-0.6, 0.8, -0.4], c: '#feca57' },
    { p: [0.2, 0.9, 0.7], c: '#48dbfb' },
    { p: [-0.7, 0.2, 0.8], c: '#ff6b6b' },
    { p: [0.4, 0.1, -0.9], c: '#ff9ff3' },
  ];

  return (
    <RigidBody type="fixed" colliders="ball" position={position}>
      <mesh castShadow>
        <dodecahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#27ae60" roughness={0.8} />
      </mesh>
      {/* Tiny Flowers */}
      {flowers.map((f, i) => (
        <mesh key={i} position={f.p as [number, number, number]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color={f.c} />
        </mesh>
      ))}
    </RigidBody>
  );
}

function Lamppost({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 5, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} />
      </mesh>
      {/* Light Bulb */}
      <mesh position={[0, 5.2, 0]} castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 5.7, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.6, 0.5, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Actual Light */}
      <pointLight position={[0, 5.2, 0]} intensity={3} distance={25} color="#fffcf2" />
    </RigidBody>
  );
}

function MarketStall({ position, rotation = [0, 0, 0], color }: { position: [number, number, number], rotation?: [number, number, number], color: string }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      {/* Counter Base */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 2.5]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
      {/* Pillars */}
      <mesh position={[-1.8, 2.5, -1]}><boxGeometry args={[0.2, 3, 0.2]} /><meshStandardMaterial color="#7f8c8d" /></mesh>
      <mesh position={[1.8, 2.5, -1]}><boxGeometry args={[0.2, 3, 0.2]} /><meshStandardMaterial color="#7f8c8d" /></mesh>
      <mesh position={[-1.8, 2, 1]}><boxGeometry args={[0.2, 2, 0.2]} /><meshStandardMaterial color="#7f8c8d" /></mesh>
      <mesh position={[1.8, 2, 1]}><boxGeometry args={[0.2, 2, 0.2]} /><meshStandardMaterial color="#7f8c8d" /></mesh>
      
      {/* Awning Roof */}
      <mesh position={[0, 3.5, 0]} rotation={[-Math.PI / 8, 0, 0]} castShadow>
        <boxGeometry args={[4.4, 0.2, 3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cute Prop (Gift Box) */}
      <group position={[0, 2.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.9, 0.1, 0.2]} /><meshStandardMaterial color="#f1c40f" /></mesh>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.2, 0.1, 0.9]} /><meshStandardMaterial color="#f1c40f" /></mesh>
      </group>
    </RigidBody>
  );
}

function StationBench({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      {/* Legs */}
      <mesh position={[-1.2, 0.4, 0]}><boxGeometry args={[0.2, 0.8, 0.2]} /><meshStandardMaterial color="#34495e" /></mesh>
      <mesh position={[1.2, 0.4, 0]}><boxGeometry args={[0.2, 0.8, 0.2]} /><meshStandardMaterial color="#34495e" /></mesh>
      {/* Seat */}
      <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[3, 0.1, 1]} /><meshStandardMaterial color="#d35400" /></mesh>
      {/* Backrest */}
      <mesh position={[0, 1.2, -0.45]} rotation={[0.1, 0, 0]} castShadow><boxGeometry args={[3, 0.8, 0.1]} /><meshStandardMaterial color="#d35400" /></mesh>
    </RigidBody>
  );
}

// -------------------------------------------------------------
// The main composite component for the entire Train Station area
// -------------------------------------------------------------
export default function TrainStation() {
  // We place the station far to the North-East
  const stationCenter: [number, number, number] = [80, 0, -70];

  return (
    <group>
      {/* Dirt clearance area around the station */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[stationCenter[0], 0.01, stationCenter[2]]} receiveShadow>
        <planeGeometry args={[90, 60]} />
        <meshStandardMaterial color="#a1887f" roughness={1.0} />
      </mesh>

      {/* Dirt road leading to the station from the main road grid */}
      <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 4]} position={[stationCenter[0] - 25, 0.01, stationCenter[2] + 25]} receiveShadow>
        <planeGeometry args={[8, 60]} />
        <meshStandardMaterial color="#8d6e63" roughness={1.0} />
      </mesh>

      {/* 
        Train Tracks (Non-colliding visual)
        They span across the station horizontally (along local X)
      */}
      {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((x, i) => (
        <mesh key={`tie-${i}`} position={[stationCenter[0] + x, 0.1, stationCenter[2] - 5]} receiveShadow>
          <boxGeometry args={[1, 0.1, 8]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      ))}
      <mesh position={[stationCenter[0], 0.15, stationCenter[2] - 3]} receiveShadow>
        <boxGeometry args={[90, 0.1, 0.4]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[stationCenter[0], 0.15, stationCenter[2] - 7]} receiveShadow>
        <boxGeometry args={[90, 0.1, 0.4]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* The Hollow Static Train standing on the tracks */}
      {/* We raise it by trainHeight/2 (2.25) + bottom clearance so its floor aligns slightly above the track */}
      <StaticTrain position={[stationCenter[0] + 5, 2.5, stationCenter[2] - 5]} length={40} />

      {/* Paved Plaza Square */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[stationCenter[0] - 20, 0.05, stationCenter[2] + 25]} receiveShadow>
        <planeGeometry args={[35, 30]} />
        <meshStandardMaterial color="#bdc3c7" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[stationCenter[0] - 20, 0.06, stationCenter[2] + 25]} receiveShadow>
        <planeGeometry args={[33, 28]} />
        {/* Wireframe generates a grid/tiled look for free */}
        <meshStandardMaterial color="#7f8c8d" wireframe />
      </mesh>

      {/* Market Stalls (Left side) */}
      <MarketStall position={[stationCenter[0] - 35, 0, stationCenter[2] + 15]} rotation={[0, Math.PI / 2, 0]} color="#e74c3c" />
      <MarketStall position={[stationCenter[0] - 35, 0, stationCenter[2] + 25]} rotation={[0, Math.PI / 2, 0]} color="#3498db" />
      <MarketStall position={[stationCenter[0] - 35, 0, stationCenter[2] + 35]} rotation={[0, Math.PI / 2, 0]} color="#9b59b6" />

      {/* Market Stalls (Right side) */}
      <MarketStall position={[stationCenter[0] - 8, 0, stationCenter[2] + 35]} rotation={[0, -Math.PI / 2, 0]} color="#f1c40f" />
      <MarketStall position={[stationCenter[0] - 8, 0, stationCenter[2] + 25]} rotation={[0, -Math.PI / 2, 0]} color="#1abc9c" />

      {/* Benches for waiting passengers */}
      <StationBench position={[stationCenter[0] - 20, 0, stationCenter[2] + 15]} rotation={[0, Math.PI, 0]} />
      <StationBench position={[stationCenter[0] - 15, 0, stationCenter[2] + 15]} rotation={[0, Math.PI, 0]} />
      <StationBench position={[stationCenter[0] - 17.5, 0, stationCenter[2] + 12]} rotation={[0, 0, 0]} />

      {/* Flower Bushes decorating the plaza */}
      <FlowerBush position={[stationCenter[0] - 20, 0, stationCenter[2] + 25]} />
      <FlowerBush position={[stationCenter[0] - 35, 0, stationCenter[2] + 10]} />
      <FlowerBush position={[stationCenter[0] - 8, 0, stationCenter[2] + 10]} />
      <FlowerBush position={[stationCenter[0] - 8, 0, stationCenter[2] + 40]} />
      <FlowerBush position={[stationCenter[0] - 35, 0, stationCenter[2] + 40]} />

      {/* Lampposts */}
      <Lamppost position={[stationCenter[0] - 38, 0, stationCenter[2] + 20]} />
      <Lamppost position={[stationCenter[0] - 38, 0, stationCenter[2] + 30]} />
      <Lamppost position={[stationCenter[0] - 5, 0, stationCenter[2] + 20]} />
      <Lamppost position={[stationCenter[0] - 5, 0, stationCenter[2] + 30]} />
      
      {/* The cute platform next to the tracks */}
      <StationPlatform position={[stationCenter[0] - 10, 0, stationCenter[2] + 4]} />

      {/* 
        The Bridge crossing OVER the tracks! 
        We rotate the ClimbableBridge 90 degrees (Math.PI/2) so it spans the Z axis
        and crosses beautifully over the train instead of running parallel to it!
      */}
      <group position={[stationCenter[0] + 20, 0, stationCenter[2] - 5]} rotation={[0, -Math.PI / 2, 0]}>
        <ClimbableBridge position={[0, 0, 0]} />
      </group>
    </group>
  );
}
