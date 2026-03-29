'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';

function FloatingMessage({
  text,
  position,
  onExpire,
}: {
  text: string;
  position: [number, number, number];
  onExpire: () => void;
}) {
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.3);
  const [yOffset, setYOffset] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(onExpire, 5000);
    return () => clearTimeout(timer);
  }, [onExpire]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Fade in
    if (t < 0.5) {
      setOpacity(t / 0.5);
      setScale(0.3 + (t / 0.5) * 0.7);
    } else if (t > 4) {
      // Fade out
      setOpacity(Math.max(0, 1 - (t - 4)));
    } else {
      setOpacity(1);
      setScale(1);
    }

    // Float upward
    setYOffset(t * 0.5);
  });

  return (
    <Html
      position={[position[0], position[1] + yOffset, position[2]]}
      center
      distanceFactor={15}
      style={{
        opacity,
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-out',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.95), rgba(231, 76, 60, 0.95))',
          color: 'white',
          padding: '16px 28px',
          borderRadius: '16px',
          fontSize: '22px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(8px)',
          fontFamily: '"Segoe UI", system-ui, sans-serif',
        }}
      >
        {text}
      </div>
    </Html>
  );
}

export default function FloatingText() {
  const messages = useGameStore((s) => s.messages);
  const [visibleMessages, setVisibleMessages] = useState<typeof messages>([]);

  useEffect(() => {
    setVisibleMessages(messages);
  }, [messages]);

  const handleExpire = (id: string) => {
    setVisibleMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <>
      {visibleMessages.map((msg) => (
        <FloatingMessage
          key={msg.id}
          text={msg.text}
          position={msg.position}
          onExpire={() => handleExpire(msg.id)}
        />
      ))}
    </>
  );
}
