'use client';

import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function HUD() {
  const resetGame = useGameStore((s) => s.resetGame);
  const gameStarted = useGameStore((s) => s.gameStarted);


  if (!gameStarted) return null;

  const handleReset = () => {
    resetGame();
    window.location.reload();
  };

  return (
    <>


      {/* Reset button */}
      <button
        id="reset-button"
        onClick={handleReset}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 200,
          padding: '10px 20px',
          background: 'linear-gradient(135deg, rgba(44,62,80,0.8), rgba(52,73,94,0.8))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(231,76,60,0.8), rgba(192,57,43,0.8))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(44,62,80,0.8), rgba(52,73,94,0.8))';
        }}
      >
        🔄 Reset
      </button>

      {/* Controls hint overlay */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 200,
          padding: '10px 16px',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '12px',
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '4px', color: '#f39c12' }}>🎮 Controls</div>
        <div>W/↑ Forward | S/↓ Reverse</div>
        <div>A/← Left | D/→ Right</div>
      </div>
    </>
  );
}

