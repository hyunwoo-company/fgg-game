'use client';

import { create } from 'zustand';
import type { ClientGameState, RoundResult, GameMode } from '@fgg/game-logic';

export interface RoomInfo {
  id: string;
  players: { id: string; name: string; isReady: boolean }[];
  playerCount: number;
  isPlaying: boolean;
  mode?: GameMode;
}

interface GameStore {
  roomId: string | null;
  myId: string | null;
  myName: string | null;
  roomInfo: RoomInfo | null;
  gameState: ClientGameState | null;
  selectedTileIds: string[];
  /** 사용자 손패 정렬 순서 (drag로 재배치한 결과). 빈 배열이면 자동 정렬. */
  customHandOrder: string[];
  roundResult: RoundResult | null;
  error: string | null;

  setRoom: (roomId: string, myId: string, myName: string) => void;
  setRoomInfo: (info: RoomInfo) => void;
  setGameState: (state: ClientGameState) => void;
  setRoundResult: (result: RoundResult) => void;
  toggleTile: (tileId: string) => void;
  selectTiles: (tileIds: string[]) => void;
  clearSelection: () => void;
  setCustomHandOrder: (ids: string[]) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  roomId: null,
  myId: null,
  myName: null,
  roomInfo: null,
  gameState: null,
  selectedTileIds: [],
  customHandOrder: [],
  roundResult: null,
  error: null,

  setRoom: (roomId, myId, myName) => set({ roomId, myId, myName }),
  setRoomInfo: (info) => set({ roomInfo: info }),
  setGameState: (state) => set({ gameState: state, roundResult: null }),
  setRoundResult: (result) => set({ roundResult: result }),
  toggleTile: (tileId) =>
    set((s) => ({
      selectedTileIds: s.selectedTileIds.includes(tileId)
        ? s.selectedTileIds.filter((id) => id !== tileId)
        : [...s.selectedTileIds, tileId],
    })),
  selectTiles: (tileIds) => set({ selectedTileIds: tileIds }),
  clearSelection: () => set({ selectedTileIds: [] }),
  setCustomHandOrder: (ids) => set({ customHandOrder: ids }),
  setError: (msg) => set({ error: msg }),
  reset: () =>
    set({ roomId: null, myId: null, myName: null, roomInfo: null, gameState: null, selectedTileIds: [], customHandOrder: [], roundResult: null, error: null }),
}));
