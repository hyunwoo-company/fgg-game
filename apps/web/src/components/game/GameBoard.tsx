'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { clearSession } from '@/lib/clientId';
import { PlayerSeat } from './PlayerSeat';
import { CenterField } from './CenterField';
import { RoundHeader } from './RoundHeader';
import { PlayerHand } from './PlayerHand';
import { ActionBar } from './ActionBar';
import { ScoreBoard } from './ScoreBoard';
import { GuidePanel } from './GuidePanel';
import type { ClientPlayer, Tile } from '@fgg/game-logic';

// 상대 좌석을 좌측 vertical list로 배치 (루미큐브 스타일) — 카드 컴팩트하게 가까이
// 0번 = me (하단 중앙, 별도 처리). 1번~ = 좌측에 위→아래로 list.
const RIVAL_VERTICAL_POSITIONS: Record<3 | 4 | 5, number[]> = {
  3: [12, 30],            // 상대 2명
  4: [12, 28, 44],        // 상대 3명
  5: [12, 26, 40, 54],    // 상대 4명
};

// 내 자리(0번) 다음부터 시계방향으로 상대 배치 — gameState.players의 순서를 좌석 인덱스에 매핑
function makeSeatedPlayers(players: ClientPlayer[], myId: string): { player: ClientPlayer; seatIdx: number }[] {
  const meIdx = players.findIndex((p) => p.id === myId);
  if (meIdx < 0) return players.map((p, i) => ({ player: p, seatIdx: i }));
  const ordered: ClientPlayer[] = [];
  for (let k = 0; k < players.length; k++) {
    ordered.push(players[(meIdx + k) % players.length]);
  }
  return ordered.map((p, i) => ({ player: p, seatIdx: i }));
}

