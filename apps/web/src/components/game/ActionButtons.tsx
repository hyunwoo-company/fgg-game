'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { findPlayableCombinations, getMaxNumber } from '@/lib/suggestions';
import type { Tile } from '@lexio/game-logic';

interface ActionButtonsProps {
  isMyTurn: boolean;
  hasSelection: boolean;
  onPlay: () => void;
  onPass: () => void;
}

export function ActionButtons({ isMyTurn, hasSelection, onPlay, onPass }: ActionButtonsProps) {
  const { gameState, roomInfo, myId, selectTiles } = useGameStore();
  const hintIndexRef = useRef(0);

  const suggestions = useMemo(() => {
    if (!isMyTurn || !gameState || !myId) return [];
    const me = gameState.players.find((p) => p.id === myId);
    const hand = (me?.hand ?? []) as Tile[];
    if (hand.length === 0) return [];
    const maxNumber = getMaxNumber(gameState, roomInfo?.mode);
    return findPlayableCombinations(hand, gameState.lastPlay, maxNumber);
  }, [isMyTurn, gameState, roomInfo?.mode, myId]);

  const handleHint = () => {
    if (suggestions.length === 0) return;
    const idx = hintIndexRef.current % suggestions.length;
    const combo = suggestions[idx];
    selectTiles(combo.tiles.map((t) => t.id));
    hintIndexRef.current = idx + 1;
  };

  // 손패 변경(차례 변경)되면 인덱스 리셋
  useEffect(() => { hintIndexRef.current = 0; }, [suggestions]);

  if (!isMyTurn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px 16px' }}>
        <span style={{ fontSize: 13, color: '#475569' }}>다른 플레이어의 차례입니다...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '8px 16px 16px' }}>
      {/* 추천 버튼 */}
      <button
        onClick={handleHint}
        disabled={suggestions.length === 0}
        title={suggestions.length > 0 ? `낼 수 있는 조합 ${suggestions.length}가지` : '낼 수 있는 조합 없음'}
        style={{
          padding: '12px 14px',
          borderRadius: 10,
          border: suggestions.length > 0 ? '1.5px solid #d97706' : '1.5px solid #1e293b',
          background: suggestions.length > 0 ? 'rgba(217,119,6,0.15)' : 'rgba(15,23,42,0.4)',
          color: suggestions.length > 0 ? '#fbbf24' : '#334155',
          fontWeight: 700,
          fontSize: 13,
          cursor: suggestions.length > 0 ? 'pointer' : 'not-allowed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          minWidth: 52,
          transition: 'all 0.1s ease',
        }}
      >
        <span style={{ fontSize: 16 }}>💡</span>
        <span style={{ fontSize: 10 }}>{suggestions.length > 0 ? suggestions.length : '없음'}</span>
      </button>

      {/* 패스 */}
      <button
        onClick={onPass}
        style={{
          padding: '12px 20px',
          borderRadius: 10,
          border: '1.5px solid #334155',
          background: 'rgba(30,41,59,0.8)',
          color: '#94a3b8',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          flex: 1,
          maxWidth: 120,
          transition: 'all 0.1s ease',
        }}
      >
        패스
      </button>

      {/* 타일 내기 */}
      <button
        onClick={onPlay}
        disabled={!hasSelection}
        style={{
          padding: '12px 20px',
          borderRadius: 10,
          border: hasSelection ? '1.5px solid #1d4ed8' : '1.5px solid #1e293b',
          background: hasSelection
            ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
            : 'rgba(15,23,42,0.6)',
          color: hasSelection ? '#fff' : '#334155',
          fontWeight: 700,
          fontSize: 14,
          cursor: hasSelection ? 'pointer' : 'not-allowed',
          flex: 2,
          maxWidth: 180,
          boxShadow: hasSelection ? '0 0 12px rgba(37,99,235,0.4)' : 'none',
          transition: 'all 0.1s ease',
        }}
      >
        {hasSelection ? '타일 내기' : '타일 선택'}
      </button>
    </div>
  );
}
