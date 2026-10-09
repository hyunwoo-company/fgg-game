'use client';

import type { ClientPlayer } from '@fgg/game-logic';

interface PlayerSeatProps {
  player: ClientPlayer;
  isMe: boolean;
  isTurn: boolean;
  passed?: boolean;
  size?: 'sm' | 'md';
  /** @deprecated 패뒷면은 더 이상 표시 안 함 */
  showFan?: boolean;
}

export function PlayerSeat({
  player,
  isMe,
  isTurn,
  passed = false,
  size = 'md',
}: PlayerSeatProps) {
  const dims =
    size === 'sm'
      ? { name: 11, stat: 10, padX: 9, padY: 4 }
      : { name: 12, stat: 11, padX: 11, padY: 5 };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        padding: `${dims.padY}px ${dims.padX}px`,
        borderRadius: 8,
        background: isTurn ? 'rgba(212,166,86,0.18)' : 'rgba(10,15,13,0.7)',
        border: `1px solid ${
          isTurn ? 'var(--fgg-gold)' : !player.isConnected ? 'rgba(230,57,70,0.5)' : 'var(--fgg-line)'
        }`,
        boxShadow: isTurn
          ? '0 0 14px rgba(242,200,120,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 3px 8px rgba(0,0,0,0.3)',
        opacity: passed ? 0.45 : 1,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        transition: 'all 220ms',
        whiteSpace: 'nowrap',
        lineHeight: 1.1,
      }}
    >
      {/* 닉네임 */}
      <span
        style={{
          fontSize: dims.name,
          fontWeight: 600,
          color: isTurn ? 'var(--fgg-gold-bright)' : isMe ? 'var(--fgg-cheongryong)' : 'var(--fgg-text)',
          maxWidth: 90,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {player.name}
        {passed && !isTurn && (
          <span style={{ fontSize: 8, color: '#FF8088', fontWeight: 700 }}>PASS</span>
        )}
        {!player.isConnected && <span style={{ fontSize: 8, color: '#FF8088' }}>⚠</span>}
      </span>

      {/* 패개수 · 코인 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          fontSize: dims.stat,
          fontFamily: 'var(--fgg-font-num)',
        }}
      >
        <span
          style={{
            color: 'var(--fgg-gold-bright)',
            fontWeight: 700,
          }}
          title="남은 타일"
        >
          🀫{player.handCount}
        </span>
        <span style={{ color: 'var(--fgg-text-dim)' }} title="칩">
          💰{player.chips}
        </span>
      </div>
    </div>
  );
}
