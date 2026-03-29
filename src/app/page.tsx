'use client';

import dynamic from 'next/dynamic';
import { useRef, useEffect } from 'react';
import StartScreen from '@/components/UI/StartScreen';
import HUD from '@/components/UI/HUD';
import MessageOverlay from '@/components/UI/MessageOverlay';
import MobileControls from '@/components/MobileControls';
import { useGameStore } from '@/store/gameStore';
import { useControls } from '@/hooks/useControls';

const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: 'white',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        fontSize: '1.2rem',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎂</div>
        <div>Loading your birthday surprise...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const mainRef = useRef<HTMLElement>(null);

  // Keyboard controls — placed here in the DOM tree (NOT inside Canvas)
  useControls();

  // Auto-focus the game container when game starts
  useEffect(() => {
    if (gameStarted && mainRef.current) {
      mainRef.current.focus();
    }
  }, [gameStarted]);

  return (
    <main
      ref={mainRef}
      tabIndex={0}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        outline: 'none',
      }}
      onClick={() => mainRef.current?.focus()}
    >
      <StartScreen />
      {gameStarted && (
        <>
          <Scene />
          <HUD />
          <MessageOverlay />
          <MobileControls />
        </>
      )}
    </main>
  );
}

