'use client';

import { useGameStore } from '@/store/gameStore';

export default function MobileControls() {
  const setControls = useGameStore((s) => s.setControls);

  const handlePointerDown = (control: string) => {
    setControls({ [control]: true });
  };

  const handlePointerUp = (control: string) => {
    setControls({ [control]: false });
  };

  const buttonStyle = (color: string): React.CSSProperties => ({
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.4)',
    background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
    backdropFilter: 'blur(8px)',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    transition: 'transform 0.1s',
  });

  return (
    <div
      id="mobile-controls"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Left side: steering */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <button
          id="btn-left"
          style={buttonStyle('#9b59b6')}
          onPointerDown={() => handlePointerDown('left')}
          onPointerUp={() => handlePointerUp('left')}
          onPointerLeave={() => handlePointerUp('left')}
          onContextMenu={(e) => e.preventDefault()}
        >
          ◀
        </button>
        <button
          id="btn-right"
          style={buttonStyle('#9b59b6')}
          onPointerDown={() => handlePointerDown('right')}
          onPointerUp={() => handlePointerUp('right')}
          onPointerLeave={() => handlePointerUp('right')}
          onContextMenu={(e) => e.preventDefault()}
        >
          ▶
        </button>
      </div>

      {/* Right side: throttle */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <button
          id="btn-forward"
          style={buttonStyle('#2ecc71')}
          onPointerDown={() => handlePointerDown('forward')}
          onPointerUp={() => handlePointerUp('forward')}
          onPointerLeave={() => handlePointerUp('forward')}
          onContextMenu={(e) => e.preventDefault()}
        >
          ▲
        </button>
        <button
          id="btn-backward"
          style={buttonStyle('#e74c3c')}
          onPointerDown={() => handlePointerDown('backward')}
          onPointerUp={() => handlePointerUp('backward')}
          onPointerLeave={() => handlePointerUp('backward')}
          onContextMenu={(e) => e.preventDefault()}
        >
          ▼
        </button>
      </div>
    </div>
  );
}
