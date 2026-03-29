'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

function ConfettiParticle({
  startPosition,
  velocity,
  color,
  delay,
}: {
  startPosition: [number, number, number];
  velocity: [number, number, number];
  color: string;
  delay: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(-delay);

  useFrame((_, delta) => {
    if (!ref.current) return;
    timeRef.current += delta;
    const t = timeRef.current;

    if (t < 0) {
      ref.current.visible = false;
      return;
    }

    ref.current.visible = true;
    ref.current.position.x = startPosition[0] + velocity[0] * t;
    ref.current.position.y = startPosition[1] + velocity[1] * t - 4.9 * t * t;
    ref.current.position.z = startPosition[2] + velocity[2] * t;

    ref.current.rotation.x += delta * 5;
    ref.current.rotation.y += delta * 3;

    // Fade out
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    if (t > 1.5) {
      mat.opacity = Math.max(0, 1 - (t - 1.5) / 0.8);
    }
  });

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[0.15, 0.15, 0.15]} />
      <meshStandardMaterial color={color} transparent opacity={1} />
    </mesh>
  );
}

export default function Confetti() {
  const confettiPosition = useGameStore((s) => s.confettiPosition);
  const [activeExplosions, setActiveExplosions] = useState<
    Array<{ id: string; position: [number, number, number] }>
  >([]);

  useEffect(() => {
    if (confettiPosition) {
      const id = `confetti-${Date.now()}`;
      setActiveExplosions((prev) => [...prev, { id, position: confettiPosition }]);

      setTimeout(() => {
        setActiveExplosions((prev) => prev.filter((e) => e.id !== id));
      }, 3000);
    }
  }, [confettiPosition]);

  const colors = useMemo(
    () => ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#e91e63', '#ff9800', '#00bcd4'],
    []
  );

  return (
    <>
      {activeExplosions.map((explosion) => {
        const particles = Array.from({ length: 40 }, (_, i) => {
          const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.5;
          const speed = 3 + Math.random() * 5;
          const elevAngle = 0.5 + Math.random() * 1.2;
          return {
            key: `${explosion.id}-${i}`,
            velocity: [
              Math.cos(angle) * speed * Math.cos(elevAngle),
              Math.sin(elevAngle) * speed * 1.5,
              Math.sin(angle) * speed * Math.cos(elevAngle),
            ] as [number, number, number],
            color: colors[i % colors.length],
            delay: Math.random() * 0.15,
          };
        });

        return particles.map((p) => (
          <ConfettiParticle
            key={p.key}
            startPosition={explosion.position}
            velocity={p.velocity}
            color={p.color}
            delay={p.delay}
          />
        ));
      })}
    </>
  );
}
