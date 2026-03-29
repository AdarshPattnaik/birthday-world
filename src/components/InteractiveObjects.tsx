'use client';

import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function PushableCrate({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody
      type="dynamic"
      mass={0.8}
      position={position}
      restitution={0.6}
      friction={0.5}
    >
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      {/* Crate cross decoration */}
      <mesh position={[0, 0, 0.51]}>
        <boxGeometry args={[0.8, 0.1, 0.01]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0, 0.51]}>
        <boxGeometry args={[0.1, 0.8, 0.01]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </RigidBody>
  );
}

function BouncyBall({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody
      type="dynamic"
      mass={1.5}
      position={position}
      restitution={1.8}
      friction={0.2}
    >
      <mesh castShadow>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

function Ramp({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 0.3, 6]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      {/* Arrow decoration */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.3, 0.02, 2]} />
        <meshStandardMaterial color="#f1c40f" />
      </mesh>
    </RigidBody>
  );
}

function GiftBox({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="dynamic" mass={1.5} position={position} restitution={1.0}>
      <group>
        {/* Box */}
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#e91e63" />
        </mesh>
        {/* Ribbon horizontal */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.45, 0.25, 1.45]} />
          <meshStandardMaterial color="#f1c40f" />
        </mesh>
        {/* Ribbon vertical */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.25, 1.45, 1.45]} />
          <meshStandardMaterial color="#f1c40f" />
        </mesh>
        {/* Bow */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#f1c40f" />
        </mesh>
      </group>
    </RigidBody>
  );
}

function PartyHat({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" mass={0.5} position={position} restitution={0.8} friction={0.4}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <coneGeometry args={[0.6, 1.5, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Pom-pom at the top */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </RigidBody>
  );
}

function CardboardText({ text, position, color }: { text: string; position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" mass={1.0} position={position} restitution={0.5} friction={0.8}>
      <group>
        {/* We use a thin box as the physical bounds for the text */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 2, 0.2]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.8} />
        </mesh>
        
        {/* The colorful 3D-ish Text */}
        <Text
          position={[0, 0, 0.11]} // slightly in front of the cardboard backing
          color={color}
          fontSize={1.6}
          maxWidth={8}
          lineHeight={1}
          letterSpacing={0.02}
          textAlign="center"
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.08}
          outlineColor="#ffffff"
        >
          {text}
        </Text>
      </group>
    </RigidBody>
  );
}

export default function InteractiveObjects() {
  return (
    <group>
      {/* Pushable crates */}
      <PushableCrate position={[5, 1, -15]} />
      <PushableCrate position={[6, 1, -14]} />
      <PushableCrate position={[5.5, 2, -14.5]} />
      <PushableCrate position={[-4, 1, 20]} />
      <PushableCrate position={[45, 1, 25]} />
      <PushableCrate position={[60, 1, -5]} />

      {/* Bouncy balls - scaled up and more bouncy! */}
      <BouncyBall position={[10, 2, 5]} color="#e74c3c" />
      <BouncyBall position={[30, 2, 35]} color="#3498db" />
      <BouncyBall position={[55, 2, -30]} color="#2ecc71" />
      <BouncyBall position={[15, 2, -30]} color="#9b59b6" />
      <BouncyBall position={[-15, 2, -10]} color="#f1c40f" />
      <BouncyBall position={[25, 2, -20]} color="#e67e22" />

      {/* Ramps */}
      <Ramp position={[0, 0.3, -30]} rotation={[-0.15, 0, 0]} />
      <Ramp position={[40, 0.3, 30]} rotation={[-0.15, Math.PI / 2, 0]} />
      <Ramp position={[68, 0.3, -8]} rotation={[-0.2, 0, 0]} />

      {/* Giant Gift boxes */}
      <GiftBox position={[3, 1, -5]} />
      <GiftBox position={[25, 1, 33]} />
      <GiftBox position={[55, 1, -35]} />
      <GiftBox position={[65, 1, 10]} />
      <GiftBox position={[-3, 1, 15]} />
      <GiftBox position={[-20, 1, 20]} />
      <GiftBox position={[14, 1, 18]} />

      {/* Party Hats */}
      <PartyHat position={[8, 1, 12]} color="#9b59b6" />
      <PartyHat position={[35, 1, 25]} color="#f39c12" />
      <PartyHat position={[-10, 1, -20]} color="#1abc9c" />
      <PartyHat position={[50, 1, -15]} color="#e74c3c" />
      <PartyHat position={[20, 1, 0]} color="#3498db" />

      {/* Happy Birthday Physical Signs */}
      <CardboardText text="Happy" position={[-10, 1, 0]} color="#e91e63" />
      <CardboardText text="Birthday!" position={[-10, 1, -4]} color="#3498db" />
      <CardboardText text="Happy Birthday" position={[35, 1, -10]} color="#f1c40f" />
      <CardboardText text="Wheeee!" position={[45, 1, 15]} color="#9b59b6" />
    </group>
  );
}
