'use client';

import { useGameStore } from '@/store/gameStore';
import { useState, useMemo } from 'react';

// Simple seeded pseudo-random number generator for deterministic values
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function StartScreen() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const setGameStarted = useGameStore((s) => s.setGameStarted);
  const [fadeOut, setFadeOut] = useState(false);
  const [show, setShow] = useState(true);

  const particles = useMemo(() => {
    const rng = seededRandom(42);
    return Array.from({ length: 30 }, (_, i) => ({
      width: 4 + rng() * 8,
      height: 4 + rng() * 8,
      left: rng() * 100,
      top: rng() * 100,
      duration: 3 + rng() * 4,
      delay: rng() * 3,
      color: ['#f39c12', '#e74c3c', '#9b59b6', '#2ecc71', '#3498db', '#e91e63'][i % 6],
    }));
  }, []);

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(() => {
      setGameStarted(true);
      setShow(false);
    }, 800);
  };

  if (!show || gameStarted) return null;

  return (
    <div
      id="start-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${p.width}px`,
              height: `${p.height}px`,
              borderRadius: '50%',
              background: p.color,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `float-particle ${p.duration}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Emoji decorations */}
      <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎂🎉🎈</div>

      {/* Title */}
      <h1
        style={{
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #f39c12, #e74c3c, #9b59b6, #3498db)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          margin: '0 0 8px 0',
          lineHeight: 1.2,
          textShadow: 'none',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Happy Birthday
        <br />
        Tannuuu! 💖
      </h1>

      {/* Subtitle */}
      <p
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
          marginBottom: '40px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        A special driving adventure just for you ✨
      </p>

      {/* Start button */}
      <button
        id="start-button"
        onClick={handleStart}
        style={{
          padding: '18px 48px',
          fontSize: 'clamp(1rem, 3vw, 1.4rem)',
          fontWeight: 700,
          color: 'white',
          background: 'linear-gradient(135deg, #e74c3c, #9b59b6)',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(231, 76, 60, 0.4)',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 1,
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(231, 76, 60, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(231, 76, 60, 0.4)';
        }}
      >
        🚗 Start Driving
      </button>

      {/* Controls hint */}
      <div
        style={{
          marginTop: '32px',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.85rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <p style={{ margin: 0 }}>Desktop: WASD or Arrow Keys</p>
        <p style={{ margin: '4px 0 0' }}>Mobile: On-screen buttons</p>
      </div>
    </div>
  );
}
