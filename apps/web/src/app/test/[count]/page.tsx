'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { GameBoard } from '@/components/game/GameBoard';
import { buildMockGame } from '@/lib/mockGame';

interface PageProps {
  params: { count: string };
}

export default function TestPage({ params }: PageProps) {
  const raw = parseInt(params.count, 10);
  const playerCount = (raw === 3 || raw === 4 || raw === 5 ? raw : 4) as 3 | 4 | 5;
  const search = useSearchParams();
  const myTurn = search.get('turn') === 'me';
  const noLastPlay = search.get('first') === '1';
  const { setRoom, setRoomInfo, setGameState } = useGameStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { myId, roomId, state } = buildMockGame(playerCount, { myTurn, noLastPlay });

    setRoom(roomId, myId, state.players[0].name);
    setRoomInfo({
      id: roomId,
      players: state.players.map((p) => ({ id: p.id, name: p.name, isReady: true })),
      playerCount,
      isPlaying: true,
      mode: state.config?.mode,
    });
    setGameState(state);
    setReady(true);
  }, [playerCount, myTurn, noLastPlay, setRoom, setRoomInfo, setGameState]);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--fgg-bg-0, #0A0F0D)',
          color: 'var(--fgg-text-dim, #B7AC8E)',
        }}
      >
        Mock 게임 데이터 주입 중…
      </div>
    );
  }

  return (
    <>
      {/* 좌상단 디버그 표식 */}
      <div
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          padding: '4px 10px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--fgg-gold-bright, #F2C878)',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid var(--fgg-line, rgba(212,166,86,0.3))',
          borderRadius: 999,
          zIndex: 999,
          pointerEvents: 'none',
        }}
      >
        TEST · {playerCount}P MOCK
      </div>
      <GameBoard />
    </>
  );
}
