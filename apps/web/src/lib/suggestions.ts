import { detectCombination, canPlay, getGameConfig } from '@fgg/game-logic';
import type { Tile, TileCombination, TileNumber, ClientGameState, GameMode } from '@fgg/game-logic';

function getCombos<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  return [
    ...getCombos(rest, size - 1).map((c) => [first, ...c]),
    ...getCombos(rest, size),
  ];
}

const TYPE_ORDER: Record<string, number> = {
  straight: 0, flush: 1, fullhouse: 2, fourcard: 3, straightflush: 4,
};

export function findPlayableCombinations(
  hand: Tile[],
  lastPlay: TileCombination | null,
  maxNumber: TileNumber = 15,
): TileCombination[] {
  // lastPlay가 있으면 같은 개수만, 없으면 모든 개수 (첫 선)
  const sizes = lastPlay ? [lastPlay.tiles.length] : [1, 2, 3, 5];
  const results: TileCombination[] = [];

  for (const size of sizes) {
    if (hand.length < size) continue;
    for (const tiles of getCombos(hand, size)) {
      const combo = detectCombination(tiles, maxNumber);
      if (!combo) continue;
      if (lastPlay && !canPlay(combo, lastPlay)) continue;
      results.push(combo);
    }
  }

  // 약한 것부터 정렬 (최소한으로 이기는 조합 먼저 제안)
  return results.sort((a, b) => {
    const ta = TYPE_ORDER[a.type] ?? -1;
    const tb = TYPE_ORDER[b.type] ?? -1;
    if (ta !== tb) return ta - tb;
    return a.strength - b.strength;
  });
}

export function getMaxNumber(state: ClientGameState, mode: GameMode = 'recommended'): TileNumber {
  if (state.config) return state.config.maxNumber;
  const count = state.players.length;
  return getGameConfig(count === 3 || count === 4 ? count : 5, mode).maxNumber;
}
