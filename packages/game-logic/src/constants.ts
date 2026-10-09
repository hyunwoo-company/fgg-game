import type { TileNumber, Suit, CombinationType, GameConfig, PlayerCount } from './types';

// FGG 숫자 서열: 2가 최강, 3이 최약
export const NUMBER_RANK: Record<TileNumber, number> = {
  3: 0, 4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 6,
  10: 7, 11: 8, 12: 9, 13: 10, 14: 11, 15: 12,
  1: 13, 2: 14,
};

export const TOP_NUMBER: TileNumber = 2;
export const FIRST_PLAYER_TILE = { suit: 'cloud', number: 3 } as const;

// 문양 서열: sun이 최강(3), cloud가 최약(0)
// 사신수 매핑: sun=주작 > moon=청룡 > star=현무 > cloud=백호
export const SUIT_RANK: Record<Suit, number> = {
  cloud: 0,
  star: 1,
  moon: 2,
  sun: 3,
};

// 5개 조합 족보 등급
export const COMBINATION_RANK: Record<CombinationType, number> = {
  single: -1,
  pair: -1,
  triple: -1,
  straight: 0,
  flush: 1,
  fullhouse: 2,
  fourcard: 3,
  straightflush: 4,
};

// 인원수별 게임 설정 — 'recommended' (기존 룰)
export const GAME_CONFIG: Record<PlayerCount, GameConfig> = {
  3: { playerCount: 3, maxNumber: 9, tilesPerPlayer: 12, mode: 'recommended' },
  4: { playerCount: 4, maxNumber: 13, tilesPerPlayer: 13, mode: 'recommended' },
  5: { playerCount: 5, maxNumber: 15, tilesPerPlayer: 12, mode: 'recommended' },
};

// 'full' 모드 — 모든 인원이 1~15 사용 (deck 60장 / 인원수)
export const GAME_CONFIG_FULL: Record<PlayerCount, GameConfig> = {
  3: { playerCount: 3, maxNumber: 15, tilesPerPlayer: 20, mode: 'full' },
  4: { playerCount: 4, maxNumber: 15, tilesPerPlayer: 15, mode: 'full' },
  5: { playerCount: 5, maxNumber: 15, tilesPerPlayer: 12, mode: 'full' },
};

export function getGameConfig(playerCount: PlayerCount, mode: 'recommended' | 'full' = 'recommended'): GameConfig {
  return mode === 'full' ? GAME_CONFIG_FULL[playerCount] : GAME_CONFIG[playerCount];
}

export const ALL_SUITS: Suit[] = ['sun', 'moon', 'star', 'cloud'];

// FGG 사용자 지정 사신수 대응
export const SUIT_LABEL: Record<Suit, string> = {
  sun: '주작',
  moon: '청룡',
  star: '현무',
  cloud: '백호',
};
