'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

const KEY_MAP: Record<string, string> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  // Fallback for e.key (some browsers/layouts)
  w: 'forward',
  W: 'forward',
  s: 'backward',
  S: 'backward',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

export function useControls() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const control = KEY_MAP[e.code] || KEY_MAP[e.key];
      if (control) {
        e.preventDefault();
        e.stopPropagation();
        useGameStore.getState().setControls({ [control]: true });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const control = KEY_MAP[e.code] || KEY_MAP[e.key];
      if (control) {
        e.preventDefault();
        e.stopPropagation();
        useGameStore.getState().setControls({ [control]: false });
      }
    };

    // Use document for most reliable event capture
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, []);
}

