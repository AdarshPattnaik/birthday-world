'use client';

import { create } from 'zustand';

export interface BirthdayMessage {
  id: string;
  text: string;
  position: [number, number, number];
  timestamp: number;
}

interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

interface GameState {
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;

  messages: BirthdayMessage[];
  addMessage: (text: string, position: [number, number, number]) => void;
  clearMessages: () => void;
  triggeredIds: Set<string>;
  markTriggered: (id: string) => void;

  controls: Controls;
  setControls: (controls: Partial<Controls>) => void;

  confettiPosition: [number, number, number] | null;
  triggerConfetti: (position: [number, number, number]) => void;

  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameStarted: false,
  setGameStarted: (started) => set({ gameStarted: started }),

  messages: [],
  addMessage: (text, position) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}-${Math.random()}`,
          text,
          position,
          timestamp: Date.now(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  triggeredIds: new Set<string>(),
  markTriggered: (id) =>
    set((state) => {
      const newSet = new Set(state.triggeredIds);
      newSet.add(id);
      return { triggeredIds: newSet };
    }),

  controls: { forward: false, backward: false, left: false, right: false },
  setControls: (partial) =>
    set((state) => ({
      controls: { ...state.controls, ...partial },
    })),

  confettiPosition: null,
  triggerConfetti: (position) => {
    set({ confettiPosition: position });
    setTimeout(() => set({ confettiPosition: null }), 2500);
  },

  resetGame: () =>
    set({
      messages: [],
      triggeredIds: new Set<string>(),
      confettiPosition: null,
      controls: { forward: false, backward: false, left: false, right: false },
    }),
}));
