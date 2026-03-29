'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '@/store/gameStore';
import { useCallback, useRef } from 'react';

interface TriggerProps {
  id: string;
  position: [number, number, number];
  message: string;
  size?: [number, number, number];
}

function Trigger({ id, position, message, size = [4, 3, 4] }: TriggerProps) {
  const triggeredIds = useGameStore((s) => s.triggeredIds);
  const markTriggered = useGameStore((s) => s.markTriggered);
  const addMessage = useGameStore((s) => s.addMessage);
  const triggerConfetti = useGameStore((s) => s.triggerConfetti);

  const localTriggered = useRef(false);

  const handleCollision = useCallback(() => {
    // Determine if it was already triggered synchronously in the same frame
    if (localTriggered.current || triggeredIds.has(id)) return;
    localTriggered.current = true;
    
    markTriggered(id);
    addMessage(message, [position[0], position[1] + 4, position[2]]);
    triggerConfetti(position);
  }, [id, position, message, triggeredIds, markTriggered, addMessage, triggerConfetti]);

  return (
    <RigidBody
      type="fixed"
      position={position}
      sensor
      onIntersectionEnter={handleCollision}
    >
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} sensor />
      {/* Visible marker on the ground */}
      <mesh position={[0, -size[1] / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2, 8]} />
        <meshStandardMaterial
          color={triggeredIds.has(id) ? '#7f8c8d' : '#f39c12'}
          emissive={triggeredIds.has(id) ? '#555' : '#f39c12'}
          emissiveIntensity={triggeredIds.has(id) ? 0.1 : 0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Small floating star marker */}
      {!triggeredIds.has(id) && (
        <mesh position={[0, 2, 0]}>
          <octahedronGeometry args={[0.4]} />
          <meshStandardMaterial
            color="#f1c40f"
            emissive="#f1c40f"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </RigidBody>
  );
}

const birthdayMessages = [
  { id: 'bday-1', pos: [0, 0, -25] as [number, number, number], msg: 'Happy Birthday Tannuuu 🎉🎂' },
  { id: 'bday-2', pos: [20, 0, 30] as [number, number, number], msg: 'You are beautiful like a strawberry candy 🍓' },
  { id: 'bday-3', pos: [50, 0, 30] as [number, number, number], msg: 'You are as pretty as Dairy Milk 🍫' },
  { id: 'bday-4', pos: [68, 0, 0] as [number, number, number], msg: 'You make the world a sweeter place! 🌸✨' },
  { id: 'bday-5', pos: [40, 0, -40] as [number, number, number], msg: 'Keep shining bright, superstar! 🌟💖' },
  { id: 'bday-6', pos: [10, 0, -40] as [number, number, number], msg: 'Every day with you is a celebration! 🥳🎈' },
  { id: 'bday-7', pos: [-5, 0, 10] as [number, number, number], msg: 'Love you so much, Tannu! 💕🎀' },
  { id: 'bday-8', pos: [35, 0, -10] as [number, number, number], msg: 'You deserve all the cakes in the world! 🍰🎁' },
];

export default function BirthdayTriggers() {
  return (
    <group>
      {birthdayMessages.map((t) => (
        <Trigger key={t.id} id={t.id} position={t.pos} message={t.msg} />
      ))}
    </group>
  );
}
