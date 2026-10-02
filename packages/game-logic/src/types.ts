export type Suit = 'sun' | 'moon' | 'star' | 'cloud';

export type TileNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export interface Tile {
  id: string;
  number: TileNumber;
  suit: Suit;
}

export type CombinationType =
  | 'single'
  | 'pair'
  | 'triple'
  | 'straight'
  | 'flush'
  | 'fullhouse'
  | 'fourcard'
  | 'straightflush';

export interface TileCombination {
  tiles: Tile[];
  type: CombinationType;
  strength: number;
}

export type GamePhase = 'waiting' | 'playing' | 'scoring' | 'finished';

export interface Player {
  id: string;
  name: string;
  hand: Tile[];
  chips: number;
  isConnected: boolean;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  lastPlay: TileCombination | null;
  lastPlayerId: string | null;
  passCount: number;
  roundNumber: number;
  firstPlayerId: string | null;
}

export type PlayerCount = 3 | 4 | 5;

/** 게임 모드:
 *   - 'recommended': 기존 룰. 인원수에 따라 max number/배분 자동 (3p=1~9, 4p=1~13, 5p=1~15)
 *   - 'full':        모든 인원 1~15 사용. tilesPerPlayer = 60/playerCount
 */
export type GameMode = 'recommended' | 'full';

export interface GameConfig {
  playerCount: PlayerCount;
  maxNumber: 9 | 13 | 15;
  tilesPerPlayer: number;
  mode?: GameMode;
}

export interface ChipExchange {
  fromId: string;
  toId: string;
  amount: number;
}

export interface RoundResult {
  exchanges: ChipExchange[];
  penalizedPlayers: { playerId: string; tileCount: number; penaltyMultiplier: number }[];
}

export interface ClientGameState extends Omit<GameState, 'players'> {
  players: ClientPlayer[];
  /** 해당 라운드 설정: 도중 인원이 줄어도 유지됨. */
  config?: GameConfig;
  /** 전원 패스/재접속 후에도 라운드 최초 선과 새 선을 구분. */
  hasPlayedThisRound?: boolean;
}

export interface ClientPlayer extends Omit<Player, 'hand'> {
  handCount: number;
  hand?: Tile[];
}
