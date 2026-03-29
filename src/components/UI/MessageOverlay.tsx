'use client';

import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';

interface DisplayMessage {
  id: string;
  text: string;
  visible: boolean;
}

export default function MessageOverlay() {
  const messages = useGameStore((s) => s.messages);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);

  useEffect(() => {
    if (messages.length === 0) return;

    const latest = messages[messages.length - 1];

    // Check if already displayed
    setDisplayMessages((prev) => {
      if (prev.find((m) => m.id === latest.id)) return prev;
      const newMsg: DisplayMessage = { id: latest.id, text: latest.text, visible: true };

      // Auto-hide after 4 seconds
      setTimeout(() => {
        setDisplayMessages((p) =>
          p.map((m) => (m.id === latest.id ? { ...m, visible: false } : m))
        );
      }, 4000);

      // Remove after fade
      setTimeout(() => {
        setDisplayMessages((p) => p.filter((m) => m.id !== latest.id));
      }, 4800);

      return [...prev.slice(-3), newMsg]; // Keep max 4
    });
  }, [messages]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'none',
      }}
    >
      {displayMessages.map((msg) => (
        <div
          key={msg.id}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.95), rgba(231, 76, 60, 0.95))',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            color: 'white',
            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
            fontWeight: 700,
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            opacity: msg.visible ? 1 : 0,
            transform: msg.visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: msg.visible ? 'message-pop-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