export function GameBoard() {
  const { gameState, myId, roomId, selectedTileIds, clearSelection, setError, roundResult, error, reset } = useGameStore();
  const socket = useSocket();
  const router = useRouter();
  const [sortMode, setSortMode] = useState<'number' | 'suit'>('number');
  const [guideOpen, setGuideOpen] = useState(false);

  const handleLeave = () => {
    if (!confirm('정말 나가시겠습니까? 인원이 3명 미만이 되면 게임이 종료됩니다.')) return;
    // server 미연결 환경(/test/*, 네트워크 단절 등)에서도 안전하게 동작
    try {
      if (roomId && socket && socket.connected) {
        socket.emit('room:leave', { roomId });
      }
    } catch {/* noop */}
    try { clearSession(); } catch {/* noop */}
    reset();
    router.push('/');
  };

  // viewport 방향 감지 — 세로(portrait) / 가로(landscape) 둘 다 지원
  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  // 모바일 브라우저 주소창 hide 트리거 — 초기 mount 시점만, scoring/scroll 가능 화면 방해 안 하게
  useEffect(() => {
    // scoring phase에선 trigger 비활성 — 정산 화면 스크롤이 막히면 다음라운드 버튼을 못 누름
    if (gameState?.phase === 'scoring') return;
    const trigger = () => {
      try {
        window.requestAnimationFrame(() => {
          window.scrollTo(0, 1);
        });
      } catch {/* noop */}
    };
    trigger();
    const timers = [
      window.setTimeout(trigger, 50),
      window.setTimeout(trigger, 250),
      window.setTimeout(trigger, 800),
    ];
    const onOrientation = () => {
      window.setTimeout(trigger, 100);
      window.setTimeout(trigger, 500);
    };
    window.addEventListener('orientationchange', onOrientation);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('orientationchange', onOrientation);
    };
  }, [gameState?.phase]);

  // 턴 타이머 — 매 턴 시작 시 60초 reset, 0 도달 시 자동 pass
  const TURN_SECONDS = 60;
  const [turnSecondsLeft, setTurnSecondsLeft] = useState(TURN_SECONDS);
  const currentPlayerId = gameState?.players[gameState.currentPlayerIndex]?.id;
  useEffect(() => {
    setTurnSecondsLeft(TURN_SECONDS);
  }, [currentPlayerId, gameState?.roundNumber]);
  useEffect(() => {
    if (!currentPlayerId) return;
    const tid = window.setInterval(() => {
      setTurnSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(tid);
  }, [currentPlayerId]);

  // Hook 순서를 유지하며, 턴 전환 snapshot의 이전 0초로 자동 패스하지 않도록 시간 변경만 감지.
  useEffect(() => {
    if (turnSecondsLeft === 0 && gameState && currentPlayerId === myId && roomId) {
      socket.emit('game:pass', { roomId });
      clearSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnSecondsLeft]);

  if (!gameState || !myId || !roomId) return null;

  const playerCount = gameState.players.length as 3 | 4 | 5;
  const rivalYs = RIVAL_VERTICAL_POSITIONS[playerCount] ?? RIVAL_VERTICAL_POSITIONS[4];
  const seated = makeSeatedPlayers(gameState.players, myId);
  const me = gameState.players.find((p) => p.id === myId);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === myId;
  const playerNames = Object.fromEntries(gameState.players.map((p) => [p.id, p.name]));
  const lastPlayerName = gameState.lastPlayerId ? playerNames[gameState.lastPlayerId] : undefined;

  const handlePlay = () => {
    if (selectedTileIds.length === 0) return;
    socket.emit('game:play', { roomId, tileIds: selectedTileIds });
    clearSelection();
  };

  const handlePass = () => {
    socket.emit('game:pass', { roomId });
    clearSelection();
  };

  const isGameOver = gameState.phase === 'scoring' && gameState.players.length < 3;

  const handleReady = () => {
    if (isGameOver) {
      // 인원 부족 종료 — 로비로 복귀
      if (roomId) socket.emit('room:leave', { roomId });
      clearSession();
      reset();
      router.push('/');
      return;
    }
    socket.emit('game:ready', { roomId });
  };

  if (roundResult && gameState.phase === 'scoring') {
    return (
      <div
        className="fgg-felt"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 16,
          overflowY: 'auto',
        }}
      >
        <ScoreBoard
          gameState={gameState}
          roundResult={roundResult}
          onReady={handleReady}
          isGameOver={isGameOver}
          endReason={isGameOver ? error ?? '인원 부족으로 게임이 종료되었습니다.' : undefined}
        />
      </div>
    );
  }

  return (
    <div
      className="fgg-felt"
      style={{
        // 약간(2px) 더 크게 → 모바일 브라우저가 scroll 가능하다고 판단해 주소창 자동 hide
        minHeight: 'calc(100dvh + 2px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 비네트 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* 황동 테이블 림 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '6px solid #2A1F0F',
          boxShadow: 'inset 0 0 0 1px var(--fgg-line-strong), inset 0 0 60px rgba(0,0,0,0.45)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* 좌상단: 나가기 — 황동 림(zIndex 10) 위로 표시 */}
      <button
        onClick={handleLeave}
        title="방 나가기"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 12,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(10,15,13,0.85)',
          border: '1px solid var(--fgg-line)',
          color: 'var(--fgg-text-dim)',
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(6px)',
        }}
      >
        ←
      </button>

      {/* 우상단: 족보 가이드 — viewport 우측 끝, 액션바(vertical center)와 겹치지 않음 */}
      <button
        onClick={() => setGuideOpen(true)}
        title="족보 보기"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 12,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(10,15,13,0.85)',
          border: '1px solid var(--fgg-line)',
          color: 'var(--fgg-gold-bright)',
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(6px)',
        }}
      >
        📖
      </button>

      <GuidePanel open={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* 라운드 헤더 */}
      <RoundHeader
        round={gameState.roundNumber}
        currentTurnName={currentPlayer?.name ?? '?'}
        roomCode={roomId}
        turnSecondsLeft={turnSecondsLeft}
        turnTotalSeconds={TURN_SECONDS}
      />

      {/* Oval 테이블 + 중앙필드를 담는 메인 영역 — 좌측 상대 list / 우측 ActionBar 회피 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          perspective: '700px',
          perspectiveOrigin: '50% 110%',
          paddingLeft: isPortrait ? 100 : 124 /* 좌측 상대 list 영역 회피 */,
          paddingRight: isPortrait ? 60 : 64 /* 우측 ActionBar 영역 회피 */,
        }}
      >
        {/* Oval table — 진짜 3D 기울기로 카지노 테이블 시점 (앞 가까움, 뒤 멀어짐) */}
        <div
          style={{
            position: 'absolute',
            left: '4%',
            right: '4%',
            top: '8%',
            bottom: '6%',
            borderRadius: '50% / 38%',
            border: '3px solid rgba(212, 166, 86, 0.55)',
            background:
              'radial-gradient(ellipse at center 35%, rgba(46, 120, 88, 0.88) 0%, rgba(24, 78, 56, 0.7) 45%, rgba(12, 50, 36, 0.4) 80%)',
            boxShadow:
              'inset 0 0 120px rgba(0,0,0,0.55), inset 0 -20px 40px rgba(0,0,0,0.35), 0 30px 60px rgba(0,0,0,0.6)',
            transform: 'rotateX(58deg)',
            transformOrigin: '50% 100%',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {/* 황금 핀스트라이프 */}
          <div
            style={{
              position: 'absolute',
              inset: 14,
              border: '1.5px solid rgba(212, 166, 86, 0.3)',
              borderRadius: '50% / 38%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 32,
              border: '1px dashed rgba(212, 166, 86, 0.18)',
              borderRadius: '50% / 38%',
            }}
          />
          {/* 펠트 패턴 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              backgroundImage:
                'repeating-radial-gradient(circle at 50% 30%, rgba(255,255,255,0.02) 0 1px, transparent 1px 4px)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* 중앙 필드 (perspective 시점에서 가까운 쪽 = 테이블 아래쪽 가운데) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '72%',
            transform: 'translate(-50%, -50%)',
            zIndex: 4,
          }}
        >
          <CenterField lastPlay={gameState.lastPlay} lastPlayerName={lastPlayerName} hasPlayedThisRound={gameState.hasPlayedThisRound ?? Boolean(gameState.lastPlay)} />
        </div>

      </div>

      {/* 좌측 상대 list — viewport 좌측 column에 vertical 배치 (루미큐브 스타일) */}
      {seated.map(({ player, seatIdx }) => {
        if (seatIdx === 0) return null;
        const rivalIdx = seatIdx - 1;
        const y = rivalYs[rivalIdx];
        if (y === undefined) return null;
        const isTurn = currentPlayer?.id === player.id;
        return (
          <div
            key={player.id}
            style={{
              position: 'absolute',
              left: 6,
              top: `${y}%`,
              transform: 'translateY(-50%)',
              zIndex: 7,
            }}
          >
            <PlayerSeat
              player={player}
              isMe={false}
              isTurn={isTurn}
              size="sm"
              showFan={true}
            />
          </div>
        );
      })}

      {/* 우측 액션 패널 — 루미큐브 스타일 vertical (viewport 우측 가운데) */}
      <div
        style={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 7,
          pointerEvents: 'auto',
        }}
      >
        <ActionBar
          isMyTurn={isMyTurn}
          selectedCount={selectedTileIds.length}
          onPlay={handlePlay}
          onPass={handlePass}
          onSort={() => setSortMode(sortMode === 'number' ? 'suit' : 'number')}
          sortMode={sortMode}
        />
      </div>

      {/* 하단: 내 손패 (우측 액션 패널 영역 제외) */}
      <div
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(10,15,13,0.6) 100%)',
          borderTop: '1px solid var(--fgg-line)',
          zIndex: 6,
          position: 'relative',
          paddingRight: 76 /* 우측 ActionBar(56) + 4 + 여유 */,
        }}
      >
        {/* 내 identity strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '6px 18px 0',
          }}
        >
          {me && (
            <PlayerSeat
              player={me}
              isMe={true}
              isTurn={isMyTurn}
              size="sm"
              showFan={false}
            />
          )}
        </div>

        {/* 손패 — portrait에서는 2~3줄로 wrap */}
        <PlayerHand
          hand={(me?.hand ?? []) as Tile[]}
          isMyTurn={isMyTurn}
          sortMode={sortMode}
          isPortrait={isPortrait}
        />
      </div>

      {/* 에러 토스트 */}
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#b91c1c',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            whiteSpace: 'nowrap',
          }}
        >
          {error}
          <button
            style={{
              textDecoration: 'underline',
              fontSize: 13,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: '#fff',
            }}
            onClick={() => setError(null)}
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
