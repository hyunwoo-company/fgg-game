'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';
import { getClientId } from '@/lib/clientId';
import type { ClientGameState, RoundResult } from '@fgg/game-logic';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      auth: { clientId: getClientId() },
    });
  }
  return socket;
}

export function useSocket() {
  const { setGameState, setRoundResult, setError } = useGameStore();
  const attached = useRef(false);

  useEffect(() => {
    if (attached.current) return;
    attached.current = true;

    const s = getSocket();
    if (!s.connected) s.connect();

    s.on('game:started', (state: ClientGameState) => setGameState(state));
    s.on('game:stateSync', (state: ClientGameState) => setGameState(state));
    s.on('game:roundEnd', ({ state, roundResult }: { state: ClientGameState; roundResult: RoundResult }) => {
      setGameState(state);
      setRoundResult(roundResult);
    });
    // 인원 부족으로 게임 강제 종료 — 정산 화면으로 전환 + 사유 토스트
    s.on('game:forceEnd', ({ reason, roundResult }: { reason: string; roundResult: RoundResult }) => {
      setError(reason);
      setRoundResult(roundResult);
      // gameState.phase는 서버에서 'scoring'으로 동기화됨. forceEnd 별도 플래그는 RoundResult로 표시.
    });
    s.on('game:invalid', ({ reason }: { reason: string }) => setError(reason));
    s.on('room:error', ({ reason }: { reason: string }) => setError(reason));

    return () => {
      s.off('game:started');
      s.off('game:stateSync');
      s.off('game:roundEnd');
      s.off('game:forceEnd');
      s.off('game:invalid');
      s.off('room:error');
      attached.current = false;
    };
  }, [setGameState, setRoundResult, setError]);

  return getSocket();
}
