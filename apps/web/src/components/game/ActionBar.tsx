'use client';

import { useMemo, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { findPlayableCombinations, getMaxNumber } from '@/lib/suggestions';
import { detectCombination, canPlay as canPlayCombo } from '@lexio/game-logic';
import type { Tile } from '@lexio/game-logic';

interface ActionBarProps {
  isMyTurn: boolean;
  selectedCount: number;
  onPlay: () => void;
  onPass: () => void;
  onSort?: () => void;
  sortMode?: 'number' | 'suit';
}

export function ActionBar({
  isMyTurn,
  selectedCount,
  onPlay,
  onPass,
  onSort,
  sortMode = 'number',
}: ActionBarProps) {
  const { gameState, roomInfo, myId, selectTiles, selectedTileIds } = useGameStore();
  const hintIndexRef = useRef(0);

  const myHand = useMemo(() => {
    const me = gameState?.players.find((p) => p.id === myId);
    return (me?.hand ?? []) as Tile[];
  }, [gameState, myId]);

  const suggestions = useMemo(() => {
    if (!isMyTurn || !gameState || myHand.length === 0) return [];
    const maxNumber = getMaxNumber(gameState, roomInfo?.mode);
    return findPlayableCombinations(myHand, gameState.lastPlay, maxNumber);
  }, [isMyTurn, gameState, roomInfo?.mode, myHand]);

  // 클라이언트 측 즉시 검증 — 선택한 패가 valid combination인지 + lastPlay보다 강한지
  const playValidity = useMemo<{
    canPlay: boolean;
    reason?: '4tiles' | 'invalidCombo' | 'weakerThanLast' | 'noSelection';
  }>(() => {
    if (!isMyTurn) return { canPlay: false, reason: 'noSelection' };
    if (selectedCount === 0) return { canPlay: false, reason: 'noSelection' };
    if (selectedCount === 4) return { canPlay: false, reason: '4tiles' };
    if (!gameState) return { canPlay: false, reason: 'noSelection' };
    const selectedTiles = myHand.filter((t) => selectedTileIds.includes(t.id));
    if (selectedTiles.length === 0) return { canPlay: false, reason: 'noSelection' };
    const maxNumber = getMaxNumber(gameState, roomInfo?.mode);
    const combo = detectCombination(selectedTiles, maxNumber);
    if (!combo) return { canPlay: false, reason: 'invalidCombo' };
    if (gameState.lastPlay && !canPlayCombo(combo, gameState.lastPlay)) {
      return { canPlay: false, reason: 'weakerThanLast' };
    }
    return { canPlay: true };
  }, [isMyTurn, selectedCount, gameState, roomInfo?.mode, myHand, selectedTileIds]);

  // 추천 cycle: [combo0, combo1, ..., comboN-1, deselect] → 다시 처음부터
  const handleHint = () => {
    if (suggestions.length === 0) return;
    const cycleLen = suggestions.length + 1;
    const cur = hintIndexRef.current % cycleLen;
    if (cur === suggestions.length) {
      selectTiles([]); // 모든 추천 본 후 한 번 더 누르면 선택 해제
    } else {
      const combo = suggestions[cur];
      selectTiles(combo.tiles.map((t) => t.id));
    }
    hintIndexRef.current = (cur + 1) % cycleLen;
  };

  const canPlay = playValidity.canPlay;
  const showInvalidWarning = playValidity.reason === '4tiles';
  const showWeakWarning = playValidity.reason === 'weakerThanLast';
  const showInvalidCombo = playValidity.reason === 'invalidCombo';

  // 작은 vertical 버튼 공통 스타일
  const sideBtn: React.CSSProperties = {
    width: 56,
    height: 44,
    padding: 0,
    borderRadius: 10,
    border: '1px solid var(--fgg-line)',
    background: 'rgba(10,15,13,0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 140ms',
    fontSize: 11,
    fontWeight: 600,
  };

  const sortBtn = (mode: 'number' | 'suit', label: string): React.CSSProperties => ({
    ...sideBtn,
    height: 36,
    border: `1px solid ${sortMode === mode ? 'var(--fgg-gold)' : 'var(--fgg-line)'}`,
    background: sortMode === mode ? 'rgba(212,166,86,0.15)' : 'rgba(10,15,13,0.7)',
    color: sortMode === mode ? 'var(--fgg-gold-bright)' : 'var(--fgg-text-dim)',
    fontSize: 11,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 8,
        alignItems: 'stretch',
      }}
    >
      {/* 정렬 — 숫자 / 문양 두 패널 */}
      {onSort && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => sortMode !== 'number' && onSort()}
            style={sortBtn('number', '숫자')}
            title="숫자순 정렬"
          >
            숫자
          </button>
          <button
            onClick={() => sortMode !== 'suit' && onSort()}
            style={sortBtn('suit', '문양')}
            title="문양순 정렬"
          >
            문양
          </button>
        </div>
      )}

      {/* 추천 (💡 아이콘만) */}
      <button
        onClick={handleHint}
        disabled={!isMyTurn || suggestions.length === 0}
        title={
          suggestions.length > 0
            ? `낼 수 있는 조합 ${suggestions.length}가지`
            : '낼 수 있는 조합 없음'
        }
        style={{
          ...sideBtn,
          height: 44,
          border: `1px dashed ${
            suggestions.length > 0 && isMyTurn ? 'var(--fgg-gold)' : 'var(--fgg-line)'
          }`,
          color:
            suggestions.length > 0 && isMyTurn
              ? 'var(--fgg-gold-bright)'
              : 'var(--fgg-text-muted)',
          cursor: suggestions.length > 0 && isMyTurn ? 'pointer' : 'not-allowed',
          opacity: !isMyTurn ? 0.4 : 1,
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>💡</span>
      </button>

      {/* 검증 메시지 */}
      {showInvalidWarning && (
        <div style={warnBox('var(--fgg-jujak)')}>⚠ 4개<br />불가</div>
      )}
      {showInvalidCombo && (
        <div style={warnBox('var(--fgg-jujak)')}>⚠ 잘못된<br />조합</div>
      )}
      {showWeakWarning && (
        <div style={warnBox('var(--fgg-jujak)')}>⚠ 더 강한<br />패 필요</div>
      )}
      {selectedCount > 0 && !showInvalidWarning && !showInvalidCombo && !showWeakWarning && (
        <div
          style={{
            fontSize: 10,
            color: canPlay ? 'var(--fgg-gold-bright)' : 'var(--fgg-text-dim)',
            textAlign: 'center',
            fontFamily: 'var(--fgg-font-num)',
            fontWeight: canPlay ? 700 : 400,
          }}
        >
          {selectedCount}개
        </div>
      )}

      {/* 패스 */}
      <button
        onClick={onPass}
        disabled={!isMyTurn}
        style={{
          ...sideBtn,
          height: 48,
          border: '1px solid #8E3540',
          background: 'linear-gradient(180deg, #5A2128 0%, #2E0F14 100%)',
          color: '#FFD0D0',
          cursor: isMyTurn ? 'pointer' : 'not-allowed',
          opacity: isMyTurn ? 1 : 0.4,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        패스
      </button>

      {/* 내기 (체크 ✓ 골드 primary) */}
      <button
        onClick={onPlay}
        disabled={!canPlay}
        title="내기"
        aria-label="내기"
        style={{
          ...sideBtn,
          height: 56,
          border: '1px solid var(--fgg-gold-deep)',
          background: canPlay
            ? 'linear-gradient(180deg, var(--fgg-gold-bright) 0%, var(--fgg-gold) 50%, var(--fgg-gold-deep) 100%)'
            : 'rgba(212,166,86,0.15)',
          color: canPlay ? '#1A1408' : 'var(--fgg-text-muted)',
          boxShadow: canPlay
            ? '0 4px 14px rgba(212, 166, 86, 0.45), inset 0 1px 0 rgba(255,255,255,0.3)'
            : 'none',
          cursor: canPlay ? 'pointer' : 'not-allowed',
          opacity: canPlay ? 1 : 0.5,
          fontSize: 22,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        ✓
      </button>
    </div>
  );
}

// 검증 메시지 박스 헬퍼
function warnBox(color: string): React.CSSProperties {
  return {
    fontSize: 9,
    color,
    textAlign: 'center',
    lineHeight: 1.15,
    fontWeight: 600,
    padding: '3px 4px',
    border: `1px solid ${color}55`,
    borderRadius: 6,
    background: `${color}1a`,
  };
}
