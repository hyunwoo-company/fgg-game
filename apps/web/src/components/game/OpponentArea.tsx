'use client';

import { TileBack } from '@/components/tile/Tile';
import type { ClientPlayer } from '@fgg/game-logic';

interface OpponentAreaProps {
  player: ClientPlayer;
  isCurrentTurn: boolean;
}

export function OpponentArea({ player, isCurrentTurn }: OpponentAreaProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 12px',
        borderRadius: 12,
        background: isCurrentTurn ? 'rgba(212,166,86,0.12)' : 'rgba(0,0,0,0.25)',
        border: isCurrentTurn ? '1.5px solid var(--fgg-gold)' : '1.5px solid var(--fgg-line)',
        boxShadow: isCurrentTurn ? '0 0 18px rgba(212,166,86,0.25)' : 'none',
        transition: 'all 0.2s ease',
        minWidth: 90,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--fgg-font-display, Georgia, serif)',
            color: isCurrentTurn ? 'var(--fgg-gold-bright)' : 'var(--fgg-text-dim)',
            maxWidth: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {player.name}
        </span>
        {isCurrentTurn && (
          <span style={{ fontSize: 10, color: 'var(--fgg-gold)', animation: 'pulse 1s infinite' }}>▲</span>
        )}
      </div>

      <span style={{ fontSize: 10, color: 'var(--fgg-text-muted)' }}>
        💰 {player.chips}
      </span>

      {/* 컴팩트 뷰: 패뒷면 1장 + 개수 표시 */}
      {player.handCount > 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--fgg-line)',
          }}
        >
          <div style={{ position: 'relative', width: 22, height: 32 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, transform: 'rotate(-4deg)' }}>
              <TileBack size="sm" />
            </div>
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--fgg-text)',
              fontFamily: 'var(--fgg-font-num, Georgia, serif)',
            }}
          >
            ×{player.handCount}
          </span>
        </div>
      ) : (
        <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>완료!</span>
      )}

      {!player.isConnected && (
        <span style={{ fontSize: 10, color: '#ef4444' }}>연결 끊김</span>
      )}
    </div>
  );
}
