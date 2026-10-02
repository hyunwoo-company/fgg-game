import { ALL_SUITS, FIRST_PLAYER_TILE } from './constants';
import type { Tile, TileNumber, GameConfig } from './types';

export function createDeck(config: GameConfig): Tile[] {
  const tiles: Tile[] = [];
  for (let n = 1; n <= config.maxNumber; n++) {
    for (const suit of ALL_SUITS) {
      tiles.push({ id: `${suit}-${n}`, number: n as TileNumber, suit });
    }
  }
  return tiles;
}

export function shuffleDeck(deck: Tile[]): Tile[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function dealTiles(deck: Tile[], config: GameConfig): Tile[][] {
  const hands: Tile[][] = Array.from({ length: config.playerCount }, () => []);
  for (let i = 0; i < config.playerCount * config.tilesPerPlayer; i++) {
    hands[i % config.playerCount].push(deck[i]);
  }
  return hands;
}

// 매 라운드 백호 3 보유자가 선
export function findFirstPlayer(hands: Tile[][]): number {
  for (let i = 0; i < hands.length; i++) {
    if (hands[i].some((t) => t.suit === FIRST_PLAYER_TILE.suit && t.number === FIRST_PLAYER_TILE.number)) return i;
  }
  return 0;
}
